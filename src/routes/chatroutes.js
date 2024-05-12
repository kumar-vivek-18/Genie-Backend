import express from 'express';
import { createChat, getRetailerNewChats, getRetailerOngoingChats, getChats, sendMessage, updateMessage, getSpadeMessages } from '../controllers/chatController.js';

const router = express.Router();

router.route('/createspade').post(createChat);
router.route('/retailernewspades').get(getRetailerNewChats);
router.route('/retailerongoingspades').get(getRetailerOngoingChats);
router.route('/spade-chat').get(getChats);
router.route('/sendmessage').post(sendMessage);
router.route('/updatemessage').patch(updateMessage);
router.route('/get-spade-messages').get(getSpadeMessages);

export default router;