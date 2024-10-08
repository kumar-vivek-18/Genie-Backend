import mongoose, { Schema } from 'mongoose';
import { UserRequest } from './userRequest.model.js';
import { Retailer } from './retailer.model.js';



const ChatSchema = mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserRequest',
        required: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    retailerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Retailer',
        required: true,
    },
    requestType: {
        type: String,
        trim: true,
        required: true,
        enum: ["new", "ongoing", "cancelled", "completed", "closed", "closedHistory", "win", "rejected", "notPartcipated"],
        default: "new",
        index: true
    },
    bidCompleted: {
        type: Boolean,
        default: false,
    },
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
    unreadCount: {
        type: Number,
        default: 0
    },
    users: [
        {
            type: {
                type: String,
                enum: ['UserRequest', 'Retailer']
            },
            refId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                index: true

            }
        }],
    bidFlow: [{
        amount: { type: Number },
        status: { type: String }
    }],
    rated: {
        type: Boolean,
        default: false,
    },
    retailerRated: {
        type: Boolean,
        default: false,
    }

},
    {
        timestamps: true,
    });

// ChatSchema.virtual('populatedUsers', {
//     ref: function (doc) {
//         // Dynamically select the model based on the type field
//         return doc.users.type === 'UserRequest' ? 'UserRequest' : 'Retailer';
//     },
//     localField: 'users.refId',
//     foreignField: '_id',
//     justOne: false // Assuming each user can be referenced only once
// });

// // Apply virtual population to users
// ChatSchema.set('toObject', { virtuals: true });
// ChatSchema.set('toJSON', { virtuals: true });


export const Chat = mongoose.model("Chat", ChatSchema);

