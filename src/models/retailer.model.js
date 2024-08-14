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
        trim: true,
        default: "",
    },
    storeImages: [{
        type: String,
        default: "https://res.cloudinary.com/kumarvivek/image/upload/v1718021385/fddizqqnbuj9xft9pbl6.jpg",
    }],
    storeCategory: {
        type: String,
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
    longitude: {
        type: Number,
        default: 0,
    },
    lattitude: {
        type: Number,
        default: 0,
    },
    coords: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
        }
    },
    storeApproved: {
        type: String,
        enum: ["new", "approved", "blocked", "rejected"],
        default: "new",
        index: true,
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
    },
    uniqueToken: {
        type: String,
        default: "",
    },
    serviceProvider: {
        type: String,
        enum: ["true", "false", "unknown"],
        default: "unknown",
    },
    totalRating: {
        type: Number,
        default: 0,
    },
    totalReview: {
        type: Number,
        default: 0,
    },
    profileCompleted: {
        type: Boolean,
        default: false,
    },
    freeSpades: {
        type: Number,
        default: 1000,
    },
    documentVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
        default: "",
    }

}, {
    timestamps: true
});

// Create a 2dsphere index on the coords field
RetailerSchema.index({ coords: "2dsphere" });

RetailerSchema.methods.generateAccessToken = function () {
    return jwt.sign({ _id: this._id, storeOwnerName: this.storeOwnerName }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });

}

RetailerSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id, storeOwnerName: this.storeOwnerName }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
}

export const Retailer = mongoose.model('Retailer', RetailerSchema);
