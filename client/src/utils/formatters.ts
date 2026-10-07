export const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number(amount));
};

export const formatDate = (
  date: string,
  dateStyle: "short" | "medium" | "long" | "full" = "medium",
) => {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle,
    timeStyle: "short",
  }).format(new Date(date));
};
