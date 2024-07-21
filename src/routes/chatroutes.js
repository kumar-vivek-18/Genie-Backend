import express from 'express';
import { getRetailerNewChats, getRetailerOngoingChats, getChats, sendMessage, getSpadeMessages, acceptBidRequest, rejectBidRequest, setChatMessageMarkAsRead, getParticularChat, productAvailable, productNotAvailable, updateToHistory, getNewStatusRetailerChats } from '../controllers/chatController.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';


const router = express.Router();
router.use(protectRoute);

router.route('/product-available').patch(productAvailable);
router.route('/product-not-available').patch(productNotAvailable);
router.route('/retailer-new-spades').get(getRetailerNewChats);
router.route('/retailer-ongoing-spades').get(getRetailerOngoingChats);
router.route('/spade-chats').get(getChats);
router.route('/send-message').post(upload.array('bidImages', 10), sendMessage);
// router.route('/update-message').patch(updateMessage);
router.route('/get-spade-messages').get(getSpadeMessages);
router.route('/accept-bid').patch(acceptBidRequest);
router.route('/reject-bid').patch(rejectBidRequest);
router.route('/mark-as-read').patch(setChatMessageMarkAsRead);
router.route('/get-particular-chat').get(getParticularChat);
router.route('/update-to-history').patch(updateToHistory);
router.route('/new-status-retailers').get(getNewStatusRetailerChats);

export default router;