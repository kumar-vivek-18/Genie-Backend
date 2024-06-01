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
    }

},
    {
        timestamps: true
    })

export const User = mongoose.model('User', UserSchema);
