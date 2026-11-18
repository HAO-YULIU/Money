export type Member = { id: string; name: string };

export type Split =
  | { mode: 'equal'; participantIds: string[] }
  | { mode: 'custom'; amounts: Record<string, number> };

export type Expense = {
  id: string;
  title: string;
  amount: number;
  payerId: string;
  /** 'YYYY-MM-DD' */
  date: string;
  split: Split;
  kind: 'expense' | 'repayment';
};

export type Group = {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
};

export type Transfer = { fromId: string; toId: string; amount: number };
