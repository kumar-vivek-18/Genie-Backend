import mongoose from 'mongoose';
import { Retailer } from '../models/retailer.model.js';

export const getUnApprovedRetailers = async (req, res) => {
    try {

        const retailers = await Retailer.find({ storeApproved: "new" }).sort({ updatedAt: -1 }).lean();

        if (!retailers) return res.status(404).json({ message: "No retailers found" });

        return res.status(200).json(retailers);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const allApprovedRetailers = async (req, res) => {
    try {

        const retailers = await Retailer.find({ storeApproved: "approved" }).sort({ createdAt: -1 }).lean();

        if (!retailers) return res.status(404).json({ message: 'No approved retailers' });

        return res.status(200).json(retailers);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const approveRetailers = async (req, res) => {
    try {
        const { retailerId } = req.body;

        // console.log('retailers approval', retailerId);
        if (!retailerId) return res.status(404).json({ message: 'Invalid retailer Id' });

        const approvedRetailers = await Retailer.findByIdAndUpdate(retailerId, { storeApproved: "approved", documentVerified: true }, { new: true }).lean();

        if (!approvedRetailers)
            return res.status(404).json({ message: "Retailer not found" });

        return res.status(200).json(approvedRetailers);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const rejectRetailers = async (req, res) => {
    try {
        const { retailerId } = req.body;

        if (!retailerId) return res.status(404).json({ message: 'Invalid retailer Id' });

        const approvedRetailers = await Retailer.findByIdAndUpdate(retailerId, { storeApproved: "rejected" }, { new: true }).lean();

        if (!approvedRetailers)
            return res.status(404).json({ message: "Retailer not found" });

        return res.status(200).json(approvedRetailers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const blockRetailers = async (req, res) => {
    try {
        const { retailerId } = req.body;
        if (!retailerId) return res.status(403).json({ message: "Invalid retailer id" });

        const approvedRetailers = await Retailer.findByIdAndUpdate(retailerId, { storeApproved: "blocked" }, { new: true }).lean();

        if (!approvedRetailers)
            return res.status(404).json({ message: "Retailer not found" });

        return res.status(200).json(approvedRetailers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const verifyDocument = async (req, res) => {
    try {
        const { retailerId } = req.body;

        if (!retailerId) return res.status(403).json({ message: "Retaier Id is required" });

        const verifiedRetailer = await Retailer.findByIdAndUpdate(retailerId, { documentVerified: true }, { new: true }).lean();

        if (!verifiedRetailer) return res.status(404).json({ message: "Retaieler not found" });

        return res.status(200).json(verifiedRetailer);

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}


// export const rejectDocument = async (req, res) => {
//     try {
//         const { retailerId } = req.body;

//         if (!retailerId) return res.status(403).json({ message: "Retaier Id is required" });

//         const verifiedRetailer = await Retailer.findByIdAndUpdate(retailerId, { documentVerified: true }).lean();

//         if (!verifiedRetailer) return res.status(404).json({ message: "Retaieler not found" });

//         return res.status(200).json(verifiedRetailer);

//     } catch (error) {
//         return res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// }