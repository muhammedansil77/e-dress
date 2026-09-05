import { Request, Response } from 'express';
import { sizeService } from './size.service';
import { ApiResponse } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';

export class SizeController {
  public getSizes = asyncHandler(async (_req: Request, res: Response) => {
    const sizes = await sizeService.getSizes();
    return ApiResponse.success(res, sizes, 'Sizes retrieved successfully');
  });

  public getActiveSizes = asyncHandler(async (_req: Request, res: Response) => {
    const sizes = await sizeService.getActiveSizes();
    return ApiResponse.success(res, sizes, 'Active sizes retrieved successfully');
  });

  public createSize = asyncHandler(async (req: Request, res: Response) => {
    const size = await sizeService.createSize(req.body);
    return ApiResponse.created(res, size, 'Size created successfully');
  });
}

export const sizeController = new SizeController();
