import { Retailer } from '../models/retailer.model.js';
import { User } from '../models/user.model.js';
import { UserRequest } from '../models/userRequest.model.js';
import { Message } from '../models/message.model.js';
import { Chat } from '../models/chat.model.js';
import { response } from 'express';
import { populate } from 'dotenv';
import mongoose from 'mongoose';

export const productAvailable = async (req, res) => {
    try {
        const data = req.body;
        // console.log('data', data);
        const createdChat = await Chat.findById(data.id);
        // console.log('createdChat', createdChat);
        if (createdChat) {
            createdChat.users.push({ type: 'UserRequest', refId: createdChat.requestId });
            createdChat.requestType = "ongoing";
            createdChat.save();
            return res.status(200).json(createdChat);
        }
        else {
            return res.status(404).json({ message: 'Request not found' });
        }
    } catch (error) {
        throw new Error(error.message);
    }
}
export const productNotAvailable = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(404).json({ message: "Please provide a valid Id" })
        const updateChat = await Chat.findByIdAndUpdate(id, { requestType: "rejected" }, { new: true });
        if (!updateChat) return res.status(404).json({ message: 'Chat not available' });
        return res.status(200).json(updateChat);
    } catch (error) {
        throw new Error(error.message);
    }
}

// export const updateCloseChat = async (req, res) => {
//     try {
//         const { id } = req.body;
//         const updateClosedChat = await Chat.findByIdAndUpdate({
//             id,
//             requestType: "completed"
//         }, { new: true });
//         if (!updateClosedChat) return res.status(404).json({ message: "Chat not found" });

//         return res.status(200).json(updateCloseChat);
//     }
//     catch (error) {
//         throw new Error(error.message);
//     }
// }

export const updateToHistory = async (req, res) => {
    try {
        const { id, type } = req.body;
        const updateAcceptedChat = await Chat.findByIdAndUpdate(
            id, // The ID of the chat to update
            { requestType: type }, // The fields to update
            { new: true } // Return the updated document
        );

        if (!updateAcceptedChat) {
            return res.status(404).json({ message: 'Accepted chat not found' });
        }
        return res.status(200).json(updateAcceptedChat);
    } catch (error) {
        return res.status(404).json({ message: 'Request error' });
    }
}

// export const acceptBid = async (req, res) => {
//     try {
//         const data = req.body;
//         // console.log('data', data);
//         const request = await UserRequest.findById(data.id);
//         // console.log('createdChat', createdChat);
//         if (request) {

//             request.requestActive = data.type;
//             request.save();
//             return res.status(200).json(request);
//         }
//         else {
//             return res.status(404).json({ message: 'Request not found' });
//         }
//     } catch (error) {
//         throw new Error(error.message);
//     }
// }
// getRetailerNewChats and getRetailerOngoingChats are different chats

