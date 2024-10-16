import express from 'express';
import { addProduct, getProductByCategory, getProductsByVendorId, removeProduct } from '../controllers/productController.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.route('/add-product').post(upload.array('productImage', 10), addProduct);
router.route('/remove-product').delete(removeProduct);
router.route('/product-by-category').get(getProductByCategory);
router.route('/product-by-vendorId').get(getProductsByVendorId);

export default router;