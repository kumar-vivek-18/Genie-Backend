import mongoose, { Schema } from "mongoose";

const QuerySchema = new Schema({
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

export const Query = mongoose.model("Query", QuerySchema);