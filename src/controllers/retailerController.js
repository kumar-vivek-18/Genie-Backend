
import { Retailer } from '../models/retailer.model.js';
import { User } from '../models/user.model.js';
import { UserRequest } from '../models/userRequest.model.js';
// import { Message } from '../models/message.model.js';
import { Chat } from '../models/chat.model.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (retailerId) => {
    try {
        const retailer = await Retailer.findById(retailerId);
        const accessToken = retailer.generateAccessToken();
        const refreshToken = retailer.generateRefreshToken();

        retailer.refreshToken = refreshToken;
        await retailer.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        return res.status(500).json({ message: 'Error generating while generating access and refresh token' });

    }
}

export const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.body.refreshToken || req.cookies.refreshToken;
        if (!incomingRefreshToken)
            return res.status(401).json({ message: 'Unauthorized request' });

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const retailer = await Retailer.findById(decodedToken._id);

        if (!retailer) return res.status(401).json({ message: "Ivalid incoming refresh token" });

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(retailer._id);

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200).cookie("refreshToken", refreshToken, options).cookie("accessToken", accessToken, options).json({ accessToken, refreshToken });
    }
    catch (error) {
        return res.status(401).json({ message: "Error while generating refresh token" });
    }
}

export const createNewRetailer = async (req, res) => {
    try {
        const data = req.body;
        // console.log('retailer data', data);


        const retailer = await Retailer.create({
            storeMobileNo: data.storeMobileNo, storeName: data.storeName,
            storeOwnerName: data.storeOwnerName, storeCategory: data.storeCategory,
            panCard: `${data?.panCard ? data.panCard : ""}`, homeDelivery: data.homeDelivery
        });

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(retailer._id);

        const options = {
            httpOnly: true,
            secure: true
        }
        if (!retailer)
            return res.status(500).json({ message: "Error Occured" });

        return res.status(201).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({ retailer, accessToken, refreshToken });


    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
}

export const getRetailer = async (req, res) => {
    try {
        const data = req.query;
        const retailer = await Retailer.findOne({ storeMobileNo: data.storeMobileNo });
        if (!retailer)
            return res.json({ status: 404, message: "User Not Found!" });

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(retailer._id);
        const options = {
            httpOnly: true,
            secure: true
        }
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({ retailer, accessToken, refreshToken });

    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
}

export const logoutRetailer = async (req, res) => {
    try {
        const { id } = req.body;

        const retailer = await Retailer.findByIdAndUpdate(id, { $unset: { refreshToken: true, uniqueToken: true } });

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json({ message: "Retailer logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error while logging out retailer" });
    }
}

export const editRetailerDetails = async (req, res) => {
    try {
        const data = req.body;
        const user = await Retailer.findByIdAndUpdate(data._id, data, { new: true });
        if (user) {
            return res.status(200).json(user);
        }
        else {
            return res.json({ status: 404, message: 'Retailer not found' });
        }
    } catch (error) {

        res.status(500);
        throw new Error(error.message);
    }
}


export const getRetailerHistory = async (req, res) => {
    try {
        const data = req.query;
        const UserChats = await Chat.find({
            $and: [
                {
                    $or: [
                        { requestType: "rejected" },
                        { requestType: "closedHistory" },
                        { requestType: "completed" }
                    ],

                },
                {
                    users: { $elemMatch: { refId: data.id } }
                }

            ]
        }).populate('requestId').populate('customerId').populate('retailerId', '_id uniqueToken storeCategory storeOwnerName storeName').populate('latestMessage', 'message').lean();

        // Iterate through each chat and populate users
        await Promise.all(UserChats.map(async chat => {
            // Populate each user in the users array
            await Promise.all(chat.users.map(async user => {
                const model = user.type === 'UserRequest' ? UserRequest : Retailer;
                // console.log('model', model);
                user.populatedUser = await model.findById(user.refId);
            }));
        }));

        // console.log('chats data', UserChats);


        if (UserChats.length > 0)
            return res.status(200).json(UserChats);
        else
            return res.status(404).json({ message: "Retailer Chat not found" });
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getUniqueToken = async (req, res) => {
    try {
        const data = req.query;
        const uniqueToken = await Retailer.findById(data.id);
        return res.status(200).json(uniqueToken.uniqueToken);
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getStoreCategoriesNearMe = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        if (!latitude || !longitude) return res.status(404).json("Invalid latitude or longitude");

        const storeCategories = await Retailer.distinct('storeCategory', {
            coords: {
                $geoWithin: {
                    $centerSphere: [
                        [longitude, latitude], 10 / 6371
                    ]
                }
            }
        })
        return res.status(200).json(storeCategories);
    } catch (error) {
        throw new Error(error.message);
    }
}