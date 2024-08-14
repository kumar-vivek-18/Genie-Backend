import { Chat } from '../models/chat.model.js';
import { User } from '../models/user.model.js';
import { Retailer } from '../models/retailer.model.js';
import { UserRequest } from '../models/userRequest.model.js';
import { Message } from '../models/message.model.js';
import jwt from 'jsonwebtoken';

const generateAccessRefreshToken = async (userId) => {
    try {
        // console.log('userId', userId.toString());
        const user = await User.findById(userId.toString());
        // console.log('generaing tokne', user._id);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // console.log(accessToken, refreshToken);
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSafe: false });

        return { accessToken, refreshToken };
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong while generating refresh token and access token" });
    }
}

export const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.query.refreshToken || req.cookies.refreshToken;

        // console.log('incoming refresh token', incomingRefreshToken);
        if (!incomingRefreshToken)
            return res.status(401).json({ message: "Unauthorized request" });

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        // console.log('decoded-token', decodedToken);
        const user = await User.findById(decodedToken?._id);

        if (!user)
            return res.status(401).json({ message: "Invalid refresh token" });

        const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: true,
        }


        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({ accessToken, refreshToken });

    } catch (error) {
        return res.status(500).json({ message: "Error generating refresh token" });
    }
}


export const getUser = async (req, res) => {
    try {
        const { mobileNo } = req.query;
        // console.log(mobileNo);
        const user = await User.findOne({ mobileNo });
        // console.log('user', user);
        if (!user)
            return res.json({ status: 404, message: 'User not found' });

        // console.log('hii');
        if (user) {
            const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id);

            // console.log({ accessToken, refreshToken });
            // const loggedInUser = await User.findById(user._id).select('-refreshToken');

            const options = {
                httpOnly: true,
                secure: true,
            }

            return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({ user, accessToken, refreshToken });
        }
        // return res.status(200).json(user);


    } catch (error) {
        res.status(500);
        // console.error(error.message);
        throw new Error('Error while getting user', error);
    }
};

export const registerUser = async (req, res) => {
    try {
        // console.log('first', req.body);
        const { userName, mobileNo } = req.body;
        if (!userName || !mobileNo) return res.status(404).json({ message: "Invalid signup details" });

        const user = await User.create({ userName: userName, mobileNo: mobileNo });

        if (!user)
            return res.status(404).json({ message: 'User not created' });

        const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id);

        // console.log(accessToken, refreshToken);


        const options = {
            httpOnly: true,
            secure: true,
        }
        return res.status(201).cookie("refreshToken", refreshToken, options).cookie("accessToken", accessToken, options).json({ user, accessToken, refreshToken });


    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
}

export const logoutUser = async (req, res) => {
    try {
        const { id } = req.body();

        await User.findByIdAndUpdate(id, { $unset: { refreshToken: true, uniqueToken: true } }, { new: true });

        const options = {
            http: true,
            secure: true,
        }

        return res.status(200).clearCookie("accessToken", options)
            .clearCookie("refreshToken", options).json({ message: "User logged out successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Error while logging out" });

    }
}


