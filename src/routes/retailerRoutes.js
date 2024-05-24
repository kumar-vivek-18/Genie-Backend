import express from 'express';
import { createRatingAndFeedback } from '../controllers/feedbackController.js';
import { createNewRetailer, editRetailerDetails, getRetailer } from '../controllers/retailerController.js';

const router = express.Router();


router.route('/').get(getRetailer);
router.route('/').post(createNewRetailer);
// router.route('/ongoingrequests').get(getOngoingRequests);
// router.route('/newrequests').get(getNewRequests);
// router.route('/history').get(getRetailerHistory);
router.route('/editretailer').patch(editRetailerDetails);
router.route('/rate-feedback').post(createRatingAndFeedback);



export default router;