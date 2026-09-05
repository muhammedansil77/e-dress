import { Request, Response } from 'express';
import { categoryService } from './category.service';
import { ApiResponse } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';
import { CategoryQueryFilters } from './category.dto';

export class CategoryController {
  public getCategories = asyncHandler(async (req: Request, res: Response) => {
    const filters: CategoryQueryFilters = req.query as any;
    const result = await categoryService.getCategories(filters);
    return ApiResponse.success(res, result.items, 'Categories retrieved successfully', 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    });
  });

  public getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    return ApiResponse.success(res, category, 'Category details retrieved successfully');
  });

  public getCategoryTree = asyncHandler(async (_req: Request, res: Response) => {
    const tree = await categoryService.getCategoryTree();
    return ApiResponse.success(res, tree, 'Category tree retrieved successfully');
  });

  public getActiveCategories = asyncHandler(async (_req: Request, res: Response) => {
    const active = await categoryService.getAllActive();
    return ApiResponse.success(res, active, 'Active categories retrieved successfully');
  });

  public createCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.createCategory(req.body);
    return ApiResponse.created(res, category, 'Category created successfully');
  });

  public updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await categoryService.updateCategory(id, req.body);
    return ApiResponse.success(res, category, 'Category updated successfully');
  });

  public updateCategoryStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const category = await categoryService.updateCategoryStatus(id, status);
    return ApiResponse.success(res, category, `Category status changed to ${status}`);
  });

  public deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    return ApiResponse.success(res, null, 'Category deleted successfully');
  });
}

export const categoryController = new CategoryController();
