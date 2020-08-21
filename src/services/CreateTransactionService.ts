import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

interface TransactionRequest {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: TransactionRequest): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const createCategory = new CreateCategoryService();
    const findedCategory = await createCategory.execute(category);

    if (type === 'outcome' && !(await this.verifyAmountOfOutcome(value))) {
      throw new AppError('Value not valid.', 400);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: findedCategory.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }

  private async findCategory(categoryName: string): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const findedCategory = await categoryRepository.findOne({
      where: { title: categoryName },
    });

    if (!findedCategory) {
      const newCategory = categoryRepository.create({
        title: categoryName,
      });
      await categoryRepository.save(newCategory);
      return newCategory;
    }

    return findedCategory;
  }

  private async verifyAmountOfOutcome(outcomeValue: number): Promise<boolean> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionRepository.getBalance();
    return balance.total >= outcomeValue;
  }
}

export default CreateTransactionService;
