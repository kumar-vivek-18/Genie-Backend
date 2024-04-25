import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken';

const userRequestSchema = new Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    requestDescription: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    requestCategory: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
    },
    requestImages: [{
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    }],
    expectedPrice: {
        type: String,
    }


}, {
    timestamps: true
})

export const UserRequest = mongoose.model('UserRequest', userRequestSchema);
