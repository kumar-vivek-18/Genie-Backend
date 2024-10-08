import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
    userName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: "",
    },
    mobileNo: {
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
    pic: {
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    location: {
        type: String,
        trim: true,
        default: "",
    },
    coords: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
    longitude: {
        type: Number,
        default: 0,
    },
    latitude: {
        type: Number,
        default: 0,
    },
    uniqueToken: {
        type: String,
        default: "",
    },
    unpaidSpades: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserRequest',
        default: null,
    }],
    // lastSpadePrice: {
    //     type: Number,
    //     default: 0,
    // },
    // lastPaymentStatus: {
    //     type: String,
    //     enum: ["paid", "unpaid"],
    //     default: "paid",
    // },
    freeSpades: {
        type: Number,
        default: 25,
    },
    totalRating: {
        type: Number,
        default: 0,
    },
    totalReview: {
        type: Number,
        default: 0,
    },
    refreshToken: {
        type: String,
        default: "",
    }


},
    {
        timestamps: true
    });


UserSchema.methods.generateAccessToken = function () {
    // console.log(process.env.ACCESS_TOKEN_SECRET, process.env.ACCESS_TOKEN_EXPIRY);
    return jwt.sign({ _id: this._id, userName: this.userName }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });

}

UserSchema.methods.generateRefreshToken = function () {
    // console.log(process.env.REFRESH_TOKEN_SECRET, process.env.REFRESH_TOKEN_SECRET);
    return jwt.sign({ _id: this._id, userName: this.userName }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
}

export const User = mongoose.model('User', UserSchema);
