import { User } from '../models/user.model.js';
// import { Retailer } from '../models/retailer.model.js';
import { UserRequest } from '../models/userRequest.model.js';
// import { Message } from '../models/message.model.js';
// import { Chat } from '../models/chat.model.js';

export const getUser = async (req, res) => {
    try {
        const { mobileNo } = req.body;
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


export const createRequest = async (req, res) => {
    try {
        const { customerID, request, requestCategory, requestImages, expectedPrice } = req.body;

        const createdRequest = await UserRequest.create({ customer: customerID, request: request, requestCategory: requestCategory, requestImages: requestImages, expectedPrice: expectedPrice });

        if (createdRequest) {
            return res.status(201).json(createdRequest);
        }
        else {
            return res.status(404).json({ message: 'Request not created' });
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

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


