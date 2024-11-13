import express from 'express';
import { allApprovedRetailers, blockRetailers, getUnApprovedRetailers, rejectRetailers, verifyDocument, approveRetailers, getAllRequests, getAllChats, getChatMessages, getParticularChatInfo, getAllProduct, getProductImageByVendorId, getProductImageByCategory, removeProductImage, deleteUserRequest } from '../controllers/b2bController.js';
import { availableCategories } from '../controllers/retailerController.js';

const router = express.Router();

router.route('/unapproved-retailers').get(getUnApprovedRetailers);
router.route('/approved-retailers').get(allApprovedRetailers);
router.route('/approve-retailer').patch(approveRetailers);
router.route('/reject-retailer').patch(rejectRetailers);
router.route('/block-retailer').patch(blockRetailers);
router.route('/verify-retailer-document').patch(verifyDocument);
router.route('/get-all-requests').get(getAllRequests);
router.route('/get-all-chats').get(getAllChats);
router.route('/get-chat-messages').get(getChatMessages);
router.route('/get-chat-info').get(getParticularChatInfo);
router.route('/get-all-products').get(getAllProduct);
router.route('/get-productimg-byvendorid').get(getProductImageByVendorId)
router.route('/get-productimg-bycategory').get(getProductImageByCategory)
router.route('/remove-productimg').delete(removeProductImage)
router.route('/get-all-categories').get(availableCategories)
router.route('/delete-request').delete(deleteUserRequest)

export default router;