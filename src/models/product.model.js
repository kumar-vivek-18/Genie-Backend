import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Retailer',
        default: null,
    },
    productCategory: {
        type: String,
        trim: true,
        default: "",
    },
    productImage: {
        type: String,
        trim: true,
        default: "",
    },
    productDescription: {
        type: String,
        trim: true,
        default: "",
    },
    productPrice: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);