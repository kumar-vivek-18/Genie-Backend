import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken';

const RetailerSchema = new Schema({
    storeOwnerName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    storeName: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        index: true
    },
    storeDescription: {
        type: String,
        trim: true,
    },
    storeMobileNo: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
    },
    storeImages: [{
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    }],
    storeCategory: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        lowercase: true,
        trim: true,
    },
    storeApproved: {
        type: Boolean,
        default: false,
    },
    homeDelivery: {
        type: Boolean,
        default: false,
    },
    panCard: {
        type: String,
        lowercase: true,
        trim: true,
    }

}, {
    timestamps: true
})

export const Retailer = mongoose.model('Retailer', RetailerSchema);
