import mongoose, { Schema } from 'mongoose';
import { UserRequest } from './userRequest.model.js';
import { Retailer } from './retailer.model.js';

// const usersSchema = new mongoose.Schema({
//     type: {
//         type: String,
//         enum: ['UserRequest', 'Retailer']
//     },
//     refId: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         refPath: 'users.type'
//     }
// });

const ChatSchema = mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserRequest',
        required: true,
    },
    requestType: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
        enum: ["new", "ongoing"],
        default: "new"
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

            }
        }]
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

