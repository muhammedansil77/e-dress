import { Request, Response } from 'express';
import { colorService } from './color.service';
import { ApiResponse } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';

export class ColorController {
  public getColors = asyncHandler(async (_req: Request, res: Response) => {
    const colors = await colorService.getColors();
    return ApiResponse.success(res, colors, 'Colors retrieved successfully');
  });

  public getActiveColors = asyncHandler(async (_req: Request, res: Response) => {
    const colors = await colorService.getActiveColors();
    return ApiResponse.success(res, colors, 'Active colors retrieved successfully');
  });

  public createColor = asyncHandler(async (req: Request, res: Response) => {
    const color = await colorService.createColor(req.body);
    return ApiResponse.created(res, color, 'Color created successfully');
  });
}

export const colorController = new ColorController();
