import { Request, Response } from 'express';
import { productService } from './product.service';
import { ApiResponse } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';
import { ProductQueryFilters } from './product.dto';

export class ProductController {
  public getProducts = asyncHandler(async (req: Request, res: Response) => {
    const filters: ProductQueryFilters = req.query as any;
    const result = await productService.getProducts(filters);
    return ApiResponse.success(res, result.items, 'Products retrieved successfully', 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    });
  });

  public getFilterFacets = asyncHandler(async (_req: Request, res: Response) => {
    const facets = await productService.getFilterFacets();
    return ApiResponse.success(res, facets, 'Product filter facets retrieved successfully');
  });

  public getProductById = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProductById(req.params.id);
    return ApiResponse.success(res, product, 'Product details retrieved successfully');
  });

  public createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);
    return ApiResponse.created(res, product, 'Product created successfully');
  });

  public updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    return ApiResponse.success(res, product, 'Product updated successfully');
  });

  public updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const product = await productService.updateStatus(req.params.id, status);
    return ApiResponse.success(res, product, `Product status updated to ${status}`);
  });

  public deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    await productService.deleteProduct(req.params.id);
    return ApiResponse.success(res, null, 'Product deleted successfully');
  });
}

export const productController = new ProductController();