// Remaining Transaction process i.e. Acid Properties setup
export const createRequest = async (req, res) => {
    try {
        const { customerID, request, requestCategory, expectedPrice, spadePrice, appliedCoupon, longitude, latitude } = req.body;

        // console.log(customerID, request, requestCategory, expectedPrice, spadePrice, appliedCoupon, longitude, latitude);

        const requestImages = [];
        if (req.files && Array.isArray(req.files)) {
            const imageUrl = req.files.map(file => `${process.env.SERVER_URL}/uploads/${file.filename}`);
            requestImages.push(...imageUrl);
        }

        // console.log('reqImages', requestImages);

        const retailers = await Retailer.find({
            $and: [{ storeCategory: requestCategory }, { storeApproved: "approved" }, {
                coords: {
                    $geoWithin: {
                        $centerSphere: [
                            [longitude, latitude], 10 / 6371
                        ]
                    }
                }
            }]
        });

        // console.log('retailers length while creating spade', retailers.length);
        const uniqueTokens = [];

        if (!retailers || !retailers.length) {
            return res.status(404).json({ message: 'No retailers found for the requested category' });
        }

        // retailers.map(retailer => {
        //     uniqueTokens.push(retailer.uniqueToken);
        // });

        const userRequest = await UserRequest.create({ customer: customerID, requestDescription: request, requestCategory: requestCategory, requestImages: requestImages, expectedPrice: expectedPrice, spadePrice: spadePrice, appliedCouponCode: appliedCoupon, paymentStatus: "unpaid" });

        if (!userRequest) {
            return res.status(404).json({ message: 'Request not created' });
        }



        const retailerRequests = await Promise.all(retailers.map(async (retailer) => {
            const retailerChat = await Chat.create({ requestId: userRequest._id, customerId: customerID, retailerId: retailer._id, requestType: 'new', users: [{ type: 'Retailer', refId: retailer._id }] });

            if (retailerChat) {
                const firstBid = await Message.create({ sender: { type: 'UserRequest', refId: userRequest._id }, userRequest: userRequest._id, message: request, bidType: "false", bidPrice: expectedPrice, bidImages: requestImages, bidAccepted: 'new', chat: retailerChat._id });
                uniqueTokens.push({ token: retailer.uniqueToken, chatId: retailerChat._id, socketId: retailerChat.users[0]._id })
                if (!firstBid) {
                    throw new Error('Failed to create first bid');
                }
                retailerChat.latestMessage = firstBid._id;

            }

            return retailerChat;
        }));

        if (spadePrice == 0) {
            await User.findByIdAndUpdate(
                customerID,
                { $inc: { freeSpades: -1 } }
            );
        }

        const userDetails = await User.findById(customerID);

        if (userDetails.freeSpades > 0) {
            // console.log(userDetails.freeSpades);
            userDetails.freeSpades = userDetails.freeSpades - 1;
            // console.log(userDetails.freeSpades);
            await userDetails.save();
            // console.log(userDetails.freeSpades);
        }

        if (!retailerRequests.length) {
            return res.status(404).json({ message: 'Request not created due to no retailer found of particular category' });
        }

        return res.status(201).json({ userRequest, uniqueTokens, userDetails });
    } catch (error) {
        // console.error('Error in createRequest:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


export const editProfile = async (req, res) => {
    try {
        const { _id, updateData } = req.body;
        // console.log('data', updateData);
        const user = await User.findByIdAndUpdate(_id, updateData, { new: true });
        if (user) {
            return res.status(200).json(user);
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}



export const getSpades = async (req, res) => {
    try {
        const data = req.query;
        // console.log('spades data', data);
        if (!data.id) return res.status(403).json({ message: "User id is required" });
        const spades = await UserRequest.find({
            $and: [
                { customer: data.id },
                {
                    $or: [
                        { requestActive: "active" },
                        { requestActive: "completed" }
                    ]
                }
            ]
        }).sort({ updatedAt: -1 }).lean();

        // console.log('spades', spades);
        if (spades.length > 0) {
            return res.status(200).json(spades);
        } else {
            return res.status(404).json({ message: 'No spades found' });
        }

    } catch (error) {
        throw new Error(error.message);
    }
}


export const closeAcitveSpade = async (req, res) => {
    try {
        const { id } = req.body;

        const updateRequest = await UserRequest.findByIdAndUpdate(id, { requestActive: "closed", bidCompleted: true }, { new: true });

        if (!updateRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const chats = await Chat.find({ requestId: id }).populate('retailerId').lean();
        const uniqueTokens = [];

        await Promise.all(chats.map(chat => {
            // return Chat.findByIdAndDelete(chat._id);

            if (chat.requestType === "new")
                return Chat.findByIdAndUpdate(chat._id, { requestType: "new" }).lean();
            else if (chat.requestType === "ongoing") {
                if (chat?.retailerId?.uniqueToken.length > 0)
                    uniqueTokens.push(chat?.retailerId?.uniqueToken);
                return Chat.findByIdAndUpdate(chat._id, { requestType: "closed" }).lean();
            }
        }))

        return res.status(200).json({ updateRequest, uniqueTokens });

    } catch (error) {
        throw new Error(error.message);
    }
}

export const closeSpade = async (req, res) => {
    try {
        const { id } = req.body;

        // Find and update the UserRequest by id
        // console.log('close request id: ' + id);
        const updateRequest = await UserRequest.findByIdAndUpdate(
            id, // The ID of the request to update
            { requestActive: "closed" }, // The fields to update
            { new: true } // Return the updated document
        ).lean();

        if (!updateRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Find and update the associated Chat by id
        // const updateAcceptedChat = await Chat.findByIdAndUpdate(
        //     updateRequest.requestAcceptedChat, // The ID of the chat to update
        //     { requestType: "win" }, // The fields to update
        //     { new: true } // Return the updated document
        // );

        // if (!updateAcceptedChat) { 
        //     return res.status(404).json({ message: 'Accepted chat not found' });
        // }

        // Return the updated request
        return res.status(200).json(updateRequest);
    } catch (error) {
        // Return a 500 status code and the error message
        return res.status(500).json({ message: error.message });
    }
};

export const closeParticularChat = async (req, res) => {
    try {
        const { chatId } = req.body;
        console.log('chatId for closeing chat', chatId);
        if (!chatId) return res.status(403).json({ message: "Invalid chat id" });

        const closeChat = await Chat.findByIdAndUpdate(chatId, { requestType: "closed" }).lean();

        if (!closeChat) return res.status(404).json({ message: "Chat not found" });

        return res.status(200).json(closeChat);
    } catch (error) {
        return res.status(404).json({ message: "Error while closing chat", error: error });
    }
}



export const setSpadeMarkAsRead = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id)
            return res.status(400).json({ message: 'Invalid request' });

        const updateSpade = await UserRequest.findByIdAndUpdate(id, { unread: false }).lean();
        return res.status(200).json({ message: "Spade Mark As Read" });
    } catch (error) {
        throw new Error(error.message);
    }
}


export const getSpadesHistory = async (req, res) => {
    try {
        const data = req.query;
        // console.log('spades data', data);
        const spades = await UserRequest.find({
            $and: [{
                customer: data.id
            }, {
                requestActive: "closed"
            }]
        }).sort({ updatedAt: -1 }).lean();
        if (spades.length > 0) {
            return res.status(200).json(spades);
        }
        else {
            return res.status(404).json({ message: 'No spades found' });
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getUniqueToken = async (req, res) => {
    const data = req.query;
    try {
        const token = await User.findById(data.id).lean();
        return res.status(200).json(token.uniqueToken);
    } catch (error) {
        throw new Error(error.message);
    }
}

// export const addSpadeForPayment = async (req, res) => {
//     try {
//         const { userId, spadeId } = req.body;

//         const user = await User.findById(userId);

//         if (!user)
//             return res.status(404).json({ message: 'User not found' });

//         user.unpaidSpades.push(spadeId);
//         user.lastPaymentStatus = "unpaid";
//         user.save();

//         return res.status(200).json(user);

//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// }

export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(404).json({ message: "Invalid user id" });

        const user = await User.findById(userId);
        // console.log('user details id', user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "Error while getting user details" });
    }
}

export const getParticularSpade = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return res.status(404).json({ message: "Invalid spade id" });
        // console.log('spade id', id);
        const spade = await UserRequest.findById(id).lean();
        // console.log('spade data', spade._id);
        if (!spade) return res.status(404).json({ message: "Spade not found" });

        return res.status(200).json(spade);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const updatePaymentStatus = async (req, res) => {
    try {
        const { userId, spadeId } = req.body;

        if (!userId || !spadeId) return res.status(404).json({ message: "Invalid data" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Invalid user Id" });

        user.unpaidSpades.shift();
        await user.save();

        const spadeDetails = await UserRequest.findById(spadeId);
        if (!spadeDetails) return res.status(404).json({ message: "Invalid spade id" });

        spadeDetails.paymentStatus = "paid";
        await spadeDetails.save();

        return res.status(200).json(user);

    } catch (error) {

    }
}