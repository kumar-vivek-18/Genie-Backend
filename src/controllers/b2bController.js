import mongoose from 'mongoose';
import { Chat } from '../models/chat.model.js';
import { Message } from '../models/message.model.js';
import { Retailer } from '../models/retailer.model.js';
import { UserRequest } from '../models/userRequest.model.js';
import { User } from '../models/user.model.js';

export const getUnApprovedRetailers = async (req, res) => {
    try {

        const retailers = await Retailer.find({ $or: [{ storeApproved: "new" }, { documentVerified: false }] }).sort({ updatedAt: -1 }).lean();

        if (!retailers) return res.status(404).json({ message: "No retailers found" });

        return res.status(200).json(retailers);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const allApprovedRetailers = async (req, res) => {
    try {

        const retailers = await Retailer.find({ $and: [{ storeApproved: "approved" }, { documentVerified: true }] }).sort({ createdAt: -1 }).lean();

        if (!retailers) return res.status(404).json({ message: 'No approved retailers' });

        return res.status(200).json(retailers);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const approveRetailers = async (req, res) => {
    try {
        const { retailerId } = req.body;

        // console.log('retailers approval', retailerId);
        if (!retailerId) return res.status(404).json({ message: 'Invalid retailer Id' });

        const approvedRetailers = await Retailer.findByIdAndUpdate(retailerId, { storeApproved: "approved" }, { new: true }).lean();

        if (!approvedRetailers)
            return res.status(404).json({ message: "Retailer not found" });

        return res.status(200).json(approvedRetailers);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const rejectRetailers = async (req, res) => {
    try {
        const { retailerId } = req.body;

        if (!retailerId) return res.status(404).json({ message: 'Invalid retailer Id' });

        const approvedRetailers = await Retailer.findByIdAndUpdate(retailerId, { storeApproved: "rejected" }, { new: true }).lean();

        if (!approvedRetailers)
            return res.status(404).json({ message: "Retailer not found" });

        return res.status(200).json(approvedRetailers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const blockRetailers = async (req, res) => {
    try {
        const { retailerId } = req.body;
        if (!retailerId) return res.status(403).json({ message: "Invalid retailer id" });

        const approvedRetailers = await Retailer.findByIdAndUpdate(retailerId, { storeApproved: "blocked" }, { new: true }).lean();

        if (!approvedRetailers)
            return res.status(404).json({ message: "Retailer not found" });

        return res.status(200).json(approvedRetailers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const verifyDocument = async (req, res) => {
    try {
        const { retailerId } = req.body;

        if (!retailerId) return res.status(403).json({ message: "Retaier Id is required" });

        const verifiedRetailer = await Retailer.findByIdAndUpdate(retailerId, { documentVerified: true }, { new: true }).lean();

        if (!verifiedRetailer) return res.status(404).json({ message: "Retaieler not found" });

        return res.status(200).json(verifiedRetailer);

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}


// export const rejectDocument = async (req, res) => {
//     try {
//         const { retailerId } = req.body;

//         if (!retailerId) return res.status(403).json({ message: "Retaier Id is required" });

//         const verifiedRetailer = await Retailer.findByIdAndUpdate(retailerId, { documentVerified: true }).lean();

//         if (!verifiedRetailer) return res.status(404).json({ message: "Retaieler not found" });

//         return res.status(200).json(verifiedRetailer);

//     } catch (error) {
//         return res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// }

export const getAllRequests = async (req, res) => {
    try {
        console.log('hii there')
        const requests = await UserRequest.find().sort({ updatedAt: -1 }).lean();

        if (!requests) return res.status(404).json({ message: "No requests found" });
        const requestDetail = await Promise.all(requests.map(async (request) => {

            const userDetails = await User.findById(request.customer);

            return { ...request, userDetails };
        }));
        // const userDetails = await User.findById(requests?.customer);
        // console.log(userDetails);


        return res.status(200).json({ requestDetail });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const getAllChats = async (req, res) => {
    try {
        const data = req.query;
        if (!data?.id) return res.status(403).json({ message: "Invalid user id" });
        const UserChats = await Chat.find({
            $and: [
                {
                    $or: [
                        { requestType: "ongoing" },
                        { requestType: "win" },
                        { requestType: "closed" },
                        { requestType: "closedHistory" },
                        { requestType: "completed" },
                    ],


                },
                {
                    users: { $elemMatch: { refId: data.id } }
                }

            ]
        }).populate('requestId').populate('customerId').populate('retailerId').populate('latestMessage', 'sender message bidType bidAccepted bidImages').lean().sort({ updatedAt: -1 });

        // Iterate through each chat and populate users
        // await Promise.all(UserChats.map(async chat => {
        //     // Populate each user in the users array
        //     await Promise.all(chat.users.map(async user => {
        //         const model = user.type === 'UserRequest' ? UserRequest : Retailer;
        //         // console.log('model', model);
        //         user.populatedUser = await model.findById(user.refId);
        //     }));
        // }));

        // console.log('chats data', UserChats);


        if (UserChats.length > 0)
            return res.status(200).json(UserChats);
        else
            return res.status(404).json({ message: "Retailer Chat not found" });
    } catch (error) {
        throw new Error(error.message);
    }
}


export const getChatMessages = async (req, res) => {
    try {
        const data = req.query;
        // console.log('chat', data);
        if (!data.id) return res.status(403).json({ message: "Invalid query data" });

        const mess = await Message.find({ chat: data.id }).populate('chat', '_id users').lean();

        if (mess.length > 0) {

            return res.status(200).json(mess);
        }
        else {
            return res.status(404).json({ message: 'No messages found' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const getParticularChatInfo = async (req, res) => {
    try {
        const data = req.query;
        const UserChat = await Chat.findById(data.id).populate('requestId').populate('customerId').populate('retailerId').populate('latestMessage', 'sender message bidType bidAccepted bidImages').lean();
        if (!UserChat) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(UserChat);
    } catch (error) {
        throw new Error(error.message);
    }
}