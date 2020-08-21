import { getRepository } from 'typeorm';
import Category from '../models/Category';

class CreateTransactionService {
  public async execute(title: string): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const findedCategory = await categoryRepository.findOne({
      where: { title },
    });

    if (!findedCategory) {
      const newCategory = categoryRepository.create({
        title,
      });
      await categoryRepository.save(newCategory);
      return newCategory;
    }

    return findedCategory;
  }
}

export default CreateTransactionService;
