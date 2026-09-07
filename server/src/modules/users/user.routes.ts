import { Router } from 'express';
import { userController } from './user.controller';
import { authenticateCustomer, authenticateAdmin } from '../../common/middleware/auth.middleware';
import { validateRequest } from '../../common/middleware/validate.middleware';
import {
  registerUserSchema,
  loginUserSchema,
  updateProfileSchema,
  addressSchema,
  addToCartSchema,
  updateCartItemSchema,
  userQuerySchema,
} from './user.validation';

const router = Router();

// --- 1. Public Customer Routes ---
router.post('/register', validateRequest(registerUserSchema, 'body'), userController.register);
router.post('/login', validateRequest(loginUserSchema, 'body'), userController.login);

// --- 2. Authenticated Customer Profile & Addresses ---
router.get('/me', authenticateCustomer, userController.getProfile);
router.patch('/profile', authenticateCustomer, validateRequest(updateProfileSchema, 'body'), userController.updateProfile);
router.post('/addresses', authenticateCustomer, validateRequest(addressSchema, 'body'), userController.addAddress);
router.delete('/addresses/:addressId', authenticateCustomer, userController.removeAddress);

// --- 3. Customer Wishlist Routes ---
router.get('/wishlist', authenticateCustomer, userController.getWishlist);
router.post('/wishlist/:productId', authenticateCustomer, userController.addToWishlist);
router.delete('/wishlist/:productId', authenticateCustomer, userController.removeFromWishlist);
router.post('/wishlist/:productId/toggle', authenticateCustomer, userController.toggleWishlist);

// --- 4. Customer Cart Routes ---
router.get('/cart', authenticateCustomer, userController.getCart);
router.post('/cart', authenticateCustomer, validateRequest(addToCartSchema, 'body'), userController.addToCart);
router.patch('/cart/:variantSku', authenticateCustomer, validateRequest(updateCartItemSchema, 'body'), userController.updateCartQuantity);
router.delete('/cart/:variantSku', authenticateCustomer, userController.removeFromCart);
router.delete('/cart', authenticateCustomer, userController.clearCart);

// --- 5. Admin Customer Management Routes ---
router.get('/admin/customers', authenticateAdmin, validateRequest(userQuerySchema, 'query'), userController.getCustomersForAdmin);
router.patch('/admin/customers/:id/status', authenticateAdmin, userController.toggleCustomerStatus);

export const userRoutes = router;
