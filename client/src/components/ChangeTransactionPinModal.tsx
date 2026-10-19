import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import ModalShell from "./ModalShell";

interface ChangeTransactionPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (currentPin: string, newPin: string) => void;
  isLoading?: boolean;
  error?: string;
}

const ChangeTransactionPinModal = ({
  isOpen,
  onClose,
  onSuccess,
  isLoading = false,
  error,
}: ChangeTransactionPinModalProps) => {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const sanitizePin = (value: string) => value.replace(/\D/g, "").slice(0, 4);
  const pinsDoNotMatch = confirmPin.length === 4 && newPin !== confirmPin;
  const canSubmit =
    currentPin.length === 4 &&
    newPin.length === 4 &&
    confirmPin.length === 4 &&
    newPin === confirmPin &&
    newPin !== currentPin &&
    !isLoading;

  const handleClose = () => {
    if (isLoading) return;

    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      onCloseDisabled={isLoading}
      title="Change transaction PIN"
      description="Verify your current PIN and choose a new 4-digit PIN."
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
            disabled={!canSubmit}
            onClick={() => onSuccess(currentPin, newPin)}
            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update PIN"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="current-transaction-pin"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Current PIN
          </label>
          <input
            id="current-transaction-pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            maxLength={4}
            value={currentPin}
            onChange={(event) => setCurrentPin(sanitizePin(event.target.value))}
            placeholder="••••"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-xl tracking-[0.5em] outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div>
          <label
            htmlFor="new-transaction-pin"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            New PIN
          </label>
          <input
            id="new-transaction-pin"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={4}
            value={newPin}
            onChange={(event) => setNewPin(sanitizePin(event.target.value))}
            placeholder="••••"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-xl tracking-[0.5em] outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div>
          <label
            htmlFor="confirm-new-transaction-pin"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Confirm new PIN
          </label>
          <input
            id="confirm-new-transaction-pin"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={4}
            value={confirmPin}
            onChange={(event) => setConfirmPin(sanitizePin(event.target.value))}
            placeholder="••••"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-xl tracking-[0.5em] outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
          />
          {pinsDoNotMatch && (
            <p className="mt-2 text-sm text-red-600">PINs do not match.</p>
          )}
          {newPin.length === 4 && newPin === currentPin && (
            <p className="mt-2 text-sm text-red-600">
              Choose a different PIN.
            </p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </ModalShell>
  );
};

export default ChangeTransactionPinModal;