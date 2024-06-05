import { RatingAndFeedback } from '../models/feedback.model.js';
import mongoose from 'mongoose';
import { Retailer } from '../models/retailer.model.js';

// export const createRatingAndFeedback = async (req, res) => {
//     try {
//         const data = req.body;

//         // console.log('data', data);
//         if (!data.user || !data.retailer || !data.rating || !data.feedback) {
//             return res.status(400).json({ message: 'All fields are required' });
//         }
//         const createdRating = await RatingAndFeedback.create({
//             user: data.user,
//             retailer: data.retailer,
//             rating: data.rating,
//             feedback: data.feedback
//         });

//         const updateRetailer = await Retailer.findByIdAndUpdate({ _id: data.retailer }, { $inc: { totalRating: data.rating, totalReview: 1 } });

//         if (createdRating) {
//             return res.status(201).json(createdRating);
//         }
//         else {
//             return res.status(404).json({ message: 'Rating not created' });
//         }
//     } catch (error) {
//         throw new Error(error.message);
//     }
// }


export const createRatingAndFeedback = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { user, retailer, rating, feedback } = req.body;

        if (!user || !retailer || !rating || !feedback) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const createdRating = await RatingAndFeedback.create([{
            user,
            retailer,
            rating,
            feedback
        }], { session });

        if (!createdRating) {
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({ message: 'Rating not created' });
        }

        const updateRetailer = await Retailer.findByIdAndUpdate(
            retailer,
            { $inc: { totalRating: rating, totalReview: 1 } },
            { new: true, session }
        );

        if (!updateRetailer) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Retailer not found' });
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