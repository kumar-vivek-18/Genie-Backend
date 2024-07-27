import express from 'express';
import { createRatingAndFeedback, createRatings, getRetailerFeedbacks, updatedFeedback } from '../controllers/feedbackController.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(protectRoute);

router.route('/rating-feedback').post(createRatingAndFeedback);
router.route('/get-retailer-feedbacks').get(getRetailerFeedbacks);
router.route('/create-ratings').post(createRatings);
router.route('/update-ratings').patch(updatedFeedback);

export default router;