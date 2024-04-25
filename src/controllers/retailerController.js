
import { Retailer } from '../models/retailer.model.js';
import { User } from '../models/user.model.js';
import { UserRequest } from '../models/userRequest.model.js';
// import { Message } from '../models/message.model.js';
// import { Chat } from '../models/chat.model.js';.

export const createNewRetailer = async (req, res) => {
    try {
        const data = req.body;
        console.log('retailer data', data);
        const retailer = await Retailer.create({
            storeMobileNo: data.storeMobileNo, storeName: data.storeName,
            storeOwnerName: data.storeOwnerName, storeCategory: data.storeCategory,
            panCard: `${data?.pandcard ? data.panCard : ""}`, homeDelivery: data.homeDelivery
        });
        if (retailer)
            return res.status(201).json(retailer);
        else
            return res.status(404).json({ message: "Error Occured" });
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getRetailer = async (req, res) => {
    try {
        const data = req.body;
        const retailer = await Retailer.findOne({ storeMobileNo: data.storeMobileNo });
        if (retailer)
            return res.status(200).json(retailer);
    } catch (error) {

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
            return res.status(404).json({ message: 'Retailer not found' });
        }
    } catch (error) {
        throw new Error(error.message);
    }
}