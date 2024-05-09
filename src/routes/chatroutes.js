import express from 'express';
import { createChat, getRetailerNewChats, getRetailerOngoingChats, getUserChats, sendMessage, updateMessage } from '../controllers/chatController.js';

const router = express.Router();

router.route('/createspade').post(createChat);
router.route('/retailernewspades').get(getRetailerNewChats);
router.route('/retailerongoingspades').get(getRetailerOngoingChats);
router.route('/userspaderetailers').get(getUserChats);
router.route('/sendmessage').post(sendMessage);
router.route('/updatemessage').patch(updateMessage);

export default router;