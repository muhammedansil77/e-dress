import { Request, Response } from 'express';
import { userService } from './user.service';
import { asyncHandler } from '../../common/utils/async-handler';
import { ApiResponse } from '../../common/utils/api-response';
import { HttpStatus } from '../../common/constants/http-status';

export class UserController {
  // --- Customer Auth & Profile ---
  public register = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.register(req.body);
    return ApiResponse.success(res, result, 'Customer registered successfully', HttpStatus.CREATED);
  });

  public login = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.login(req.body);
    return ApiResponse.success(res, result, 'Logged in successfully', HttpStatus.OK);
  });

  public getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getProfile(req.user!.userId);
    return ApiResponse.success(res, user, 'Profile retrieved successfully', HttpStatus.OK);
  });

  public updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateProfile(req.user!.userId, req.body);
    return ApiResponse.success(res, user, 'Profile updated successfully', HttpStatus.OK);
  });

  public addAddress = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.addAddress(req.user!.userId, req.body);
    return ApiResponse.success(res, user.addresses, 'Address added successfully', HttpStatus.CREATED);
  });

  public removeAddress = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.removeAddress(req.user!.userId, req.params.addressId);
    return ApiResponse.success(res, user.addresses, 'Address removed successfully', HttpStatus.OK);
  });

  // --- Wishlist ---
  public getWishlist = asyncHandler(async (req: Request, res: Response) => {
    const wishlist = await userService.getWishlist(req.user!.userId);
    return ApiResponse.success(res, wishlist, 'Wishlist retrieved successfully', HttpStatus.OK);
  });

  public addToWishlist = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.addToWishlist(req.user!.userId, req.params.productId);
    return ApiResponse.success(res, result, 'Product added to wishlist', HttpStatus.OK);
  });

  public removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.removeFromWishlist(req.user!.userId, req.params.productId);
    return ApiResponse.success(res, result, 'Product removed from wishlist', HttpStatus.OK);
  });

  public toggleWishlist = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.toggleWishlist(req.user!.userId, req.params.productId);
    const msg = result.inWishlist ? 'Added to wishlist' : 'Removed from wishlist';
    return ApiResponse.success(res, result, msg, HttpStatus.OK);
  });

  // --- Cart ---
  public getCart = asyncHandler(async (req: Request, res: Response) => {
    const cart = await userService.getCart(req.user!.userId);
    return ApiResponse.success(res, cart, 'Cart retrieved successfully', HttpStatus.OK);
  });

  public addToCart = asyncHandler(async (req: Request, res: Response) => {
    const cart = await userService.addToCart(req.user!.userId, req.body);
    return ApiResponse.success(res, cart, 'Item added to cart', HttpStatus.OK);
  });

  public updateCartQuantity = asyncHandler(async (req: Request, res: Response) => {
    const cart = await userService.updateCartQuantity(
      req.user!.userId,
      req.params.variantSku,
      req.body.quantity
    );
    return ApiResponse.success(res, cart, 'Cart updated successfully', HttpStatus.OK);
  });

  public removeFromCart = asyncHandler(async (req: Request, res: Response) => {
    const cart = await userService.removeFromCart(req.user!.userId, req.params.variantSku);
    return ApiResponse.success(res, cart, 'Item removed from cart', HttpStatus.OK);
  });

  public clearCart = asyncHandler(async (req: Request, res: Response) => {
    const cart = await userService.clearCart(req.user!.userId);
    return ApiResponse.success(res, cart, 'Cart cleared successfully', HttpStatus.OK);
  });

  // --- Admin Customer Management ---
  public getCustomersForAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.getCustomersForAdmin(req.query as any);
    return ApiResponse.success(res, result.items, 'Customers retrieved successfully', HttpStatus.OK, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    });
  });

  public toggleCustomerStatus = asyncHandler(async (req: Request, res: Response) => {
    const updated = await userService.toggleCustomerStatus(req.params.id, req.body.status);
    return ApiResponse.success(res, updated, 'Customer status updated successfully', HttpStatus.OK);
  });
}

export const userController = new UserController();
