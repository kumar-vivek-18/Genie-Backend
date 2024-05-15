import express from 'express';
import { getRetailerNewChats, getRetailerOngoingChats, getChats, sendMessage, updateMessage, getSpadeMessages, modifyChat } from '../controllers/chatController.js';

const router = express.Router();

router.route('/modify-spade-retailer').patch(modifyChat);
router.route('/retailernewspades').get(getRetailerNewChats);
router.route('/retailerongoingspades').get(getRetailerOngoingChats);
router.route('/spade-chat').get(getChats);
router.route('/sendmessage').post(sendMessage);
router.route('/updatemessage').patch(updateMessage);
router.route('/get-spade-messages').get(getSpadeMessages);

export default router;