import { Retailer } from '../models/retailer.model.js';
import { User } from '../models/user.model.js';
import { UserRequest } from '../models/userRequest.model.js';
import { Message } from '../models/message.model.js';
import { Chat } from '../models/chat.model.js';
import { response } from 'express';
import { populate } from 'dotenv';


export const modifyChat = async (req, res) => {
    try {
        const data = req.body;
        // console.log('data', data);
        const createdChat = await Chat.findById(data.id);
        // console.log('createdChat', createdChat);
        if (createdChat) {
            createdChat.users.push({ type: 'UserRequest', refId: createdChat.requestId });
            createdChat.requestType = data.type;
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

export const acceptBid = async (req, res) => {
    try {
        const data = req.body;
        // console.log('data', data);
        const request = await UserRequest.findById(data.id);
        // console.log('createdChat', createdChat);
        if (request) {

            request.requestActive = data.type;
            request.save();
            return res.status(200).json(request);
        }
        else {
            return res.status(404).json({ message: 'Request not found' });
        }
    } catch (error) {
        throw new Error(error.message);
    }
}
// getRetailerNewChats and getRetailerOngoingChats are different chats

export const getRetailerNewChats = async (req, res) => {
    try {
        const data = req.query;
        // console.log('data', data);
        const RetailerChats = await Chat.find({
            $and: [
                {
                    requestType: "new",

                    users: { $elemMatch: { refId: data.id } }
                }

            ]


        }).populate('requestId');

        // await Promise.all(RetailerChats.map(async chat => {
        //     // Populate each user in the users array
        //     await Promise.all(chat.users.map(async user => {
        //         const model = user.type === 'UserRequest' ? UserRequest : Retailer;
        //         console.log('model', model);
        //         user.populatedUser = await model.findById(user.refId);
        //         console.log('user.populatedUser', user.populatedUser);
        //     }));
        // }));
        // console.log('chats', RetailerChats);

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
                    requestType: "ongoing",

                    users: { $elemMatch: { refId: data.id } }
                }

            ]
        }).populate('requestId');

        // await Promise.all(RetailerChats.map(async chat => {
        //     // Populate each user in the users array
        //     await Promise.all(chat.users.map(async user => {
        //         const model = user.type === 'UserRequest' ? UserRequest : Retailer;
        //         console.log('model', model);
        //         user.populatedUser = await model.findById(user.refId);
        //         console.log('user.populatedUser', user.populatedUser);
        //     }));
        // }));
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

export const getChats = async (req, res) => {
    try {
        const data = req.query;
        const UserChats = await Chat.find({
            $and: [
                {
                    requestType: "ongoing",
                    "users.refId": { $in: data.id } // Assuming data.ids is an array of ObjectIds
                }
            ]
        }).lean();

        // Iterate through each chat and populate users
        await Promise.all(UserChats.map(async chat => {
            // Populate each user in the users array
            await Promise.all(chat.users.map(async user => {
                const model = user.type === 'UserRequest' ? UserRequest : Retailer;
                // console.log('model', model);
                user.populatedUser = await model.findById(user.refId);
            }));
        }));



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

        // Create the message
        const createdMessage = await Message.create({
            sender: data.sender,
            message: data.message,
            bidType: data.bidType,
            bidPrice: data.bidPrice,
            bidImages: data.bidImages,
            bidAccepted: data.bidAccepted,
            chat: data.chat,
            warranty: data.warranty
        });

        if (!createdMessage) {
            return res.status(404).json({ message: 'Message not created' });
        }

        // Populate the chat field
        const populatedMessage = await createdMessage.populate('chat', '_id users').execPopulate();

        return res.status(201).json(populatedMessage);
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

        const message = await Message.findById(data.id).populate('chat', '_id users');

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


// const confirmProductAvailability = async (req, res) => {
//     try {
//         const data = req.body;

//         const chat = await Chat.findById(data.id);
//         if (!chat) {
//             return res.status(404).json({ message: 'Chat not found' });
//         }


//     } catch (error) {

//     }
// }
