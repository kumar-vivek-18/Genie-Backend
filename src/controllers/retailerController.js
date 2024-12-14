
import { Retailer } from '../models/retailer.model.js';
import { User } from '../models/user.model.js';
import { UserRequest } from '../models/userRequest.model.js';
// import { Message } from '../models/message.model.js';
import { Chat } from '../models/chat.model.js';
import jwt from 'jsonwebtoken';
import { lchown } from 'fs/promises';

const generateAccessAndRefreshToken = async (retailerId) => {
    try {
        const retailer = await Retailer.findById(retailerId);
        const accessToken = retailer.generateAccessToken();
        const refreshToken = retailer.generateRefreshToken();

        retailer.refreshToken = refreshToken;
        await retailer.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        return res.status(500).json({ message: 'Error generating while generating access and refresh token' });

    }
}

export const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.query.refreshToken || req.cookies.refreshToken;
        if (!incomingRefreshToken)
            return res.status(401).json({ message: 'Unauthorized request' });

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const retailer = await Retailer.findById(decodedToken._id);

        if (!retailer) return res.status(401).json({ message: "Invalid incoming refresh token" });

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(retailer._id);

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200).cookie("refreshToken", refreshToken, options).cookie("accessToken", accessToken, options).json({ accessToken, refreshToken });
    }
    catch (error) {
        return res.status(401).json({ message: "Error while generating refresh token" });
    }
}

