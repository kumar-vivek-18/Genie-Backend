import mongoose, { Schema } from 'mongoose';

// Define a common schema that acts as an interface for both User and Retailer
const senderSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['UserRequest', 'Retailer']
    },
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

const messageModel = mongoose.Schema({
    sender: senderSchema, // Reference the common sender schema
    userRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserRequest",
        required: true,
    },
    message: {
        type: String,
        trim: true,
        default: ""
    },
    bidType: {
        type: String,
        enum: ["false", "true", "image", "update", "location", "document"],
        default: "false",
    },
    bidPrice: {
        type: Number,
        default: 0
    },
    bidImages: [
        {
            type: String,
        }
    ],
    bidAccepted: {
        type: String,
        enum: ["new", "accepted", "rejected"],
        default: "new",
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
        index: true,
    },
    warranty: {
        type: Number,
        default: 0,
    },
    longitude: {
        type: Number,
        default: 0,
    },
    latitude: {
        type: Number,
        default: 0,
    }
},
    {
        timestamps: true,
    });

export const Message = mongoose.model('Message', messageModel);

