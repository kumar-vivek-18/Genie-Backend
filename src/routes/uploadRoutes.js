import express from 'express';
import { uploadImages } from '../controllers/uploadController.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();


router.route('/').post(protectRoute, upload.array('storeImages', 10), uploadImages);

export default router;
