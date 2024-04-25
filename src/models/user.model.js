import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
    userName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    mobileNo: {
        type: String,
        required: true,
        unique: true,

    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    pic: {
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    location: {
        type: String,
        trim: true,
    }

},
    {
        timestamps: true
    })

export const User = mongoose.model('User', UserSchema);
