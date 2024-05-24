import { Retailer } from '../models/retailer.model.js';
import { User } from '../models/user.model.js';
import { UserRequest } from '../models/userRequest.model.js';
import { Message } from '../models/message.model.js';
import { Chat } from '../models/chat.model.js';
import { response } from 'express';
import { populate } from 'dotenv';
import mongoose from 'mongoose';

export const createRatingAndFeedback = async (req, res) => {
    try {
        const data = res.body;

        const createdRating = await Rating.create({
            user: data.user,
            retailer: data.retailer,
            rating: data.rating,
            feedback: data.feedback
        });
        if (createdRating) {
            return res.status(201).json(createdRating);
        }
        else {
            return res.status(404).json({ message: 'Rating not created' });
        }
    } catch (error) {
        throw new Error(error.message);
    }
}