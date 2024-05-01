import { Retailer } from '../models/retailer.model.js';
import { User } from '../models/user.model.js';
import { UserRequest } from '../models/userRequest.model.js';
import { Message } from '../models/message.model.js';
import { Chat } from '../models/chat.model.js';
import { response } from 'express';


export const createChat = async (req, res) => {
    try {
        const data = req.body;
        const createdChat = await Chat.findOne({ _id: data.id });
        if (createdChat) {
            createdChat.requestType = "ongoing";
            createdChat.save();
            return res.status(201).json(createdChat);
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
        const RetailerChats = await Chat.find({
            $and: [{
                'users': {
                    $elemMatch: {
                        'refId': data.id,
                        'type': 'Retailer' // If you want to filter only Retailer type users
                    }
                }
            }, {
                requestType: "new"
            }]
        })
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
            $and: [{
                'users': {
                    $elemMatch: {
                        'refId': data.id,
                        'type': 'Retailer' // If you want to filter only Retailer type users
                    }
                }
            }, {
                requestType: "ongoing"
            }]
        })
        if (RetailerChats.length > 0)
            return res.status(200).json(RetailerChats);
        else
            return res.status(404).json({ message: "Retailer Chat not found" });
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getUserChats = async (req, res) => {
    try {
        const data = req.query;
        const RetailerChats = await Chat.find({
            'users': {
                $elemMatch: {
                    'refId': data.id,
                    'type': 'UserRequest' // If you want to filter only Retailer type users
                }
            }
        })
        if (RetailerChats.length > 0)
            return res.status(200).json(RetailerChats);
        else
            return res.status(404).json({ message: "Retailer Chat not found" });
    } catch (error) {
        throw new Error(error.message);
    }
}

export const sendMessage = async (req, res) => {
    try {
        const data = req.body;
        const createdMessage = await Message.create(data);
        if (createdMessage) {
            return res.status(201).json(createdMessage);
        }
        else {
            return res.status(404).json({ message: 'Message not created' });
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

export const updateMessage = async (req, res) => {
    try {
        const data = req.body;
        const message = await Message.findById({ _id: data.id });
        if (message) {
            message.bidAccepted = data.type;
            message.save();
        }
        else {
            return res.status(404).json({ message: 'Error occured while updating message' });
        }
    } catch (error) {

    }
}