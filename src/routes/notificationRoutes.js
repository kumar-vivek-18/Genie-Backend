import express from "express";
import { CustomerNotifyAccessToken, RetailerNotifyAccessToken } from "../controllers/notificationController.js";

const router=express.Router();


router.route('/retailer-notify-access-token').get(RetailerNotifyAccessToken)
router.route('/customer-notify-access-token').get(CustomerNotifyAccessToken)


export default router;