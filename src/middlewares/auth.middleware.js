import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { Retailer } from '../models/retailer.model.js';

export const protectRoute = async (req, res, next) => {

    try {
        const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        console.log(token);
        if (!token) return res.status(401).json({ message: "Unauthorized request" });

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // if(decodedToken.includes('userName')) 
        console.log('decoded Token: ' + decodedToken?.userName);
        if ((decodedToken?.userName)) {
            const user = User.findById(decodedToken._id).select("_id userName")

            // console.log("user", user); 
            if (!user)
                return res.status(401).json({ message: "Invalid access token" });
            req.user = user;
        }
        else {
            const retailer = await Retailer.findById(decodedToken._id).select("_id storeOwnerName");

            if (!retailer)
                return res.status(401).json({ message: "Invalid access token" });

            req.user = retailer;
        }
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid request" });
    }
}