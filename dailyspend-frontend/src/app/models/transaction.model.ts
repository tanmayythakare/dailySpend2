// Matches backend TransactionResponse exactly — no 'version' field
export interface Transaction {
  id:              number;
  amount:          number;
  type:            'EXPENSE' | 'MONEY_GIVEN' | 'MONEY_TAKEN' | 'INCOME';
  description?:    string;
  transactionDate: string;
  account: {
    id:   number;
    name: string;
  };
  category?: {
    id:   number;
    name: string;
  };
  person?: {
    id:   number;
    name: string;
  };
}

export interface ExpenseRequest {
  accountId:       number;
  categoryId:      number;
  amount:          number;
  description?:    string;
  transactionDate: string;
}

export interface MoneyGivenRequest {
  accountId:       number;
  personId:        number;
  amount:          number;
  description?:    string;
  transactionDate: string;
}

export interface MoneyTakenRequest {
  accountId:       number;
  personId:        number;
  amount:          number;
  description?:    string;
  transactionDate: string;
}

export interface IncomeRequest {
  accountId:       number;
  categoryId?:     number | null;
  amount:          number;
  description?:    string;
  transactionDate: string;
}