import mongoose, { Schema } from 'mongoose';

const usersSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['UserRequest', 'RetailerRequest']
    },
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

const ChatSchema = mongoose.Schema({
    productDescription: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    users: [usersSchema]
},
    {
        timestamps: true,
    });

export const Chat = mongoose.model('Chat', ChatSchema);

