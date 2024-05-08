import mongoose, { Schema } from 'mongoose';

const usersSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['UserRequest', 'Retailer']
    },
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
});

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
    users: [usersSchema]
},
    {
        timestamps: true,
    });

export const Chat = mongoose.model("Chat", ChatSchema);

