import { response } from "express";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";


export const addProduct = async (req, res) => {
    const { vendorId, productDescription, productPrice, productCategory, productImage } = req.body;
    try {
        // Validate required fields
        if (!vendorId || !productDescription || !productCategory || !productPrice) {
            return res.status(400).json({ message: "Please fill in all required fields" });
        }
        let productImage = null;
        if (req.files) {
            const images = req.files.map(file => `${process.env.SERVER_URL}/uploads/${file.filename}`);
            productImage = images[0];
        }

        console.log(productImage);

        // Create the product
        const createProduct = await Product.create({
            vendorId,
            productDescription,
            productCategory,
            productImage,
            productPrice,
        });

        // Handle if product creation failed
        if (!createProduct) {
            return res.status(409).json({ message: "An error occurred while creating the product" });
        }

        // Return success response
        return res.status(201).json(createProduct);

    } catch (error) {
        // Log error for debugging (optional)
        console.error(error);

        // Return internal server error
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


export const removeProduct = async (req, res) => {
    try {
        // Extract productId from the request body
        const { productId } = req.query;

        // Check if productId is provided
        if (!productId) return res.status(400).json({ message: "Product Id is required" });

        // Check if productId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(401).json({ message: "Invalid Product Id format" });
        }

        // Attempt to find and delete the product by its ID
        const removedProduct = await Product.findByIdAndDelete(productId);

        // If no product is found with the given ID
        if (!removedProduct) return res.status(404).json({ message: "Product not found with this ID" });

        // Successful deletion response
        return res.status(200).json({ message: "Product removed successfully" });

    } catch (error) {
        // Return server error in case of an exception
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const getProductsByVendorId = async (req, res) => {
    try {
        // Extract vendorId from the request body
        const { vendorId } = req.query;

        // Check if vendorId is provided
        if (!vendorId) return res.status(400).json({ message: "VendorId is required" });

        // Find products with the given vendorId
        const products = await Product.find({ vendorId }).sort({ updatedAt: -1 }).lean();

        // If no products are found, return a 404 status
        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found for this vendor" });
        }

        // Return the list of products if found
        return res.status(200).json(products);

    } catch (error) {
        // Handle and return internal server error
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


export const getProductByCategory = async (req, res) => {
    try {
        // Extract productCategory from the request body
        const { productCategory } = req.query;

        // Check if productCategory is provided
        if (!productCategory) return res.status(400).json({ message: "Product category is required" });

        // Find products with the given productCategory
        const products = await Product.find({ productCategory }).sort({ updatedAt: -1 }).lean();

        // If no products are found, return a 404 status
        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found in this category" });
        }

        // Return the list of products if found
        return res.status(200).json(products);

    } catch (error) {
        // Handle and return internal server error
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}



