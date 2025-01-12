import { response } from "express";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";

import nodemailer from 'nodemailer';



// Configure Nodemailer
// const transporter = nodemailer.createTransport({
//     service: 'gmail', 
//     auth: {
//         user:"chandreshprajapaticppc@gmail.com", 
//         pass:"girj uazf iaxk uwlw"
//     }
// });

// export const createConcer = async (req, res) => {
//     try {
//         console.log("user find");
//         const { name, mobileNo, email, concern, countryCode,requestId } = req.body;
//         const user = await Contact.findOne({ email: email, mobileNo: mobileNo });
//         console.log("user find", user, mobileNo, email, concern, countryCode,requestId);

//         let response;
//         if (user) {
//             user.concern.push(concern);
//             await user.save();
//             response = user;
//         } else {
//             const newConcern = await Contact.create({ name: name, countryCode: countryCode, mobileNo: mobileNo, email: email,requestId:requestId, concern: [concern] });
//             response = newConcern;
//         }

//         // Prepare email data
//         const mailOptions = {
//             from:`${email}`,
//             to: 'info@culturtap.com',
//             subject: 'New Report Concern',
//             text: `Name: ${name}\nCountry Code: ${countryCode}\nMobile No: ${mobileNo}\nEmail: ${email}\nRequestId: ${requestId}\nConcern: ${concern}`
//         };

//         // Send email
//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.error('Error sending email:', error);
//                 return res.status(500).json({ message: 'Error sending email', error });
//             } else {
//                 console.log('Email sent:', info.response);
//                 res.status(201).json(response);
//             }
//         });
//     } catch (error) {
//         res.status(400).json(error);
//     }
// };



