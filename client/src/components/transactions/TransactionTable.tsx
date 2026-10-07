import {
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

import type { Transaction } from "../../hooks/useTransactionFilters";

interface TransactionTableProps {
  transactions: Transaction[];
  formatCurrency: (amount: string | number) => string;
  formatDate: (date: string) => string;
  isReceived: (transaction: Transaction) => boolean;
  onViewReceipt: (reference: string) => void;
}

export const TransactionTable = ({
  transactions,
  formatCurrency,
  formatDate,
  isReceived,
  onViewReceipt,
}: TransactionTableProps) => {
  return (
    <>
      <div className="hidden border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 md:grid md:grid-cols-[2fr_1.5fr_1fr_1fr_auto]">
        <span>Transaction</span>
        <span>Date</span>
        <span>Status</span>
        <span className="text-right">Amount</span>
        <span></span>
      </div>

      <div className="divide-y divide-slate-100">
        {transactions.map((transaction) => {
          const received = isReceived(transaction);

          const otherPerson = received
            ? transaction.sender
            : transaction.receiver;

          const isSuccessful =
            transaction.status.toLowerCase() === "success";

          return (
            <div
              key={transaction.id}
              className="grid gap-4 px-5 py-5 md:grid-cols-[2fr_1.5fr_1fr_1fr_auto] md:items-center md:px-6"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    received
                      ? "bg-slate-100 text-slate-700"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {received ? (
                    <ArrowDownLeft size={18} />
                  ) : (
                    <ArrowUpRight size={18} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {received ? "Money received" : "Money sent"}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {otherPerson
                      ? `${otherPerson.firstName} ${otherPerson.lastName}`
                      : transaction.description || "Transfer"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600">
                  {formatDate(transaction.createdAt)}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {transaction.reference}
                </p>
              </div>

              <div>
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                  {transaction.status.toLowerCase()}
                </span>
              </div>

              <div className="text-left md:text-right">
                <p
                  className={`text-sm font-semibold ${
                    received ? "text-slate-900" : "text-slate-700"
                  }`}
                >
                  {received ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>

              <div>
                {isSuccessful && (
                  <button
                    type="button"
                    onClick={() => onViewReceipt(transaction.reference)}
                    className="whitespace-nowrap text-sm font-medium text-slate-700 hover:text-slate-950"
                  >
                    View receipt
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
