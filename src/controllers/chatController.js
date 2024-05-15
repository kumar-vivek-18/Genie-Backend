import { Retailer } from '../models/retailer.model.js';
import { User } from '../models/user.model.js';
import { UserRequest } from '../models/userRequest.model.js';
import { Message } from '../models/message.model.js';
import { Chat } from '../models/chat.model.js';
import { response } from 'express';


export const modifyChat = async (req, res) => {
    try {
        const data = req.body;
        const createdChat = await Chat.findOne({ _id: data.id });
        if (createdChat) {
            createdChat.users.push({ refId: createdChat.requestId });
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
        console.log('data', data);
        const RetailerChats = await Chat.find({
            $and: [
                {
                    requestType: "new",

                    users: { $elemMatch: { refId: data.id } }
                }

            ]


        }).populate('requestId');

        console.log('chats', RetailerChats);

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


        });
        if (RetailerChats.length > 0)
            return res.status(200).json(RetailerChats);
        else
            return res.status(404).json({ message: "Retailer Chat not found" });
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
                    users: { $elemMatch: { refId: data.id } }
                }

            ]


        });
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
            await message.save();
            return res.status(200).json(message);
        }
        else {
            return res.status(404).json({ message: 'Error occured while updating message' });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getSpadeMessages = async (req, res) => {
    try {
        const data = req.query;
        console.log('chat', data);
        const mess = await Message.find({ chat: data.id });
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