export const addProduct = async (req, res) => {
    const { vendorId, productDescription, productPrice, productCategory, productImage } = req.body;
    console.log(vendorId)
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

       

        // const mailOptions = {
        //     from:`chandresh@gmail.com`,
        //     to: 'chandreshprajapaticppc@gmail.com',
        //     subject: 'New Product Added',
        //     text: `Approve the new product`,
           
        //     html: '<p>Click <a href=`http://localhost:3000/products/${createdproduct._id}`>Verify</a> </p>'
        // };

        // // Send email
        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.error('Error sending email:', error);
        //         return res.status(500).json({ message: 'Error sending email', error });
        //     } else {
        //         console.log('Email sent:', info.response);
        //         res.status(201).json(response);
        //     }
        // });
        return res.status(201).json(createProduct);

    } catch (error) {
        // Log error for debugging (optional)
        console.error(error);

        // Return internal server error
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export const singleProduct = async (req, res) => {
    try {
        // Extract productId from the request body
        const { productId } = req.query;

        console.log(productId)

        // Check if productId is provided
        if (!productId) return res.status(400).json({ message: "Product Id is required" });

        // Check if productId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(401).json({ message: "Invalid Product Id format" });
        }

        // Attempt to find and delete the product by its ID
        const product = await Product.findById(productId);

        // If no product is found with the given ID
        if (!product) return res.status(404).json({ message: "Product not found with this ID" });

      
        return res.status(200).json(product);
        

    } catch (error) {
        // Return server error in case of an exception
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const verifyProduct = async (req, res) => {
    try {
        // Extract productId from the request body
        const { productId } = req.query;

        console.log(productId)

        // Check if productId is provided
        if (!productId) return res.status(400).json({ message: "Product Id is required" });

        // Check if productId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(401).json({ message: "Invalid Product Id format" });
        }

        // Attempt to find and delete the product by its ID
        const product = await Product.findByIdUpdate(productId,{productVerified:true});

        // If no product is found with the given ID
        if (!product) return res.status(404).json({ message: "Product not found with this ID" });

      
        return res.status(200).json(product);
        

    } catch (error) {
        // Return server error in case of an exception
        return res.status(500).json({ message: "Internal server error", error: error.message });
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
        const { vendorId, page = 1 ,limit=10} = req.query;

        // Check if vendorId is provided
        const pageNumber = parseInt(page, 10);
        const skipCnt = (pageNumber - 1) * limit;
        if (!vendorId) return res.status(400).json({ message: "VendorId is required" });

        // Find products with the given vendorId
        const products = await Product.find({ vendorId }).sort({ updatedAt: -1 }).lean().skip(skipCnt).limit(10).sort({ createdAt: -1 });

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
        const { productCategory, page = 1 ,limit=10} = req.query;

        const pageNumber = parseInt(page, 10);
       
        const skipCnt = (pageNumber - 1) * limit;

        // Check if productCategory is provided
        if (!productCategory) return res.status(400).json({ message: "Product category is required" });

        // Find products with the given productCategory
        const products = await Product.find({ productCategory }).sort({ updatedAt: -1 }).lean().skip(skipCnt).limit(10);

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


export const getAllProductsCategory = async (req, res) => {
    try {
        // Extract productCategory from the request body
        const { productCategory } = req.query;

       

        // Check if productCategory is provided
        if (!productCategory) return res.status(400).json({ message: "Product category is required" });

        const products = await Product.find({ productCategory }).sort({ updatedAt: -1 });

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

export const updateProductCategory = async (req, res) => {
    try {
       
        const { prevCategory, newCategory } = req.body;

        if (!prevCategory || !newCategory) {
            return res.status(400).json({ message: "Both prevCategory and newCategory are required" });
        }

        // Update all products with prevCategory to the newCategory
        const updateResult = await Product.updateMany(
            { productCategory: prevCategory }, // Filter: match previous category
            { $set: { productCategory: newCategory } } // Update: set new category
        );

        // Check if any documents were modified
        if (updateResult.modifiedCount === 0) {
            return res.status(404).json({ message: "No products found with the previous category" });
        }

        // Return success response
        return res.status(200).json({
            message: "Product category updated successfully",
            updatedCount: updateResult.modifiedCount
        });

    } catch (error) {
        // Handle and return internal server error
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


export const getProductByQuery = async (req, res) => {
    try {
        const { query, productCategory, productBrand, productGender, page = 1,limit=10 } = req.query;

        const pageNumber = parseInt(page, 10);
      
        const skipCnt = (pageNumber - 1) * limit;

        if (!productCategory) {
            return res.status(400).json({ message: "Product category is required" });
        }

        // Build the search criteria
        let searchCriteria = { productCategory };

        if (query) {
            // Add fuzzy search using text index
            searchCriteria.$text = { $search: query };
        }

        // Search for productBrand in productDescription if provided
        if (productBrand) {
            searchCriteria.productDescription = {
                $regex: productBrand,
                $options: "i", // Case-insensitive regex search
            };
        }

        
        if (productGender) {
            searchCriteria.productDescription = {
                ...searchCriteria.productDescription, // Preserve existing regex conditions
                $regex: productGender,
                $options: "i", // Case-insensitive regex search
            };
        }

        // Find and paginate products based on the search criteria
        const products = await Product.find(
            searchCriteria,
            query ? { score: { $meta: "textScore" } } : {} // Include text score only if query exists
        )
            .sort(query ? { score: { $meta: "textScore" }, updatedAt: -1 } : { updatedAt: -1 }) // Sort by text score and updatedAt if query exists
            .lean()
            .skip(skipCnt)
            .limit(limit);

        // If no products are found, return a 404 status
        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        // Return the list of products if found
        return res.status(200).json(products);
    } catch (error) {
        // Handle and return internal server error
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const searchProduct = async (req, res) => {
    try {
        const { query, page = 1 ,limit=10} = req.query;

        const pageNumber = parseInt(page, 10);
        
        const skipCnt = (pageNumber - 1) * limit;

        // Build the search criteria
        const searchCriteria = query
            ? { $text: { $search: query } } // Fuzzy search using text index if query exists
            : {}; // Return all products if no query is provided

        // Find and paginate products based on the search criteria
        const products = await Product.find(
            searchCriteria,
            query ? { score: { $meta: "textScore" } } : {} // Include text score for sorting if query exists
        )
            .sort(
                query
                    ? { score: { $meta: "textScore" }, updatedAt: -1 } // Sort by text score and updatedAt if query exists
                    : { updatedAt: -1 } // Sort by updatedAt if no query
            )
            .lean()
            .skip(skipCnt)
            .limit(limit);

        // If no products are found, return a 404 status
        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        // Return the list of products if found
        return res.status(200).json(products);
    } catch (error) {
        // Handle and return internal server error
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



