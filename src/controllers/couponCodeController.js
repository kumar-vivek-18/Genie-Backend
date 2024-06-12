import { CouponCode } from "../models/couponCode.modal.js";

export const createCouponCode = async (req, res) => {
    try {
        // Generate a random coupon code string
        const { couponCode, duration } = req.body;


        // Calculate expiry date, which is 5 days from the current date
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + duration);

        // Create a new CouponCode document
        const newCoupon = new CouponCode({
            couponCode: couponCode,
            expiryDate: expiryDate
        });

        // Save the new coupon code to the database
        const savedCoupon = await newCoupon.save();

        return res.status(201).json(savedCoupon);
    } catch (error) {
        // Handle any errors
        console.error('Error creating coupon code:', error);
        throw error; // or handle it according to your application's needs
    }
};


export const verifyCouponCode = async (req, res) => {
    try {
        const { couponCode } = req.query;

        // Find the coupon code in the database
        const coupon = await CouponCode.findOne({ couponCode });

        if (!coupon) {
            return res.status(404).json({ message: "Coupon code not found" });
        }

        // Check if the coupon code has expired
        const currentDate = new Date();
        if (currentDate > coupon.expiryDate) {
            return res.status(400).json({ message: "Coupon code has expired" });
        }

        // Coupon code is valid
        return res.status(200).json({ message: "Coupon code is valid" });
    } catch (error) {
        console.error('Error verifying coupon code:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};