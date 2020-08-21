import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getRepository(Transaction);
    const transationToDelete = await transactionRepository.findOne(id);
    if (!transationToDelete) {
      throw new AppError('Transaction not valid.', 400);
    }
    await transactionRepository.delete(transationToDelete.id);
  }
}

export default DeleteTransactionService;
