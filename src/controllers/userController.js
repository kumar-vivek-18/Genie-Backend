import { Chat } from '../models/chat.model.js';
import { User } from '../models/user.model.js';
import { Retailer } from '../models/retailer.model.js';
import { UserRequest } from '../models/userRequest.model.js';
import { Message } from '../models/message.model.js';

export const getUser = async (req, res) => {
    try {
        const { mobileNo } = req.query;
        const user = await User.findOne({ mobileNo });
        if (user) {
            return res.status(200).json(user);
        }
        else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500);
        throw new Error('User not found');
    }
};

export const registerUser = async (req, res) => {
    try {
        // console.log('first', req.body);
        const { userName, mobileNo } = req.body;
        const user = await User.create({ userName: userName, mobileNo: mobileNo });
        if (user)
            return res.status(201).json(user);
        else
            return res.status(404).json({ message: 'User not created' });
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
}


// export const createRequest = async (req, res) => {
//     try {
//         const { customerID, request, requestCategory, requestImages, expectedPrice } = req.body;

//         const createdRequest = await UserRequest.create({ customer: customerID, request: request, requestCategory: requestCategory, requestImages: requestImages, expectedPrice: expectedPrice });



//         if (createdRequest) {
//             const retailers = await Retailer.find({ storeCategory: requestCategory });
//             const retailerRequests = [];
//             if (retailers) {
//                 for (let i = 0; i < retailers.length; i++) {
//                     const createdChat = await Chat.create({ requestId: createdRequest._id, requestType: "new", users: [retailers[i]._id] });
//                     // also add the first bid send by retailer
//                     if (expectedPrice > 0 && createdChat) {
//                         const firstBid = await Message.create({ sender: createdRequest._id, message: request, bidType: true, bidPrice: expectedPrice, bidImages: requestImages, bidAccepted: "new", chat: createdChat });
//                         if (firstBid) {
//                             retailerRequests.push(createdChat);
//                         }
//                         else {
//                             return res.status(404).json({ message: 'Request not created' });
//                         }

//                     }
//                     else if (createdChat) {
//                         retailerRequests.push(createdChat);
//                     }
//                 }
//                 if (retailerRequests.length > 0) {
//                     return res.status(201).json(createdRequest);
//                 }
//                 else {
//                     return res.status(404).json({ message: 'Request not created due to no reatailer found of particular category' });
//                 }
//             }
//             else {
//                 return res.status(404).json({ message: 'Request not created due to no reatailer found of particular category' });
//             }
//         }
//         else {
//             return res.status(404).json({ message: 'Request not created' });
//         }
//     } catch (error) {
//         throw new Error(error.message);
//     }
// }

export const createRequest = async (req, res) => {
    try {
        const { customerID, request, requestCategory, requestImages, expectedPrice } = req.body;

        const retailers = await Retailer.find({ storeCategory: requestCategory });

        if (!retailers || !retailers.length) {
            return res.status(404).json({ message: 'No retailers found for the requested category' });
        }

        const userRequest = await UserRequest.create({ customer: customerID, requestDescription: request, requestCategory: requestCategory, requestImages: requestImages, expectedPrice: expectedPrice });

        if (!userRequest) {
            return res.status(404).json({ message: 'Request not created' });
        }



        const retailerRequests = await Promise.all(retailers.map(async retailer => {
            const retailerChat = await Chat.create({ requestId: userRequest._id, requestType: 'new', users: [{ refId: retailer._id }] });

            if (expectedPrice > 0 && retailerChat) {
                const firstBid = await Message.create({ sender: { refId: userRequest._id }, message: request, bidType: true, bidPrice: expectedPrice, bidImages: requestImages, bidAccepted: 'new', chat: retailerChat._id });

                if (!firstBid) {
                    throw new Error('Failed to create first bid');
                }
            }

            return retailerChat;
        }));

        if (!retailerRequests.length) {
            return res.status(404).json({ message: 'Request not created due to no retailer found of particular category' });
        }

        return res.status(201).json(userRequest);
    } catch (error) {
        console.error('Error in createRequest:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


export const editProfile = async (req, res) => {
    try {
        const data = req.body;
        const user = await User.findByIdAndUpdate(data._id, data, { new: true });
        if (user) {
            return res.status(200).json(user);
        }
        else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        throw new Error(error.message);
    }
}


