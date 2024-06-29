import express from 'express';
import { uploadImages } from '../controllers/uploadController.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();


router.route('/').post(upload.array('storeImages', 10), uploadImages);

export default router;
