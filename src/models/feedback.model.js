import mongoose, { Schema } from "mongoose";

const senderSchema = new Schema({
    type: {
        type: String,
        enum: ['User', 'Retailer'],
    },
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'type',
    }
})

senderSchema.index({ type: 1, refId: 1 });

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

    sender: senderSchema,
    senderName: {
        type: String,
        trim: true,
        default: "",
    },
    user: senderSchema,


});

export const RatingAndFeedback = mongoose.model('RatingAndFeedback', feedbackSchema);