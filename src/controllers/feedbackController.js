import { RatingAndFeedback } from '../models/feedback.model.js';
import mongoose from 'mongoose';

export const createRatingAndFeedback = async (req, res) => {
    try {
        const data = req.body;

        console.log('data', data);

        const createdRating = await RatingAndFeedback.create({
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