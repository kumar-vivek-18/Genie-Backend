import mongoose, { Schema } from "mongoose";

const contactSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    countryCode: {
        type: String,
        required: true,
    },
    mobileNo: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    requestId: {
        type: String,
        trim: true,
    },
    concern: [
        {
            type: String,
            required: true,
        }
    ]

});

export const Contact = mongoose.model("Contact", contactSchema);