export const createNewRetailer = async (req, res) => {
    try {
        const data = req.body;
        // console.log('retailer data', data);

        if (!data.storeMobileNo || !data.storeName || !data.storeOwnerName || !data.storeCategory) return res.status(403).json({ message: "Some fields are empthy" });

        const retailer = await Retailer.create({
            storeMobileNo: data.storeMobileNo, storeName: data.storeName,
            storeOwnerName: data.storeOwnerName, storeCategory: data.storeCategory,
            panCard: `${data?.panCard ? data.panCard : ""}`, homeDelivery: data.homeDelivery
        });

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(retailer._id);

        const options = {
            httpOnly: true,
            secure: true
        }
        if (!retailer)
            return res.status(500).json({ message: "Error Occured" });

        return res.status(201).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({ retailer, accessToken, refreshToken });


    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
}

export const getRetailer = async (req, res) => {
    try {
        const data = req.query;
        if (!data.storeMobileNo) return res.status(403).json({ message: "Store Mobile No is required" });
        const retailer = await Retailer.findOne({ storeMobileNo: data.storeMobileNo }).lean();
        if (!retailer)
            return res.json({ status: 404, message: "User Not Found!" });

        if (retailer) {
            const { accessToken, refreshToken } = await generateAccessAndRefreshToken(retailer._id);
            const options = {
                httpOnly: true,
                secure: true
            }
            return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({ retailer, accessToken, refreshToken });
        }

    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
}

export const logoutRetailer = async (req, res) => {
    try {
        const { id } = req.body;

        const retailer = await Retailer.findByIdAndUpdate(id, { $unset: { refreshToken: true, uniqueToken: true } });

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json({ message: "Retailer logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error while logging out retailer" });
    }
}

export const editRetailerDetails = async (req, res) => {
    try {
        const data = req.body;
        const user = await Retailer.findByIdAndUpdate(data._id, data, { new: true }).lean();
        if (user) {
            return res.status(200).json(user);
        }
        else {
            return res.json({ status: 404, message: 'Retailer not found' });
        }
    } catch (error) {

        res.status(500);
        throw new Error(error.message);
    }
}


export const getRetailerHistory = async (req, res) => {
    try {
        const data = req.query;
        const UserChats = await Chat.find({
            $and: [
                {
                    $or: [
                        { requestType: "rejected" },
                        { requestType: "closedHistory" },
                        { requestType: "completed" },
                        { requestType: "notParticipated" },
                    ],

                },
                {
                    users: { $elemMatch: { refId: data.id } }
                }

            ]
        }).populate('requestId').populate('customerId').populate('retailerId', '_id uniqueToken storeCategory storeOwnerName storeName').populate('latestMessage', 'message').lean().sort({ updatedAt: -1 });

        // Iterate through each chat and populate users
        await Promise.all(UserChats.map(async chat => {
            // Populate each user in the users array
            await Promise.all(chat.users.map(async user => {
                const model = user.type === 'UserRequest' ? UserRequest : Retailer;
                // console.log('model', model);
                user.populatedUser = await model.findById(user.refId);
            }));
        }));

        // console.log('chats data', UserChats);


        if (UserChats.length > 0)
            return res.status(200).json(UserChats);
        else
            return res.status(404).json({ message: "Retailer Chat not found" });
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getUniqueToken = async (req, res) => {
    try {
        const data = req.query;
        if (!data.id) return res.status(404).json({ message: 'Invalid id' });
        const uniqueToken = await Retailer.findById(data.id).lean();
        return res.status(200).json(uniqueToken.uniqueToken);
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getStoreCategoriesNearMe = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        if (!latitude || !longitude) return res.status(404).json("Invalid latitude or longitude");

        const storeCategories = await Retailer.distinct('storeCategory', {
            coords: {
                $geoWithin: {
                    $centerSphere: [
                        [longitude, latitude], 13 / 6371
                    ]
                }
            }
        })
        return res.status(200).json(storeCategories);
    } catch (error) {
        throw new Error(error.message);
    }
}

export const availableCategories = async (req, res) => {
    try {
        const searchData = [
            { id: 1, title: 'Fashion/Clothings', subTitle: 'Top, bottom, dresses',imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733422452/fashion_top_cxrlm0.jpg" },
            { id: 2, title: 'Fashion Accessories', subTitle: 'Shoes, bags etc' ,imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733422450/fashion_shoes_c0hrmq.jpg"},
            { id: 3, title: 'Fashion Accessories', subTitle: 'Sharee, suits, kurti & dress materials etc',imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733421956/fashion_cesup3.jpg" },
            { id: 4, title: 'Gifts, Kids Games,Toys & Accessories', subTitle: '' ,imgUri: "https://res.cloudinary.com/dkay5q6la/image/upload/v1733422449/gifts_eia9dk.jpg",},
            { id: 5, title: 'Consumer Electronics & Accessories', subTitle: 'Home appliances and equipment etc',imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733422453/consumer_electronics_rplbgv.jpg" },
            { id: 6, title: 'Fashion Accessories', subTitle: 'Jewellery, Gold & Diamond',imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733422452/fashion_accessories_iof7jd.jpg" },
            { id: 7, title: 'Agriculture equipments', subTitle: '' ,imgUri:""},
            { id: 8, title: 'Automotive Parts/Services', subTitle: '2 wheeler Fuel based',imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733422440/2-wheeler_xliwnk.jpg" },
            { id: 9, title: 'Automotive Parts/Services', subTitle: '2-wheeler EV',imgUri:"" },
            { id: 10, title: 'Automotive Parts/service', subTitle: '3-wheeler, commercial vehicles & EV',imgUri:"" },
            { id: 11, title: 'Automotive Parts/Services', subTitle: '4 wheeler Fuel based',imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733422440/4-wheeler_fp0sy6.jpg" },
            { id: 12, title: 'Automotive Parts/Services', subTitle: '4-wheeler EV',imgUri:"" },
            { id: 13, title: 'Carpenter Service', subTitle: 'Repair',imgUri:"" },
            { id: 14, title: 'Consumer Electronics & Accessories', subTitle: 'Mobile, Laptop, digital products etc',imgUri:"" },
            { id: 15, title: 'Luxury Watches & Service', subTitle: '' ,imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733422448/luxury_a20pfl.jpg"},
            { id: 16, title: 'Cosmetics & Cosmeceuticals', subTitle: '' ,imgUri:""},
            { id: 17, title: 'Dry Cleaning & Laundry', subTitle: 'Clothes and accessories' ,imgUri:""},
            { id: 18, title: 'Electrical Equipment Services & Repair', subTitle: 'AC, Fridge, Cooler repair etc' ,imgUri:""},
            { id: 19, title: 'Electrical Hardware & Accessories', subTitle: 'Inverter, batteries, Solar etc',imgUri:"" },
            { id: 20, title: 'Electrical Hardware & Accessories', subTitle: 'Wiring, equipment, lights etc' ,imgUri:""},
            { id: 21, title: 'Electrical Services & Repair', subTitle: 'Electrician',imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733422441/electrician_og5kni.jpg", },
            { id: 22, title: 'Fashion Accessories', subTitle: 'Eyewear etc',imgUri:"" },
            { id: 23, title: 'Gardening Services', subTitle: '',imgUri:"" },
            { id: 24, title: 'Grocery & Kirana', subTitle: '' ,imgUri:""},
            { id: 25, title: 'Hardware', subTitle: 'Cement, Hand tools, Powertools etc',imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733422446/hardware_hand_fehtye.jpg", },
            { id: 26, title: 'Hardware', subTitle: 'Plumbing, Paint,& Electricity',imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733422447/hardware_paint_xyfrp8.jpg" },
            { id: 27, title: 'Home & Function Decoration', subTitle: '',imgUri:"https://res.cloudinary.com/kumarvivek/image/upload/v1730174790/decoration_f69hnj.jpg", },
            { id: 28, title: 'Home Furnishing', subTitle: 'Blanket, Pillow, Curtains etc',imgUri:"" },
            { id: 29, title: 'Home Furnishing', subTitle: 'Furniture etc',imgUri:"" },
            { id: 30, title: 'Kitchen Utensils & Kitchenware', subTitle: '' ,imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733422444/kitchen_xjnvwq.jpg"},
            { id: 31, title: 'Medical Store & Healthcare', subTitle: '',imgUri:"" },
            { id: 32, title: 'Music instruments , Accessories & maintenance services', subTitle: '',imgUri:"" },
            { id: 33, title: 'Paintings & Art', subTitle: '',imgUri:"" },
            { id: 34, title: 'Pet Care & Food', subTitle: '' ,imgUri:""},
            { id: 35, title: 'Plants & Gardening Accessories', subTitle: '' ,imgUri:""},
            { id: 36, title: 'Services & Repair, Consumer Electronics & Accessories', subTitle: 'Home appliances and equipment etc' ,imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733422444/electronics_s67wgn.jpg",},
            { id: 37, title: 'Services & Repair, Consumer Electronics & Accessories', subTitle: 'Mobile, Laptop, digital products etc',imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733422443/mobile_hjahoi.jpg", },
            { id: 38, title: 'Services & Repair, Heavy Construction & Commercial Vehicles', subTitle: 'JCB, Cranes, Trucks etc',imgUri:"https://res.cloudinary.com/dkay5q6la/image/upload/v1733422440/heavy_ihqf48.jpg", },
            { id: 39, title: 'Sports Accessories & Services', subTitle: 'Cricket, Football, Basketball etc' ,imgUri:""},
            { id: 40, title: 'Sports Nutrition', subTitle: 'Whey Pro etc' ,imgUri: "https://res.cloudinary.com/dkay5q6la/image/upload/v1733422447/sports_ee5x0s.jpg",},
            { id: 41, title: 'Stationary & Book Stores', subTitle: '',imgUri:"" },
            { id: 42, title: 'Tailor', subTitle: 'Makes or alters clothing' ,imgUri:""}
        ];


        return res.status(200).json(searchData);
    } catch (error) {
        res.status(404).json({ error: error });
    }


}


export const nearBySellers = async (req, res) => {
    try {
        const { lat, lon, page = 1, limit = 10, query } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ message: 'Invalid coordinates' });
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        let sellers = [];
        if (!query) {
            sellers = await Retailer.find({
                coords: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(lon), parseFloat(lat)]
                        },
                        $maxDistance: 13000
                    }
                }
            }).select('-__v -createdAt -updatedAt -storeMobileNo -coords -storeApproved -panCard -uniqueToken -profileCompleted -freeSpades -documentVerified -refreshToken')
                .lean().limit(limitNumber).skip(skip);
        }
        else {
            sellers = await Retailer.find({
                $and: [
                    {
                        $or: [
                            {
                                storeName: {
                                    $regex: query,
                                    $options: 'i'
                                },
                            },
                            {
                                storeCategory: {
                                    $regex: query,
                                    $options: 'i'
                                }
                            },
                        ]
                    },

                    {
                        coords: {
                            $near: {
                                $geometry: {
                                    type: "Point",
                                    coordinates: [parseFloat(lon), parseFloat(lat)]
                                },
                                $maxDistance: 13000
                            }
                        }
                    }
                ]
            }).select('-__v -createdAt -updatedAt -storeMobileNo -coords -storeApproved -panCard -uniqueToken -profileCompleted -freeSpades -documentVerified -refreshToken')
                .lean().limit(limitNumber).skip(skip);
        }

        return res.status(200).json(sellers);
    }
    catch (error) {
        throw new Error(error.message);
    }
}

export const currentVersion = async (req, res) => {
    try {
        const version = "1.21.0";
        return res.status(200).json(version);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

