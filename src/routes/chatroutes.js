import express from 'express';
import { getRetailerNewChats, getRetailerOngoingChats, getChats, sendMessage, updateMessage, getSpadeMessages, modifyChat, accetptBid } from '../controllers/chatController.js';

const router = express.Router();

router.route('/modify-spade-retailer').patch(modifyChat);
router.route('/retailer-new-spades').get(getRetailerNewChats);
router.route('/retailer-ongoing-spades').get(getRetailerOngoingChats);
router.route('/spade-chats').get(getChats);
router.route('/send-message').post(sendMessage);
router.route('/update-message').patch(updateMessage);
router.route('/get-spade-messages').get(getSpadeMessages);
router.route('accept-bid').patch(accetptBid);
export default router;