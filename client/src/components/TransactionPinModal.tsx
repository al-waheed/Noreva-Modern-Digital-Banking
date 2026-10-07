import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import ModalShell from "./ModalShell";

interface TransactionPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  title?: string;
  description?: string;
  recipientName?: string;
  recipientAccountNumber?: string;
  amount?: number;
  isLoading?: boolean;
  error?: string;
}

const TransactionPinModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm transaction",
  description = "Enter your 4-digit transaction PIN to continue.",
  recipientName,
  recipientAccountNumber,
  amount,
  isLoading = false,
  error,
}: TransactionPinModalProps) => {
  const [pin, setPin] = useState("");

  const handlePinChange = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "").slice(0, 4);
    setPin(numbersOnly);
  };

  const handleConfirm = () => {
    if (pin.length !== 4 || isLoading) {
      return;
    }

    onConfirm(pin);
  };

  const handleClose = () => {
    setPin("");
    onClose();
  };

  const formattedAmount =
    amount !== undefined
      ? `₦${amount.toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : null;

  const showTransactionDetails =
    recipientName || recipientAccountNumber || amount !== undefined;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      onCloseDisabled={isLoading}
      title={title}
      description={description}
      icon={<LockKeyhole className="h-5 w-5 text-slate-700" />}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={pin.length !== 4 || isLoading}
            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Confirming..." : "Confirm"}
          </button>
        </div>
      }
    >
      {showTransactionDetails && (
        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {recipientName && (
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-slate-500">Recipient</span>

              <span className="text-right text-sm font-semibold text-slate-900">
                {recipientName}
              </span>
            </div>
          )}

          {recipientAccountNumber && (
            <div className="mt-3 flex items-start justify-between gap-4">
              <span className="text-sm text-slate-500">Account number</span>

              <span className="text-right text-sm font-medium text-slate-700">
                {recipientAccountNumber}
              </span>
            </div>
          )}

          {formattedAmount && (
            <div className="mt-3 flex items-start justify-between gap-4 border-t border-slate-200 pt-3">
              <span className="text-sm text-slate-500">Amount</span>

              <span className="text-right text-base font-semibold text-slate-900">
                {formattedAmount}
              </span>
            </div>
          )}
        </div>
      )}

      <div>
        <label
          htmlFor="transaction-pin"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Transaction PIN
        </label>

        <input
          id="transaction-pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          value={pin}
          onChange={(e) => handlePinChange(e.target.value)}
          placeholder="••••"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-xl tracking-[0.5em] outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
        />

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </ModalShell>
  );
};

export default TransactionPinModal;
