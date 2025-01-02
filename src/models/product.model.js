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
    productVerified: {
        type: Boolean,
        default: false,
    },
    productDescription: {
        type: String,
        trim: true,
        default: "",
    },
    productBrand: {
        type: String,
        trim: true,
        default: "",
    },
    productGender: {
        type: String,
        trim: true,
        default: "",
    },
    productPrice: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

productSchema.index({ productDescription: "text" });
export const Product = mongoose.model('Product', productSchema);