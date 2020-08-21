import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import upoloadConfig from '../config/upload';
import Category from '../models/Category';

type TransactionType = {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
};

class ImportTransactionsService {
  async execute(csvFileName: string): Promise<Transaction[]> {
    const csvData: string[] = await this.readCsv(csvFileName);
    const formatedTransactions: TransactionType[] = this.formatCsvdata(csvData);
    const transactions = await this.saveTransactions(formatedTransactions);
    return transactions;
  }

  private async readCsv(csvFileName: string): Promise<string[]> {
    const readCSVStream = fs.createReadStream(
      `${upoloadConfig.directory}/${csvFileName}`,
    );
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const parseCSV = readCSVStream.pipe(parseStream);
    const transactions: string[] = [];
    parseCSV.on('data', transaction => {
      transactions.push(transaction);
    });
    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });
    return transactions;
  }

  private formatCsvdata(csvData: string[]): TransactionType[] {
    const transactions: TransactionType[] = [];
    csvData.forEach(csvLine => {
      const newTransaction: TransactionType = {
        title: csvLine[0],
        type: csvLine[1] === 'income' ? 'income' : 'outcome',
        value: Number(csvLine[2]),
        category: csvLine[3],
      };
      transactions.push(newTransaction);
    });
    return transactions;
  }

  private async saveTransactions(
    transactions: TransactionType[],
  ): Promise<Transaction[]> {
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);
    const filteredCat = new Set();
    transactions.forEach(transaction => {
      filteredCat.add(transaction.category);
    });
    const allNewCategories: any[] = Array.from(filteredCat);
    const categories = categoryRepository.create(
      allNewCategories.map(title => ({ title })),
    );
    await categoryRepository.save(categories);
    const allCategories: Category[] = await categoryRepository.find();
    const savedTransactions: Transaction[] = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: allCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(savedTransactions);

    return savedTransactions;
  }
}

export default ImportTransactionsService;
