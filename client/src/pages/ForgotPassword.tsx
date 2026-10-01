import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      setIsSubmitting(true);

      await api.post("/auth/forgot-password", {
        email,
      });

      setMessage(
        "If an account exists with this email, a password reset link has been sent.",
      );

      setEmail("");
    } catch (error: any) {
      console.error("Forgot password error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to process your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back to login
          </Link>

          <div className="flex h-10 w-25 items-center justify-center">
            <img
              src="/image/novera.png"
              alt="Noreva Logo"
              className="object-contain"
            />
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <Mail size={22} />
            </div>

            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              Forgot your password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter the email address associated with your Noreva account and
              we'll send you a password reset link.
            </p>
          </div>

          {message && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

              <p>{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7"
          >
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-medium text-slate-900 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
