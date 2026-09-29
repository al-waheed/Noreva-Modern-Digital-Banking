import { Check, Copy, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface ReceiveMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReceiveMoneyModal = ({ isOpen, onClose }: ReceiveMoneyModalProps) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const accountNumber = user?.accountNumber || "";

  const copyAccountNumber = async () => {
    if (!accountNumber) return;

    await navigator.clipboard.writeText(accountNumber);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Receive money
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Share your account details to receive money.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Account holder */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Account holder
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              {user?.firstName} {user?.lastName}
            </p>

            <p className="mt-1 text-sm text-slate-500">Noreva account</p>
          </div>

          {/* Account number */}
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700">Account number</p>

            <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span className="font-mono text-lg font-semibold tracking-wider text-slate-900">
                {accountNumber}
              </span>

              <button
                type="button"
                onClick={copyAccountNumber}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-5 rounded-xl border border-slate-200 p-4">
            <p className="text-sm leading-6 text-slate-600">
              Give this account number to another Noreva user so they can send
              money directly to your wallet.
            </p>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full cursor-pointer rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiveMoneyModal;
