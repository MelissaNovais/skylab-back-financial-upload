import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const incomes = await this.find({ where: { type: 'income' } });
    const income = incomes.reduce((acc, current: Transaction) => {
      return acc + current.value;
    }, 0);

    const outcomes = await this.find({ where: { type: 'outcome' } });
    const outcome = outcomes.reduce((acc, current: Transaction) => {
      return acc + current.value;
    }, 0);

    const balance: Balance = { income, outcome, total: income - outcome };
    return balance;
  }
}

export default TransactionsRepository;
