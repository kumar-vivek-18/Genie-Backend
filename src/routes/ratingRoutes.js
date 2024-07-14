import express from 'express';
import { createRatingAndFeedback, createRatings, getRetailerFeedbacks } from '../controllers/feedbackController.js';

const router = express.Router();

router.route('/rating-feedback').post(createRatingAndFeedback);
router.route('/get-retailer-feedbacks').get(getRetailerFeedbacks);
router.route('/create-ratings').post(createRatings);

export default router;