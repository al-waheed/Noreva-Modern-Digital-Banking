import { ArrowLeft, CheckCircle2, Loader2, Send, User, X } from "lucide-react";
import { useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sendTransferEmail } from "../lib/email";
import api from "../lib/api";

interface Recipient {
  firstName: string;
  lastName: string;
  accountNumber: string;
}

const SendMoney = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [recipient, setRecipient] = useState<Recipient | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPinModal, setShowPinModal] = useState(false);
  const [transactionPin, setTransactionPin] = useState("");
  const [pinError, setPinError] = useState("");

  const findRecipient = async () => {
    setError("");
    setRecipient(null);

    if (accountNumber.length !== 10) {
      setError("Enter a valid 10-digit account number.");
      return;
    }

    try {
      setIsSearching(true);

      const response = await api.post(
        "/transfers/recipient",
        { accountNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setRecipient(response.data.recipient);
    } catch (error: any) {
      setError(error.response?.data?.message || "Unable to find this account.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleTransfer = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!recipient) {
      setError("Find and confirm the recipient first.");
      return;
    }

    const transferAmount = Number(amount);

    if (!transferAmount || transferAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    setPinError("");
    setTransactionPin("");
    setShowPinModal(true);
  };

  const confirmTransfer = async () => {
    setPinError("");

    if (transactionPin.length !== 4) {
      setPinError("Enter your 4-digit transaction PIN.");
      return;
    }

    if (!recipient) {
      setPinError("Recipient information is missing.");
      return;
    }

    const transferAmount = Number(amount);

    try {
      setIsSending(true);

      const response = await api.post(
        "/transfers",
        {
          accountNumber: recipient.accountNumber,
          amount: transferAmount,
          description: description.trim() || undefined,
          transactionPin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const transfer = response.data.transfer;

      const transactionReference = transfer.senderTransaction.reference;

      try {
        await sendTransferEmail({
          toEmail: transfer.recipient.email,
          toName: `${transfer.recipient.firstName} ${transfer.recipient.lastName}`,
          amount: transfer.senderTransaction.amount,
          senderName: `${user?.firstName} ${user?.lastName}`,
          reference: transactionReference,
          description: description.trim() || "Transfer",
        });
      } catch (emailError) {
        console.error("Transfer email failed:", emailError);
      }

      setShowPinModal(false);
      setTransactionPin("");

      navigate(`/transactions/${transactionReference}`);
    } catch (error: any) {
      setPinError(
        error.response?.data?.message || "Transfer failed. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:px-6">
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

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="text-sm text-slate-500">Transfers</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Send money
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Transfer money instantly to another Noreva account.
          </p>
        </div>

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <CheckCircle2 size={20} className="shrink-0" />

            <div>
              <p className="font-semibold">Transfer successful</p>
              <p className="mt-1">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleTransfer}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-7"
        >
          <div>
            <label className="text-sm font-medium text-slate-700">
              Recipient account number
            </label>

            <div className="mt-2 flex gap-2">
              <input
                value={accountNumber}
                onChange={(event) => {
                  setAccountNumber(
                    event.target.value.replace(/\D/g, "").slice(0, 10),
                  );
                  setRecipient(null);
                  setError("");
                }}
                placeholder="Enter 10-digit account number"
                inputMode="numeric"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />

              <button
                type="button"
                onClick={findRecipient}
                disabled={isSearching}
                className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSearching ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Find"
                )}
              </button>
            </div>
          </div>

          {recipient && (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                <User size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  {recipient.firstName} {recipient.lastName}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {recipient.accountNumber}
                </p>
              </div>

              <CheckCircle2 size={18} className="ml-auto text-green-600" />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700">Amount</label>

            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                ₦
              </span>

              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 py-3 pl-8 pr-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Description
              <span className="ml-1 font-normal text-slate-400">
                (optional)
              </span>
            </label>

            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. Payment for groceries"
              maxLength={100}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div className="border-t border-slate-200 pt-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-slate-500">From</span>

              <span className="font-medium text-slate-700">
                {user?.firstName} {user?.lastName}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSending || !recipient}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} />
              Send money
            </button>
          </div>
        </form>
      </main>

      {showPinModal && recipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Confirm transfer
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your transaction PIN to authorize this payment.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isSending) return;

                  setShowPinModal(false);
                  setTransactionPin("");
                  setPinError("");
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white">
                    <User size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Sending to</p>

                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {recipient.firstName} {recipient.lastName}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {recipient.accountNumber}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-500">Amount</p>

                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    ₦
                    {Number(amount).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Transaction PIN
                </label>

                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  value={transactionPin}
                  onChange={(event) => {
                    setTransactionPin(
                      event.target.value.replace(/\D/g, "").slice(0, 4),
                    );
                    setPinError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      confirmTransfer();
                    }
                  }}
                  placeholder="Enter 4-digit PIN"
                  autoFocus
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-lg tracking-[0.5em] outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                />

                {pinError && (
                  <p className="mt-2 text-sm text-red-600">{pinError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isSending}
                  onClick={() => {
                    setShowPinModal(false);
                    setTransactionPin("");
                    setPinError("");
                  }}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSending || transactionPin.length !== 4}
                  onClick={confirmTransfer}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    "Confirm transfer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendMoney;
