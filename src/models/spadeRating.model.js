import mongoose, { Schema } from 'mongoose';

const spadeRatingSchema = new Schema({
    spadeRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    spade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserRequest',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
})

export const SpadeRating = mongoose.model('SpadeRating', spadeRatingSchema);