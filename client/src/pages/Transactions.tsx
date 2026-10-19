import { ReceiptText, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { TransactionFilters } from "../components/transactions/TransactionFilters";
import { TransactionPagination } from "../components/transactions/TransactionPagination";
import { TransactionSummary } from "../components/transactions/TransactionSummary";
import { TransactionTable } from "../components/transactions/TransactionTable";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import type { AppDispatch, RootState } from "../store/store";
import {
  setTransactions,
  setTransactionsLoading,
} from "../store/slices/transactionsSlice";
import { useTransactionFilters } from "../hooks/useTransactionFilters";
import { downloadTransactionPdf } from "../utils/transactionPdf";
import { formatCurrency, formatDate } from "../utils/formatters";
import EmptyState from "../components/EmptyState";

const Transactions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const { transactions, isLoading } = useSelector(
    (state: RootState) => state.transactions,
  );

  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) {
        dispatch(setTransactionsLoading(false));
        return;
      }

      dispatch(setTransactionsLoading(true));

      try {
        const response = await api.get("/transactions");

        dispatch(setTransactions(response.data.transactions));
      } catch (error) {
        console.error("Failed to load transactions:", error);

        dispatch(setTransactionsLoading(false));
      }
    };

    fetchTransactions();
  }, [user, dispatch]);

  const {
    search,
    setSearch,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    currentPage,
    setCurrentPage,
    filteredTransactions,
    paginatedTransactions,
    totalPages,
    hasFilters,
    clearFilters,
    totalReceived,
    totalSent,
    isReceived,
  } = useTransactionFilters({
    transactions,
    userId: user?.id,
  });

  const handleDownloadPdf = () => {
    downloadTransactionPdf({
      filteredTransactions,
      totalReceived,
      totalSent,
      hasFilters,
      user,
      isReceived,
      formatCurrency,
      setIsDownloading,
      fromDate,
      toDate,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHeader
        onBack={() => navigate("/dashboard")}
        rightContent={
          <div className="flex h-10 w-25 items-center justify-center">
            <img
              src="/image/novera.png"
              alt="Noreva Logo"
              className="object-contain"
            />
          </div>
        }
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="text-sm text-slate-500">Account</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Transaction history
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View all money sent and received through your Noreva account.
          </p>
        </div>

        {!isLoading && transactions.length > 0 && (
          <>
            <TransactionFilters
              search={search}
              setSearch={setSearch}
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              hasFilters={hasFilters}
              clearFilters={clearFilters}
              filteredTransactionsLength={filteredTransactions.length}
              isDownloading={isDownloading}
              onDownload={handleDownloadPdf}
            />

            <TransactionSummary
              filteredTransactionsLength={filteredTransactions.length}
              currentPage={currentPage}
              itemsPerPage={10}
              hasFilters={hasFilters}
            />
          </>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center">
              <p className="text-sm text-slate-500">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={<ReceiptText size={21} className="text-slate-400" />}
              title="No transactions yet"
              description="Your transfers will appear here once you send or receive money."
            />
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              icon={<Search size={21} className="text-slate-400" />}
              title="No matching transactions"
              description="Try changing your search or date filters."
              action={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm font-medium text-slate-700 hover:text-slate-950"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <>
              <TransactionTable
                transactions={paginatedTransactions}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                isReceived={isReceived}
                onViewReceipt={(reference) =>
                  navigate(`/transactions/${reference}`)
                }
              />

              {totalPages > 1 && (
                <TransactionPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPrevious={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  onNext={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Transactions;