export const getRetailerNewChats = async (req, res) => {
    try {
        const data = req.query;
        const RetailerChats = await Chat.find({
            $and: [
                {
                    requestType: "new"
                },
                {
                    users: { $elemMatch: { refId: data.id } }
                }

            ]
        }).populate('requestId').populate('customerId').populate('retailerId').populate('latestMessage', 'sender message bidType bidAccepted').lean().sort({ updatedAt: -1 });

        await Promise.all(RetailerChats.map(async chat => {
            // Populate each user in the users array
            await Promise.all(chat.users.map(async user => {
                const model = user.type === 'UserRequest' ? UserRequest : Retailer;
                // console.log('model', model);
                user.populatedUser = await model.findById(user.refId);
            }));
        }));

        if (RetailerChats.length > 0)
            return res.status(200).json(RetailerChats);
        else
            return res.status(404).json({ message: "Retailer Chat not found" });
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getRetailerOngoingChats = async (req, res) => {
    try {
        const data = req.query;
        const RetailerChats = await Chat.find({
            $and: [
                {
                    $or: [
                        { requestType: "ongoing" },
                        { requestType: "win" },
                        { requestType: "closed" },
                    ],
                },
                {
                    users: { $elemMatch: { refId: data.id } }
                }

            ]
        }).populate('requestId').populate('customerId').populate('retailerId').populate('latestMessage', ' sender message bidType bidAccepted').lean().sort({ updatedAt: -1 });

        await Promise.all(RetailerChats.map(async chat => {
            // Populate each user in the users array
            await Promise.all(chat.users.map(async user => {
                const model = user.type === 'UserRequest' ? UserRequest : Retailer;
                // console.log('model', model);
                user.populatedUser = await model.findById(user.refId);
            }));
        }));

        if (RetailerChats.length > 0)
            return res.status(200).json(RetailerChats);
        else
            return res.status(404).json({ message: "Retailer Chat not found" });
    } catch (error) {
        throw new Error(error.message);
    }
}

// export const getChats = async (req, res) => {
//     try {
//         const data = req.query;
//         const UserChats = await Chat.find({
//             $and: [
//                 {
//                     requestType: "ongoing",
//                     users: { $elemMatch: { refId: data.id } }
//                 }

//             ]


//         }).populate({ path: 'users' })
//         if (UserChats.length > 0)
//             return res.status(200).json(UserChats);
//         else
//             return res.status(404).json({ message: "Retailer Chat not found" });
//     } catch (error) {
//         throw new Error(error.message);
//     }
// }
export const getParticularChat = async (req, res) => {
    try {
        const data = req.query;
        const UserChat = await Chat.findById(data.id).populate('requestId').populate('customerId').populate('retailerId').populate('latestMessage', 'sender message bidType bidAccepted bidImages')
        if (!UserChat) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(UserChat);
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getChats = async (req, res) => {
    try {
        const data = req.query;
        const UserChats = await Chat.find({
            $and: [
                {
                    $or: [
                        { requestType: "ongoing" },
                        { requestType: "win" },
                        { requestType: "closed" },
                        { requestType: "closedHistory" },
                        { requestType: "completed" }
                    ],


                },
                {
                    users: { $elemMatch: { refId: data.id } }
                }

            ]
        }).populate('requestId').populate('customerId').populate('retailerId').populate('latestMessage', 'sender message bidType bidAccepted bidImages').lean().sort({ updatedAt: -1 });

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



export const sendMessage = async (req, res) => {
    try {
        const data = req.body;
        const bidImages = [];
        if (req.files && Array.isArray(req.files)) {
            const imageUrl = req.files.map(file => `http://173.212.193.109:5000/uploads/${file.filename}`);
            bidImages.push(...imageUrl);
        }

        // console.log('bidImages: ', bidImages)

        const createdMessage = await Message.create({
            sender: JSON.parse(data.sender),
            userRequest: data?.userRequest,
            message: data?.message,
            bidType: data?.bidType,
            bidPrice: data?.bidPrice,
            bidImages: bidImages,
            chat: data?.chat,
            warranty: data?.warranty,
            longitude: data?.longitude ? data?.longitude : 0,
            latitude: data?.latitude ? data?.latitude : 0,
        });

        if (!createdMessage) {
            return res.status(404).json({ message: 'Message not created' });
        }

        // Populate the chat and userRequest fields
        await createdMessage.populate('chat', '_id users');
        await createdMessage.populate('userRequest', '_id customer');

        // Update the latest message in the chat
        const updateLatestMessage = await Chat.findOneAndUpdate(
            { _id: createdMessage.chat },
            { latestMessage: createdMessage._id },
            { new: true }
        );

        if (!updateLatestMessage) {
            return res.status(404).json({ message: 'Chat not found or update failed' });
        }

        return res.status(201).json(createdMessage);
    } catch (error) {
        console.error('Error creating message:', error); // Improved error logging
        return res.status(500).json({ message: 'Internal server error', error: error.message }); // Improved error response
    }
};




export const updateMessage = async (req, res) => {
    try {
        const data = req.body;

        if (!data.id || !data.type) {
            return res.status(400).json({ message: 'Missing id or type parameter' });
        }

        // console.log('update-data', data.id, data.type);

        const message = await Message.findById(data.id).populate('chat', '_id users').populate('userRequest', '_id customer');

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // console.log('message', message);


        if (!["new", "accepted", "rejected", "image"].includes(data.type)) {
            return res.status(400).json({ message: 'Invalid type parameter' });
        }

        message.bidAccepted = data.type;

        await message.save();
        // console.log('update-message', message);

        return res.status(200).json(message);
    } catch (error) {
        // console.error('Error updating message:', error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const setChatMessageMarkAsRead = async (req, res) => {

    try {

        const data = req.body;
        // console.log('data', data);
        const response = await Chat.findByIdAndUpdate({ _id: data.id }, { unreadCount: 0 });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}




export const acceptBidRequest = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const data = req.body;
        // console.log('data of acceptBidRequest', data);
        if (!data.messageId || !data.userRequestId) {
            return res.status(400).json({ message: 'Missing id or type parameter' });
        }

        const message = await Message.findByIdAndUpdate(
            { _id: data.messageId },
            { bidAccepted: "accepted" },
            { session, new: true }
        ).populate('chat', '_id users').populate('userRequest', '_id customer');

        if (!message) {
            throw new Error('Message not found');
        }

        console.log('mess', message);

        const userRequest = await UserRequest.findByIdAndUpdate(
            { _id: data.userRequestId },
            { requestActive: "completed", requestAcceptedChat: message.chat._id },
            { session, new: true }
        );

        console.log('userRequest', userRequest);

        if (!userRequest) {
            throw new Error('User request not found');
        }

        // const updateChat = await Chat.findById(message.chat._id).session(session);
        // if (updateChat) {
        //     updateChat.bidFlow.push({ amount: message.bidPrice, status: "accepted" });
        //     await updateChat.save({ session });
        // }

        const chats = await Chat.find({ requestId: data.userRequestId }).populate('retailerId', 'uniqueToken').session(session);

        const uniqueTokens = [];
        uniqueTokens.push(chats[0].retailerId.uniqueToken);
        await Promise.all(chats.map(async (chat) => {
            console.log('chat token', chat._id, message.chat._id);

            if (chat._id.toString() === message.chat._id.toString() && chat.requestType === "ongoing") {
                chat.bidCompleted = true;
                chat.requestType = "win";
                await chat.save({ session });
                uniqueTokens.push(chat.retailerId.uniqueToken);
            }
            else if (chat.requestType === "new") {
                chat.bidCompleted = true;
                chat.requestType = "notPartcipated";
                await chat.save({ session });
            }
            else {
                uniqueTokens.push(chat.retailerId.uniqueToken);
                chat.bidCompleted = true;
                chat.requestType = "closed";
                await chat.save({ session });
            }



            if (chat._id.toString() !== message.chat._id.toString() && chat.requestType === "closed") {
                console.log('sending mess', chat._id, message.chat._id);
                await Message.create([{
                    sender: { type: 'Retailer', refId: chat.users[0]._id },
                    userRequest: data.userRequestId,
                    message: `Offer closed with other vendor at a price of ${message.bidPrice} Rs. Try next time with better pricing.`,
                    bidType: "update",
                    chat: chat._id
                }], { session });
            }
        }));


        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message, uniqueTokens });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


export const rejectBidRequest = async (req, res) => {
    try {
        const data = req.body;

        if (!data.messageId) {
            return res.status(400).json({ message: 'Missing id or type parameter' });
        }


        const message = await Message.findById(data.messageId).populate('chat', '_id users').populate('userRequest', '_id customer');

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // console.log('message', message);



        message.bidAccepted = "rejected";

        await message.save();

        const updateChat = await Chat.findById(message.chat._id);
        if (updateChat) {
            updateChat.bidFlow.push({ amount: message.bidPrice, status: "rejected" });
            await updateChat.save();
        }
        // console.log('update-message', message);

        return res.status(200).json(message);
    } catch (error) {
        // console.error('Error updating message:', error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}




export const getSpadeMessages = async (req, res) => {
    try {
        const data = req.query;
        // console.log('chat', data);
        const mess = await Message.find({ chat: data.id }).populate('chat', '_id users');

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



