import express from 'express';
import { createRatingAndFeedback } from '../controllers/feedbackController.js';
import { createNewRetailer, editRetailerDetails, getRetailer, getRetailerHistory } from '../controllers/retailerController.js';

const router = express.Router();


router.route('/').get(getRetailer);
router.route('/').post(createNewRetailer);
router.route('/editretailer').patch(editRetailerDetails);
router.route('/rating-feedback').post(createRatingAndFeedback);
router.route('/history').get(getRetailerHistory);



export default router;
