import { RatingAndFeedback } from '../models/feedback.model.js';
import mongoose from 'mongoose';
import { Retailer } from '../models/retailer.model.js';
import { User } from '../models/user.model.js';
import { Chat } from '../models/chat.model.js';
import { SpadeRating } from '../models/spadeRating.model.js';
import { UserRequest } from '../models/userRequest.model.js';




export const createRatingAndFeedback = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { user, sender, rating, feedback, senderName, chatId } = req.body;

        if (!user || !sender || !rating || !senderName) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const createdRating = await RatingAndFeedback.create([{
            user,
            sender,
            senderName,
            rating,
            feedback,
        }], { session });

        if (!createdRating) {
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({ message: 'Rating not created' });
        }

        if (user.type === 'Retailer') {
            const updateRetailer = await Retailer.findByIdAndUpdate(
                user.refId,
                { $inc: { totalRating: rating, totalReview: 1 } },
                { new: true, session }
            );
            if (!updateRetailer) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: 'Retailer not found' });
            }
            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                { retailerRated: true },
                { new: true, session }
            );
            if (!updatedChat) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: 'Chat not found' });
            }

        }
        else {
            const updateUser = await User.findByIdAndUpdate(
                user.refId,
                { $inc: { totalRating: rating, totalReview: 1 } },
                { new: true, session }
            );

            if (!updateUser) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: 'User not found' });
            }

            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                { rated: true },
                { new: true, session }
            );
            if (!updatedChat) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: 'Chat not found' });
            }
        }


        await session.commitTransaction();
        session.endSession();

        return res.status(201).json(createdRating);

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: error.message });
    }
}

export const createRatings = async (req, res) => {
    try {
        const { spadeRating, retailerRating, spadeId, senderId, userId, senderName } = req.body;

        // console.log(req.body);
        const createRetailerRating = await RatingAndFeedback.create({ rating: retailerRating, sender: { type: "User", refId: senderId }, senderName: senderName, user: { type: 'Retailer', refId: userId } });
        if (!createRetailerRating) {
            return res.status(500).json({ message: 'Retailer rating not created' });
        }


        const createSpadeRating = await SpadeRating.create({ rating: spadeRating, sender: senderId, spade: spadeId, senderName: senderName });
        if (!createSpadeRating)
            return res.status(500).json({ message: 'Spade rating not created' });


        const updateRetailerTotalRatings = await Retailer.findByIdAndUpdate(userId, {
            $inc: { totalRating: retailerRating, totalReview: 1 }
        }, { new: true });
        if (!updateRetailerTotalRatings)
            return res.status(404).json({ message: "Error updating stats" });

        await UserRequest.findByIdAndUpdate(spadeId, { rated: true });

        return res.status(201).json({ message: 'Ratings created successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const getRetailerFeedbacks = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'Invalid request' });
        }
        // if (!mongoose.Types.ObjectId.isValid(id)) {
        //     return res.status(400).json({ message: 'Invalid ID format' });
        // }

        const feedbacks = await RatingAndFeedback.find({
            $and: [
                { "user.type": "Retailer", "user.refId": id },
                { feedback: { $ne: '' } }
            ]
        });
        return res.status(200).json(feedbacks);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const updatedFeedback = async (req, res) => {
    try {
        console.log('hii');
        const { commentId, rating, oldRating, feedback, userId } = req.body;
        if (!commentId || !rating || !feedback) return res.status(404).json({ message: "Feedback not found" });

        const updated = await RatingAndFeedback.findByIdAndUpdate(commentId, { rating: rating, feedback: feedback }, { new: true });

        if (!updated) return res.status(404).json({ message: "Feedback not found" });

        const updateRetailer = await Retailer.findByIdAndUpdate(userId);
        if (!updateRetailer) return res.status(404).json({ message: "Retailer not found" });
        updateRetailer.totalRating = updateRetailer.totalRating - oldRating + rating;
        await updateRetailer.save();
        console.log(updated);

        return res.status(200).json({ message: "Retailer rating successfully updated" });

    } catch (error) {
        res.status(500).json({ message: "Error updating" });
    }
}

