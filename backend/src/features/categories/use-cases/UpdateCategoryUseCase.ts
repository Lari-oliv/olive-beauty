import { CategoryRepository } from '../repositories/CategoryRepository';
import { UpdateCategoryDTO } from '../dtos/UpdateCategoryDTO';
import { AppError } from '../../../shared/errors/AppError';

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(id: string, data: UpdateCategoryDTO) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new AppError('Categoria não encontrada', 404);
    }

    // Check if name is being changed and if it conflicts
    if (data.name && data.name !== category.name) {
      const allCategories = await this.categoryRepository.findAll();
      const nameExists = allCategories.some(
        (cat) => cat.id !== id && cat.name.toLowerCase() === data.name!.toLowerCase()
      );

      if (nameExists) {
        throw new AppError('Categoria com este nome já existe', 409);
      }
    }

    return this.categoryRepository.update(id, data);
  }
}

