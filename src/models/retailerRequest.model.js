import mongoose, { Schema } from 'mongoose';

const retailerRequestSchema = new Schema({
    retailer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Retailer',
        required: true
    },
    requestDescription: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    requesPic: [
        {
            type: String,
            default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
        }
    ],
    expectedPrice: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
}
);

export const RetailerRequest = mongoose.model('RetailerRequest', retailerRequestSchema);