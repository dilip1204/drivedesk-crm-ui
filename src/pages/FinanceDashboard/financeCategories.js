export const FINANCE_EXPENSE_CATEGORIES = [
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "DOMAIN", label: "Domain" },
  { value: "WEBSITE", label: "Website" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "SMS", label: "SMS" },
  { value: "SOFTWARE_SUBSCRIPTION", label: "Software Subscription" },
  { value: "MARKETING", label: "Marketing" },
  { value: "PAYMENT_GATEWAY", label: "Payment Gateway" },
  { value: "COMPANY_LEGAL", label: "Company Legal" },
  { value: "MISCELLANEOUS", label: "Miscellaneous" },
];

export const isFinanceExpenseCategory = (value) =>
  FINANCE_EXPENSE_CATEGORIES.some((category) => category.value === value);
