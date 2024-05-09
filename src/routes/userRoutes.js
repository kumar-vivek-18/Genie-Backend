import express from 'express';
const router = express.Router();
import { getUser, registerUser, createRequest, editProfile, getSpades } from '../controllers/userController.js';
// const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(getUser);
router.route('/').post(registerUser);
router.route('/createrequest').post(createRequest);
router.route('/editprofile').patch(editProfile);
router.route('/getspades').get(getSpades);


export default router;