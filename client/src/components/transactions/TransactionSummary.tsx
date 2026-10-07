interface TransactionSummaryProps {
  filteredTransactionsLength: number;
  currentPage: number;
  itemsPerPage: number;
  hasFilters: boolean;
}

export const TransactionSummary = ({
  filteredTransactionsLength,
  currentPage,
  itemsPerPage,
  hasFilters,
}: TransactionSummaryProps) => {
  return (
    <div className="mt-4 flex flex-col gap-1 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing {filteredTransactionsLength === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
        –
        {Math.min(currentPage * itemsPerPage, filteredTransactionsLength)} of {filteredTransactionsLength} transactions
      </span>

      {hasFilters && (
        <span>Filters are applied to your transaction history.</span>
      )}
    </div>
  );
};
