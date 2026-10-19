import { CalendarClock, Plus, X } from "lucide-react";
import { useEffect, useState, type SubmitEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import SearchField from "../components/SearchField";
import TransactionPinModal from "../components/TransactionPinModal";
import CreateTransactionPinModal from "../components/CreateTransactionPinModal";
import { formatCurrency } from "../utils/formatters";
import type { AppDispatch, RootState } from "../store/store";
import {
  setScheduledPayments,
  addScheduledPayment,
  updateScheduledPayment,
  setScheduledPaymentsLoading,
} from "../store/slices/scheduledPaymentsSlice";

interface Recipient {
  firstName: string;
  lastName: string;
  accountNumber: string;
}

const PAYMENTS_PER_PAGE = 7;

const ScheduledPayments = () => {
  const { user, createTransactionPin } = useAuth();
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();

  const { payments, isLoading } = useSelector(
    (state: RootState) => state.scheduledPayments,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showCreatePinModal, setShowCreatePinModal] = useState(false);

  const [accountNumber, setAccountNumber] = useState("");
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pinError, setPinError] = useState("");
  const [createPinError, setCreatePinError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) {
      dispatch(setScheduledPaymentsLoading(false));
      return;
    }

    let isActive = true;
    let isInitialLoad = true;

    const loadPayments = async () => {

      try {
        const response = await api.get("/scheduled-payments");

        if (isActive) {
          dispatch(setScheduledPayments(response.data.payments));
        }
      } catch (error: any) {
        if (isActive && isInitialLoad) {
          setError(
            error.response?.data?.message ||
              "Unable to load scheduled payments.",
          );
          dispatch(setScheduledPaymentsLoading(false));
        }
      } finally {
        isInitialLoad = false;
      }
    };

    dispatch(setScheduledPaymentsLoading(true));
    void loadPayments();

    const refreshInterval = window.setInterval(() => {
      void loadPayments();
    }, 30_000);

    return () => {
      isActive = false;
      window.clearInterval(refreshInterval);
    };
  }, [user, dispatch]);

  const resetForm = () => {
    setAccountNumber("");
    setRecipient(null);
    setAmount("");
    setDescription("");
    setScheduledFor("");
    setError("");
    setPinError("");
    setCreatePinError("");
  };

  const closeModal = () => {
    if (isSubmitting) return;

    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setPinError("");
    setCreatePinError("");

    if (!accountNumber || !amount || !scheduledFor) {
      setError("Please complete all required fields.");
      return;
    }

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    try {
      setIsSubmitting(true);

      const recipientResponse = await api.post(
        "/transfers/recipient",
        {
          accountNumber,
        },
      );

      const foundRecipient = recipientResponse.data.recipient;

      setRecipient(foundRecipient);

      if (user?.hasTransactionPin) {
        setShowPinModal(true);
      } else {
        setShowCreatePinModal(true);
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Unable to find this recipient.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmScheduledPayment = async (transactionPin: string) => {
    setPinError("");

    try {
      setIsSubmitting(true);

      const response = await api.post(
        "/scheduled-payments",
        {
          accountNumber,
          amount: Number(amount),
          description: description.trim() || undefined,
          scheduledFor,
          transactionPin,
        },
      );

      dispatch(addScheduledPayment(response.data.payment));

      setShowPinModal(false);
      setShowCreatePinModal(false);
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      setPinError(
        error.response?.data?.message ||
          "Unable to schedule payment. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePinSuccess = async (pin: string) => {
    setCreatePinError("");

    try {
      setIsSubmitting(true);

      await createTransactionPin(pin);

      setShowCreatePinModal(false);

      await confirmScheduledPayment(pin);
    } catch (error: any) {
      setCreatePinError(
        error.response?.data?.message ||
          error.message ||
          "Unable to create transaction PIN.",
      );
      setIsSubmitting(false);
    }
  };

  const cancelPayment = async (id: string) => {
    try {
      const response = await api.patch(
        `/scheduled-payments/${id}/cancel`,
        {},
      );

      dispatch(updateScheduledPayment(response.data.payment));
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to cancel payment.");
    }
  };

  const sortedPayments = [...payments].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
  const searchTerm = search.trim().toLowerCase();
  const filteredPayments = sortedPayments.filter((payment) => {
    const recipientName = payment.receiver
      ? `${payment.receiver.firstName} ${payment.receiver.lastName}`.toLowerCase()
      : "";
    const accountNumber = payment.receiver?.account?.accountNumber ?? "";

    return (
      recipientName.includes(searchTerm) ||
      accountNumber.toLowerCase().includes(searchTerm)
    );
  });
  const totalPages = Math.ceil(filteredPayments.length / PAYMENTS_PER_PAGE);
  const visiblePayments = filteredPayments.slice(
    (currentPage - 1) * PAYMENTS_PER_PAGE,
    currentPage * PAYMENTS_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHeader
        onBack={() => navigate("/dashboard")}
        backLabel="Back to dashboard"
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

      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Payments</p>

              <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                Scheduled payments
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Plan payments in advance and keep track of upcoming transfers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                setIsModalOpen(true);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Schedule payment
            </button>
          </div>

          {error && !isModalOpen && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Loading scheduled payments...
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <CalendarClock className="h-6 w-6 text-slate-600" />
                </div>

                <h2 className="mt-4 font-semibold text-slate-900">
                  No scheduled payments
                </h2>

                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Schedule a payment to a Noreva account and manage it from
                  here.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setIsModalOpen(true);
                  }}
                  className="mt-5 cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Schedule your first payment
                </button>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 p-5">
                  <SearchField
                    label="Search scheduled payments"
                    value={search}
                    placeholder="Recipient name or account number"
                    onChange={(value) => {
                      setSearch(value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {filteredPayments.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm text-slate-600">
                      No scheduled payments match your search.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {visiblePayments.map((payment) => {
                  const isPending = payment.status === "PENDING";
                  const isSuccessful = payment.status === "SUCCESS";
                  const isCancelled = payment.status === "FAILED";

                  return (
                    <div
                      key={payment.id}
                      className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <CalendarClock className="h-5 w-5 text-slate-600" />
                        </div>

                        <div>
                          <p className="font-medium text-slate-900">
                            {payment.receiver
                              ? `${payment.receiver.firstName} ${payment.receiver.lastName}`
                              : "Noreva user"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {payment.description || "Scheduled payment"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span>
                              {new Date(payment.scheduledFor).toLocaleString(
                                "en-NG",
                                {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                },
                              )}
                            </span>

                            <span>•</span>

                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-6 sm:justify-end">
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            {formatCurrency(payment.amount)}
                          </p>

                          <span
                            className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                              isPending
                                ? "bg-amber-50 text-amber-700"
                                : isSuccessful
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isPending
                              ? "Scheduled"
                              : isSuccessful
                                ? "Completed"
                                : isCancelled
                                  ? "Cancelled"
                                  : payment.status}
                          </span>
                        </div>

                        {isPending && (
                          <button
                            type="button"
                            onClick={() => cancelPayment(payment.id)}
                            className="cursor-pointer text-sm font-medium text-slate-500 hover:text-red-600"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                    })}
                  </div>
                )}

                {totalPages > 1 && (
                  <Pagination
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

        {isModalOpen && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 px-4"
            onClick={closeModal}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Schedule payment
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Set up a future payment to another Noreva user.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {error && (
                  <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Recipient account number
                    </label>

                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(event) =>
                        setAccountNumber(
                          event.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      maxLength={10}
                      placeholder="Enter 10-digit account number"
                      className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Amount
                    </label>

                    <div className="relative mt-2">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                        ₦
                      </span>

                      <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-slate-200 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Date
                    </label>

                    <input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(event) => setScheduledFor(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Description
                    </label>

                    <input
                      type="text"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      maxLength={100}
                      placeholder="Optional"
                      className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <TransactionPinModal
          isOpen={showPinModal}
          onClose={() => {
            if (isSubmitting) return;

            setShowPinModal(false);
            setPinError("");
          }}
          onConfirm={confirmScheduledPayment}
          title="Confirm scheduled payment"
          description="Review the payment details and enter your PIN to authorize it."
          recipientName={
            recipient
              ? `${recipient.firstName} ${recipient.lastName}`
              : undefined
          }
          recipientAccountNumber={recipient?.accountNumber}
          amount={Number(amount)}
          isLoading={isSubmitting}
          error={pinError}
        />

        <CreateTransactionPinModal
          isOpen={showCreatePinModal}
          onClose={() => {
            if (isSubmitting) return;

            setShowCreatePinModal(false);
            setCreatePinError("");
          }}
          onSuccess={handleCreatePinSuccess}
          isLoading={isSubmitting}
          error={createPinError}
        />
      </div>
    </div>
  );
};

export default ScheduledPayments;
