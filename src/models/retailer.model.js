import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken';

const RetailerSchema = new Schema({
    storeOwnerName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: "",
    },
    storeName: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        default: "",
    },
    storeDescription: {
        type: String,
        trim: true,
        default: "",
    },
    storeMobileNo: {
        type: String,
        required: true,
        unique: true,
        index: true,
        default: "",
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        default: "",
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
        default: "",
    },
    location: {
        type: String,
        lowercase: true,
        trim: true,
        default: "",
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
        default: "",
    }

}, {
    timestamps: true
})

export const Retailer = mongoose.model('Retailer', RetailerSchema);
