import express from 'express';
import { createChat, getRetailerChats, getUserChats, sendMessage, updateMessage } from '../controllers/chatController';

const router = express.Router();

router.route('/createchat').post(createChat);
router.route('/retailerchats').get(getRetailerChats);
router.route('/userchats').get(getUserChats);
router.route('/send').post(sendMessage);
router.route('/updatemessage').patch(updateMessage);

export default router;