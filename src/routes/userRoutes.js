import express from 'express';
const router = express.Router();
import { getUser, registerUser, createRequest, editProfile, getSpades, getSpadesHistory, closeSpade, getUniqueToken, setSpadeMarkAsRead, closeAcitveSpade, logoutUser, refreshAccessToken, getUserDetails, getParticularSpade, updatePaymentStatus, closeParticularChat, currentVersion } from '../controllers/userController.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { getAdvertisement, getAdvertisementLatest } from '../controllers/b2bController.js';

router.route('/').get(getUser);
router.route('/').post(registerUser);
router.route('/logout').patch(logoutUser);
router.route('/refresh-token').get(refreshAccessToken);
router.route('/createrequest').post(protectRoute, upload.array('requestImages', 10), createRequest);
router.route('/edit-profile').patch(protectRoute, editProfile);
router.route('/getspades').get(protectRoute, getSpades);
router.route('/close-spade').patch(protectRoute, closeSpade);
router.route('/history').get(protectRoute, getSpadesHistory);
router.route('/unique-token').get(getUniqueToken);
router.route('/set-spade-mark-as-read').patch(protectRoute, setSpadeMarkAsRead);
router.route('/close-active-spade').patch(protectRoute, closeAcitveSpade);
router.route('/user-details').get(getUserDetails);
router.route('/spade-details').get(protectRoute, getParticularSpade);
router.route('/update-payment-status').patch(protectRoute, updatePaymentStatus);
router.route('/close-particular-chat').patch(protectRoute, closeParticularChat);
router.route('/current-app-version').get(currentVersion);
router.route('/advert-text').get(getAdvertisement);
router.route('/advertisement').get(getAdvertisementLatest);

export default router;
