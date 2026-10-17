import { useEffect, useMemo, useState } from "react";

export interface TransactionPerson {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  account?: {
    accountNumber?: string;
  };
}

export interface Transaction {
  id: string;
  amount: string | number;
  createdAt: string;
  description?: string | null;
  receiverId?: string;
  reference: string;
  sender?: TransactionPerson;
  receiver?: TransactionPerson;
  status: string;
  type: string;
}

export const ITEMS_PER_PAGE = 10;

interface UseTransactionFiltersArgs {
  transactions: Transaction[];
  userId?: string;
}

export const useTransactionFilters = ({
  transactions,
  userId,
}: UseTransactionFiltersArgs) => {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const isReceived = (transaction: Transaction) => {
    return transaction.receiverId === userId;
  };

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const received = isReceived(transaction);
      const otherPerson = received ? transaction.sender : transaction.receiver;

      const personName = otherPerson
        ? `${otherPerson.firstName} ${otherPerson.lastName}`
        : "";

      const searchableText = [personName, otherPerson?.account?.accountNumber || ""]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      const transactionDate = new Date(transaction.createdAt);

      let matchesFromDate = true;
      let matchesToDate = true;

      if (fromDate) {
        const startDate = new Date(`${fromDate}T00:00:00`);
        matchesFromDate = transactionDate >= startDate;
      }

      if (toDate) {
        const endDate = new Date(`${toDate}T23:59:59.999`);
        matchesToDate = transactionDate <= endDate;
      }

      return matchesSearch && matchesFromDate && matchesToDate;
    });
  }, [transactions, search, fromDate, toDate, userId]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE),
  );

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, fromDate, toDate]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const hasFilters = Boolean(search || fromDate || toDate);

  const totalReceived = useMemo(() => {
    return filteredTransactions.reduce((total, transaction) => {
      if (isReceived(transaction)) {
        return total + Number(transaction.amount);
      }

      return total;
    }, 0);
  }, [filteredTransactions, userId]);

  const totalSent = useMemo(() => {
    return filteredTransactions.reduce((total, transaction) => {
      if (!isReceived(transaction)) {
        return total + Number(transaction.amount);
      }

      return total;
    }, 0);
  }, [filteredTransactions, userId]);

  return {
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
  };
};
