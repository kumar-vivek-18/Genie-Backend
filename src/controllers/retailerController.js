
import { Retailer } from '../models/retailer.model.js';
import { User } from '../models/user.model.js';
import { UserRequest } from '../models/userRequest.model.js';
// import { Message } from '../models/message.model.js';
import { Chat } from '../models/chat.model.js';

export const createNewRetailer = async (req, res) => {
    try {
        const data = req.body;
        // console.log('retailer data', data);


        const retailer = await Retailer.create({
            storeMobileNo: data.storeMobileNo, storeName: data.storeName,
            storeOwnerName: data.storeOwnerName, storeCategory: data.storeCategory,
            panCard: `${data?.panCard ? data.panCard : ""}`, homeDelivery: data.homeDelivery
        });
        if (retailer)
            return res.status(201).json(retailer);
        else
            return res.status(500).json({ message: "Error Occured" });
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
}

export const getRetailer = async (req, res) => {
    try {
        const data = req.query;
        const retailer = await Retailer.findOne({ storeMobileNo: data.storeMobileNo });
        if (retailer)
            return res.status(200).json(retailer);
        else
            return res.json({ status: 404, message: "User Not Found!" });
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
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
                        { requestType: "closed" },
                        { requestType: "cancelled" }
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