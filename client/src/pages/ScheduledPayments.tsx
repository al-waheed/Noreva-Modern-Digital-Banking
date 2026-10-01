import { ArrowLeft, CalendarClock, ChevronDown, Plus, X } from "lucide-react";
import { useEffect, useState, type SubmitEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

interface ScheduledPayment {
  id: string;
  amount: string | number;
  description?: string | null;
  scheduledFor: string;
  frequency: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";
  status: string;
  receiver?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const ScheduledPayments = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [payments, setPayments] = useState<ScheduledPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [frequency, setFrequency] = useState("ONCE");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get("/scheduled-payments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPayments(response.data.payments);
      } catch (error: any) {
        setError(
          error.response?.data?.message || "Unable to load scheduled payments.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPayments();
  }, [token]);

  const resetForm = () => {
    setAccountNumber("");
    setAmount("");
    setDescription("");
    setScheduledFor("");
    setFrequency("ONCE");
    setError("");
  };

  const closeModal = () => {
    if (isSubmitting) return;

    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    setError("");

    if (!accountNumber || !amount || !scheduledFor) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post(
        "/scheduled-payments",
        {
          accountNumber,
          amount: Number(amount),
          description: description.trim() || undefined,
          scheduledFor,
          frequency,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPayments((currentPayments) => [
        ...currentPayments,
        response.data.payment,
      ]);

      closeModal();
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to schedule payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelPayment = async (id: string) => {
    try {
      await api.patch(
        `/scheduled-payments/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPayments((currentPayments) =>
        currentPayments.map((payment) =>
          payment.id === id ? { ...payment, status: "FAILED" } : payment,
        ),
      );
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to cancel payment.");
    }
  };

  const formatCurrency = (value: string | number) =>
    `₦${Number(value).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
    })}`;

  const formatFrequency = (value: string) =>
    value.charAt(0) + value.slice(1).toLowerCase();

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

          <div className="flex h-10 w-25 items-center justify-center">
            <img
              src="/image/novera.png"
              alt="Noreva Logo"
              className="object-contain"
            />
          </div>
        </div>
      </header>
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-6xl px-6 py-8">
          {/* Header */}
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
              onClick={() => setIsModalOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Schedule payment
            </button>
          </div>

          {/* Error */}
          {error && !isModalOpen && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Payments */}
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
                  onClick={() => setIsModalOpen(true)}
                  className="mt-5 cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Schedule your first payment
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {payments.map((payment) => {
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

                            <span>{formatFrequency(payment.frequency)}</span>
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
          </section>
        </main>

        {/* Schedule payment modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"
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
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
                      onChange={(event) => setAccountNumber(event.target.value)}
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
                      Frequency
                    </label>

                    <div className="relative mt-2">
                      <select
                        value={frequency}
                        onChange={(event) => setFrequency(event.target.value)}
                        className="w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      >
                        <option value="ONCE">Once</option>
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
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
                    {isSubmitting ? "Scheduling..." : "Schedule payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledPayments;
