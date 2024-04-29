import express from 'express';
import { createChat, getRetailerNewChats, getRetailerOngoingChats, getUserChats, sendMessage, updateMessage } from '../controllers/chatController.js';

const router = express.Router();

router.route('/createchat').post(createChat);
router.route('/retailernewchats').get(getRetailerNewChats);
router.route('/retailerongoingchats').get(getRetailerOngoingChats);
router.route('/userchats').get(getUserChats);
router.route('/send').post(sendMessage);
router.route('/updatemessage').patch(updateMessage);

export default router;