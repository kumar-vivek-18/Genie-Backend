import express from 'express';
const router = express.Router();
import { getUser, registerUser, createRequest, editProfile, getSpades, closeRequest, getSpadesHistory } from '../controllers/userController.js';
// const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(getUser);
router.route('/').post(registerUser);
router.route('/createrequest').post(createRequest);
router.route('/editprofile').patch(editProfile);
router.route('/getspades').get(getSpades);
router.route('/closespade/:id').patch(closeRequest);
router.route('/history').get(getSpadesHistory);
// router.route('/update').patch(updateRequests);


export default router;