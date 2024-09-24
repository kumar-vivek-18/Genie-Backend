
import { Retailer } from '../models/retailer.model.js';
import { User } from '../models/user.model.js';
import { UserRequest } from '../models/userRequest.model.js';
// import { Message } from '../models/message.model.js';
import { Chat } from '../models/chat.model.js';
import jwt from 'jsonwebtoken';
import { lchown } from 'fs/promises';

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
        const incomingRefreshToken = req.query.refreshToken || req.cookies.refreshToken;
        if (!incomingRefreshToken)
            return res.status(401).json({ message: 'Unauthorized request' });

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const retailer = await Retailer.findById(decodedToken._id);

        if (!retailer) return res.status(401).json({ message: "Invalid incoming refresh token" });

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

        if (!data.storeMobileNo || !data.storeName || !data.storeOwnerName || !data.storeCategory) return res.status(403).json({ message: "Some fields are empthy" });

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
        if (!data.storeMobileNo) return res.status(403).json({ message: "Store Mobile No is required" });
        const retailer = await Retailer.findOne({ storeMobileNo: data.storeMobileNo }).lean();
        if (!retailer)
            return res.json({ status: 404, message: "User Not Found!" });

        if (retailer) {
            const { accessToken, refreshToken } = await generateAccessAndRefreshToken(retailer._id);
            const options = {
                httpOnly: true,
                secure: true
            }
            return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({ retailer, accessToken, refreshToken });
        }

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
        const user = await Retailer.findByIdAndUpdate(data._id, data, { new: true }).lean();
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
                        { requestType: "completed" },
                        { requestType: "notParticipated" },
                    ],

                },
                {
                    users: { $elemMatch: { refId: data.id } }
                }

            ]
        }).populate('requestId').populate('customerId').populate('retailerId', '_id uniqueToken storeCategory storeOwnerName storeName').populate('latestMessage', 'message').lean().sort({ updatedAt: -1 });

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
        if (!data.id) return res.status(404).json({ message: 'Invalid id' });
        const uniqueToken = await Retailer.findById(data.id).lean();
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
                        [longitude, latitude], 13 / 6371
                    ]
                }
            }
        })
        return res.status(200).json(storeCategories);
    } catch (error) {
        throw new Error(error.message);
    }
}

export const availableCategories = async (req, res) => {
    try {
        const searchData = [
            { id: 1, title: 'Agriculture equipments', subTitle: '' },
            { id: 2, title: 'Automotive Parts/Services', subTitle: '2 wheeler Fuel based' },
            { id: 3, title: 'Automotive Parts/Services', subTitle: '2-wheeler EV' },
            { id: 4, title: 'Automotive Parts/service', subTitle: '3-wheeler, commercial vehicles & EV' },
            { id: 5, title: 'Automotive Parts/Services', subTitle: '4 wheeler Fuel based' },
            { id: 6, title: 'Automotive Parts/Services', subTitle: '4-wheeler EV' },
            { id: 7, title: 'Carpenter Service', subTitle: 'Repair' },
            { id: 8, title: 'Clock Repair & Services', subTitle: '' },
            { id: 9, title: 'Consumer Electronics & Accessories', subTitle: 'Home appliances and equipment etc' },
            { id: 10, title: 'Consumer Electronics & Accessories', subTitle: 'Mobile, Laptop, digital products etc' },
            { id: 11, title: 'Cosmetics & Cosmeceuticals', subTitle: '' },
            { id: 12, title: 'Dry Cleaning & Laundry', subTitle: 'Clothes and accessories' },
            { id: 13, title: 'Electrical Equipment Services & Repair', subTitle: 'AC, Fridge, Cooler repair etc' },
            { id: 14, title: 'Electrical Hardware & Accessories', subTitle: 'Inverter, batteries, Solar etc' },
            { id: 15, title: 'Electrical Hardware & Accessories', subTitle: 'Wiring, equipment, lights etc' },
            { id: 16, title: 'Electrical Services & Repair', subTitle: 'Electrician' },
            { id: 17, title: 'Fashion Accessories', subTitle: 'Eyewear etc' },
            { id: 18, title: 'Fashion Accessories', subTitle: 'Jewellery, Gold & Diamond' },
            { id: 19, title: 'Fashion Accessories', subTitle: 'Sharee, suits, kurti & dress materials etc' },
            { id: 20, title: 'Fashion Accessories', subTitle: 'Shoes, bags etc' },
            { id: 21, title: 'Fashion/Clothings', subTitle: 'Top, bottom, dresses' },
            { id: 22, title: 'Gardening Services', subTitle: '' },
            { id: 23, title: 'Grocery & Kirana', subTitle: '' },
            { id: 24, title: 'Hardware', subTitle: 'Cement, Hand tools, Powertools etc' },
            { id: 25, title: 'Home & Function Decoration', subTitle: '' },
            { id: 26, title: 'Home Furnishing', subTitle: 'Blanket, Pillow, Curtains etc' },
            { id: 27, title: 'Home Furnishing', subTitle: 'Furniture etc' },
            { id: 28, title: 'Kids Games,Toys & Accessories', subTitle: '' },
            { id: 29, title: 'Kitchen Utensils & Kitchenware', subTitle: '' },
            { id: 30, title: 'Luxury Watches', subTitle: '' },
            { id: 31, title: 'Medical Store & Healthcare', subTitle: '' },
            { id: 32, title: 'Music instruments , Accessories & maintenance services', subTitle: '' },
            { id: 33, title: 'Paintings & Art', subTitle: '' },
            { id: 34, title: 'Pet Care & Food', subTitle: '' },
            { id: 35, title: 'Plants & Gardening Accessories', subTitle: '' },
            { id: 36, title: 'Services & Repair, Consumer Electronics & Accessories', subTitle: 'Home appliances and equipment etc' },
            { id: 37, title: 'Services & Repair, Consumer Electronics & Accessories', subTitle: 'Mobile, Laptop, digital products etc' },
            { id: 38, title: 'Services & Repair, Heavy Construction & Commercial Vehicles', subTitle: 'JCB, Cranes, Trucks etc' },
            { id: 39, title: 'Sports Accessories & Services', subTitle: 'Cricket, Football, Basketball etc' },
            { id: 40, title: 'Sports Nutrition', subTitle: 'Whey Pro etc' },
            { id: 41, title: 'Stationary & Book Stores', subTitle: '' },
            { id: 42, title: 'Tailor', subTitle: 'Makes or alters clothing' }
        ];


        return res.status(200).json(searchData);
    } catch (error) {
        res.status(404).json({ error: error });
    }


}


