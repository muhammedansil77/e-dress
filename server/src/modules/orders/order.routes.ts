import { Router } from 'express';
import { orderController } from './order.controller';
import { validateRequest } from '../../common/middleware/validate.middleware';
import {
  authenticateAdmin,
  authenticateCustomer,
  optionalCustomerAuth,
} from '../../common/middleware/auth.middleware';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  orderQuerySchema,
} from './order.validation';

const router = Router();

// --- Customer & Public Order Endpoints ---

// 1. Checkout (Buy Now or Buy from Cart)
router.post(
  '/checkout',
  optionalCustomerAuth,
  validateRequest(createOrderSchema, 'body'),
  orderController.checkout
);

// 2. Customer Order History
router.get('/my-orders', optionalCustomerAuth, orderController.getMyOrders);

// 3. Track single order (by ID or Order Number)
router.get('/track/:id', orderController.getOrderById);

// --- Admin Order Management ---
router.get(
  '/admin/list',
  authenticateAdmin,
  validateRequest(orderQuerySchema, 'query'),
  orderController.getOrdersForAdmin
);

router.patch(
  '/admin/:id/status',
  authenticateAdmin,
  validateRequest(updateOrderStatusSchema, 'body'),
  orderController.updateOrderStatus
);

router.patch(
  '/admin/:id/payment',
  authenticateAdmin,
  validateRequest(updatePaymentStatusSchema, 'body'),
  orderController.updatePaymentStatus
);

export const orderRoutes = router;
