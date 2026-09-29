import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  ReceiptText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

interface Transaction {
  id: string;
  reference: string;
  amount: string | number;
  type: string;
  status: string;
  description?: string;
  senderId?: string;
  receiverId?: string;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
  };
  receiver?: {
    firstName: string;
    lastName: string;
  };
}

const Transactions = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get("/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTransactions(response.data.transactions);
      } catch (error) {
        console.error("Failed to load transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchTransactions();
    }
  }, [token]);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const isReceived = (transaction: Transaction) => {
    return transaction.receiverId === user?.id;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back to dashboard
          </button>

          <div className="flex h-10 w-32 items-center justify-center rounded-lg border border-dashed border-slate-300">
            <span className="text-[10px] font-medium text-slate-400">
              NOREVA LOGO
            </span>
          </div>
        </div>
      </header>

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

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center">
              <p className="text-sm text-slate-500">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <ReceiptText size={21} className="text-slate-400" />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                No transactions yet
              </p>

              <p className="mt-1 max-w-sm text-sm text-slate-400">
                Your transfers will appear here once you send or receive money.
              </p>
            </div>
          ) : (
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
                            onClick={() =>
                              navigate(`/transactions/${transaction.reference}`)
                            }
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
          )}
        </section>
      </main>
    </div>
  );
};

export default Transactions;
