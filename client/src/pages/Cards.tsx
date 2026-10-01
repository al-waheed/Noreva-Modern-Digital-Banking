import {
  Copy,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Unlock,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Cards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showDetails, setShowDetails] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [copied, setCopied] = useState(false);

  const card = user?.cards?.[0];

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(.{4})/g, "$1 ").trim();
  };

  const copyCardNumber = async () => {
    if (!card?.cardNumber) return;

    await navigator.clipboard.writeText(card.cardNumber);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  if (!card) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-2xl font-semibold text-slate-900">Cards</h1>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">
              No virtual card is available for this account.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  const expiry = `${String(card.expiryMonth).padStart(2, "0")}/${String(
    card.expiryYear,
  ).slice(-2)}`;

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
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Cards</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your cards and payment details.
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  isFrozen
                    ? "bg-slate-100 text-slate-600"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {isFrozen ? "Frozen" : "Active"}
              </span>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Card */}
              <div
                className={`relative min-h-280px overflow-hidden rounded-2xl bg-slate-900 p-7 text-white shadow-sm transition ${
                  isFrozen ? "cursor-not-allowed opacity-50 grayscale" : ""
                }`}
              >
                {/* Frozen overlay */}
                {isFrozen && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/30">
                    <div className="rounded-full border border-white/20 bg-slate-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg">
                      Card frozen
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Virtual card
                    </p>

                    <p className="mt-2 text-sm font-medium">NOREVA</p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-sm font-bold">
                    N
                  </div>
                </div>

                <div className="mt-12">
                  <p className="font-mono text-xl tracking-[0.18em]">
                    {showDetails
                      ? formatCardNumber(card.cardNumber)
                      : `•••• •••• •••• ${card.cardNumber.slice(-4)}`}
                  </p>
                </div>

                <div className="mt-8 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Cardholder
                    </p>

                    <p className="mt-1 text-sm font-medium uppercase">
                      {fullName}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Expires
                    </p>

                    <p className="mt-1 text-sm font-medium">{expiry}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      CVV
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {showDetails ? card.cvv : "•••"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card controls */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <ShieldCheck className="h-5 w-5 text-slate-700" />
                  </div>

                  <div>
                    <p className="font-medium text-slate-900">Card security</p>

                    <p className="text-sm text-slate-500">
                      Manage your card details.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {/* Show / Hide */}
                  <button
                    type="button"
                    disabled={isFrozen}
                    onClick={() => setShowDetails((value) => !value)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                      isFrozen
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                        : "cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {showDetails ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}

                      {showDetails ? "Hide card details" : "Show card details"}
                    </span>

                    {isFrozen && <Lock className="h-4 w-4" />}
                  </button>

                  {/* Copy */}
                  <button
                    type="button"
                    disabled={isFrozen}
                    onClick={copyCardNumber}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                      isFrozen
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                        : "cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy card number"}
                    </span>

                    {isFrozen && <Lock className="h-4 w-4" />}
                  </button>

                  {/* Freeze / Unfreeze */}
                  <button
                    type="button"
                    onClick={() => setIsFrozen((value) => !value)}
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-3">
                      {isFrozen ? (
                        <Unlock className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}

                      {isFrozen ? "Unfreeze card" : "Freeze card"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Physical Card */}
          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">Physical card</h2>

                <p className="mt-1 max-w-xl text-sm text-slate-500">
                  Physical Noreva cards are not available in this portfolio
                  demonstration.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Coming soon
              </span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Cards;
