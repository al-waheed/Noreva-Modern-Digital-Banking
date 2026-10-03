import { useState } from "react";
import { LockKeyhole, X } from "lucide-react";

interface CreateTransactionPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  isLoading?: boolean;
  error?: string;
}

const CreateTransactionPinModal = ({
  isOpen,
  onClose,
  onSuccess,
  isLoading = false,
  error,
}: CreateTransactionPinModalProps) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  if (!isOpen) {
    return null;
  }

  const handlePinChange = (value: string) => {
    setPin(value.replace(/\D/g, "").slice(0, 4));
  };

  const handleConfirmPinChange = (value: string) => {
    setConfirmPin(value.replace(/\D/g, "").slice(0, 4));
  };

  const handleSubmit = () => {
    if (pin.length !== 4 || confirmPin.length !== 4 || isLoading) {
      return;
    }

    if (pin !== confirmPin) {
      return;
    }

    onSuccess(pin);
  };

  const handleClose = () => {
    if (isLoading) return;

    setPin("");
    setConfirmPin("");
    onClose();
  };

  const pinsDoNotMatch =
    confirmPin.length === 4 && pin !== confirmPin;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
              <LockKeyhole className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Create transaction PIN
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create a 4-digit PIN to authorize transactions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="create-transaction-pin"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Create PIN
            </label>

            <input
              id="create-transaction-pin"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={4}
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              placeholder="••••"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-xl tracking-[0.5em] outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-transaction-pin"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Confirm PIN
            </label>

            <input
              id="confirm-transaction-pin"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => handleConfirmPinChange(e.target.value)}
              placeholder="••••"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-xl tracking-[0.5em] outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />

            {pinsDoNotMatch && (
              <p className="mt-2 text-sm text-red-600">
                PINs do not match.
              </p>
            )}

            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
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
            onClick={handleSubmit}
            disabled={
              pin.length !== 4 ||
              confirmPin.length !== 4 ||
              pin !== confirmPin ||
              isLoading
            }
            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create PIN"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTransactionPinModal;
