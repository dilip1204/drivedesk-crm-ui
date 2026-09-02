export const FINANCE_TRANSACTION_TYPES = [
  { value: "INCOME", label: "Income" },
  { value: "EXPENSE", label: "Expense" },
  { value: "PARTNER_INVESTMENT", label: "Partner Investment" },
  { value: "PARTNER_SETTLEMENT", label: "Partner Settlement" },
  { value: "PARTNER_WITHDRAWAL", label: "Partner Withdrawal" },
];

export const isFinanceTransactionType = (value) =>
  FINANCE_TRANSACTION_TYPES.some((type) => type.value === value);
