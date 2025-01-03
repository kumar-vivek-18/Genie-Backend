import express from 'express';
import { addProduct, getAllProductsCategory, getProductByCategory, getProductByQuery, getProductsByVendorId, removeProduct,searchProduct,singleProduct, updateProductCategory, verifyProduct } from '../controllers/productController.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.route('/add-product').post(upload.array('productImage', 10), addProduct);
router.route('/remove-product').delete(removeProduct);
router.route('/product-by-category').get(getProductByCategory);
router.route('/product-by-vendorId').get(getProductsByVendorId);
router.route('/singleproduct').get(singleProduct);
router.route('/verifyproduct').put(verifyProduct);
router.route('/product-by-query').get(getProductByQuery)
router.route('/search-product').get(searchProduct)

router.route('/all-category-product').get(getAllProductsCategory);
router.route('/update-category').put(updateProductCategory)



export default router;