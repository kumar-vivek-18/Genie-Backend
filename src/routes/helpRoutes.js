

import express from "express";
import { createConcern, createQuery } from "../controllers/helpController.js";

const router=express.Router();


router.route('/contact').post(createConcern);
router.route('/query').post(createQuery);

export default router;