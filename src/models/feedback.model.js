import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        trim: true,
        default: ""
    },
    retailer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Retailer",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }

});

export const RatingAndFeedback = mongoose.model('RatingAndFeedback', feedbackSchema);