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
        default: "",
    },
    requestCategory: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        default: "",
    },
    requestImages: [{
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    }],
    expectedPrice: {
        type: Number,
        default: 0,
    },
    requestActive: {
        type: String,
        enum: ["active", "completed", "closed"],
        default: "active",
    },
    requestAcceptedChat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
    },
    unread: {
        type: Boolean,
        default: false,
    },
    appliedCouponCode: {
        type: String,
        default: "",
    },
    spadePrice: {
        type: Number,
        default: 0,
    },
    paymentStatus: {
        type: String,
        enum: ["paid", "unpaid"],
        default: "unpaid",
    },
    activeRetailers: {
        type: Number,
        default: 0,
    },
    rated: {
        type: Boolean,
        default: false,
    }



}, {
    timestamps: true
})

export const UserRequest = mongoose.model("UserRequest", userRequestSchema);
