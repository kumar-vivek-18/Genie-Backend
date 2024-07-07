import mongoose, { Schema } from "mongoose";

const senderSchema = new Schema({
    type: {
        type: String,
        enum: ['User', 'Retailer'],
    },
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'type'
    }
})
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
    // retailer: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Retailer",
    //     required: true,
    // },
    // user: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //     required: true,
    // },
    sender: senderSchema,
    senderName: {
        type: String,
        trim: true,
        required: true,
    },
    user: senderSchema,


});

export const RatingAndFeedback = mongoose.model('RatingAndFeedback', feedbackSchema);