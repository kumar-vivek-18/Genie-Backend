import express from 'express';
const router = express.Router();
import { getUser, registerUser, createRequest, editProfile, getSpades, getSpadesHistory, closeSpade } from '../controllers/userController.js';
// const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(getUser);
router.route('/').post(registerUser);
router.route('/createrequest').post(createRequest);
router.route('/edit-profile').patch(editProfile);
router.route('/getspades').get(getSpades);
router.route('/closespade').patch(closeSpade);
router.route('/history').get(getSpadesHistory);
// router.route('/update').patch(updateRequests);


export default router;