export const nearBySellers = async (req, res) => {
    try {
        const { lat, lon, page = 1, limit = 10, query } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ message: 'Invalid coordinates' });
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        let sellers = [];
        if (!query) {
            sellers = await Retailer.find({
                coords: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(lon), parseFloat(lat)]
                        },
                        $maxDistance: 13000
                    }
                }
            }).select('-__v -createdAt -updatedAt -storeMobileNo -coords -storeApproved -panCard -uniqueToken -profileCompleted -freeSpades -documentVerified -refreshToken')
                .lean().limit(limitNumber).skip(skip);
        }
        else {
            sellers = await Retailer.find({
                $and: [
                    {
                        $or: [
                            {
                                storeName: {
                                    $regex: query,
                                    $options: 'i'
                                },
                            },
                            {
                                storeCategory: {
                                    $regex: query,
                                    $options: 'i'
                                }
                            },
                        ]
                    },

                    {
                        coords: {
                            $near: {
                                $geometry: {
                                    type: "Point",
                                    coordinates: [parseFloat(lon), parseFloat(lat)]
                                },
                                $maxDistance: 13000
                            }
                        }
                    }
                ]
            }).select('-__v -createdAt -updatedAt -storeMobileNo -coords -storeApproved -panCard -uniqueToken -profileCompleted -freeSpades -documentVerified -refreshToken')
                .lean().limit(limitNumber).skip(skip);
        }

        return res.status(200).json(sellers);
    }
    catch (error) {
        throw new Error(error.message);
    }
}

export const currentVersion = async (req, res) => {
    try {
        const version = "1.11.0";
        return res.status(200).json(version);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getCategoryImages = async (req, res) => {
    try {
        const { category, lat, lon, page = 1, limit = 20, } = req.query;
        if (!category || !lat || !lon) return res.status(400).json({ message: "Invalid credentials" });

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        console.log(category, lat, lon, page, limit, skip);
        const Images = await Retailer.find({
            storeCategory: category,
            coords: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lon), parseFloat(lat)]
                    },
                    $maxDistance: 13000  // max-distance in meters
                }
            }
        }).lean().select('productImages');

        const imageURIs = Images
            .map(item => item.productImages || [])  // Ensure productImages exists, default to an empty array if not
            .flat();

        console.log('images', imageURIs);

        if (!imageURIs) return res.status(404).json({ message: "Images not found" });

        return res.status(200).json(imageURIs);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error });
    }
}