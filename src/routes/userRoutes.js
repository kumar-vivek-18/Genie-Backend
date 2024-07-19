import express from 'express';
const router = express.Router();
import { getUser, registerUser, createRequest, editProfile, getSpades, getSpadesHistory, closeSpade, getUniqueToken, setSpadeMarkAsRead, closeAcitveSpade, logoutUser, refreshAccessToken } from '../controllers/userController.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

router.route('/').get(getUser);
router.route('/').post(registerUser);
router.route('/logout').patch(logoutUser);
router.route('/refresh-token').get(refreshAccessToken);
router.route('/createrequest').post(protectRoute, upload.array('requestImages', 10), createRequest);
router.route('/edit-profile').patch(protectRoute, editProfile);
router.route('/getspades').get(protectRoute, getSpades);
router.route('/close-spade').patch(protectRoute, closeSpade);
router.route('/history').get(protectRoute, getSpadesHistory);
// router.route('/update').patch(updateRequests);
router.route('/unique-token').get(protectRoute, getUniqueToken);
router.route('/set-spade-mark-as-read').patch(protectRoute, setSpadeMarkAsRead);
router.route('/close-active-spade').patch(protectRoute, closeAcitveSpade);

export default router;
