import mongoose, { Schema } from 'mongoose';

const couponCodeSchema = new Schema({
    couponCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    }
}, {
    timestamps: true,
});

export const CouponCode = mongoose.model('CouponCode', couponCodeSchema);