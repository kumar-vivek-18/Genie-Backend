import express from 'express';
import { createRatingAndFeedback, getRetailerFeedbacks } from '../controllers/feedbackController.js';

const router = express.Router();

router.route('/rating-feedback').post(createRatingAndFeedback);
router.route('/get-retailer-feedbacks').get(getRetailerFeedbacks);

export default router;