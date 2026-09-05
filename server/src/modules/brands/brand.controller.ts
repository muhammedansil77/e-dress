import { Request, Response } from 'express';
import { brandService } from './brand.service';
import { ApiResponse } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';

export class BrandController {
  public getBrands = asyncHandler(async (_req: Request, res: Response) => {
    const brands = await brandService.getBrands();
    return ApiResponse.success(res, brands, 'Brands retrieved successfully');
  });

  public getActiveBrands = asyncHandler(async (_req: Request, res: Response) => {
    const brands = await brandService.getActiveBrands();
    return ApiResponse.success(res, brands, 'Active brands retrieved successfully');
  });

  public getBrandById = asyncHandler(async (req: Request, res: Response) => {
    const brand = await brandService.getBrandById(req.params.id);
    return ApiResponse.success(res, brand, 'Brand retrieved successfully');
  });

  public createBrand = asyncHandler(async (req: Request, res: Response) => {
    const brand = await brandService.createBrand(req.body);
    return ApiResponse.created(res, brand, 'Brand created successfully');
  });

  public updateBrand = asyncHandler(async (req: Request, res: Response) => {
    const brand = await brandService.updateBrand(req.params.id, req.body);
    return ApiResponse.success(res, brand, 'Brand updated successfully');
  });

  public deleteBrand = asyncHandler(async (req: Request, res: Response) => {
    await brandService.deleteBrand(req.params.id);
    return ApiResponse.success(res, null, 'Brand deleted successfully');
  });
}

export const brandController = new BrandController();
