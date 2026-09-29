import { useState, type SubmitEvent } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import PasswordInput from "../components/PasswordInput";
import api from "../lib/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("This password reset link is invalid.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post("/auth/reset-password", {
        token,
        password,
      });

      setMessage(
        "Your password has been reset successfully. You can now sign in.",
      );

      setPassword("");
      setConfirmPassword("");

      navigate("/login", { replace: true });
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Unable to reset your password. Please request a new reset link.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <LockKeyhole size={22} />
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
            Reset your password
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Create a new password for your Noreva account.
          </p>
        </div>

        {message ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <div>
                <p className="font-medium text-green-800">
                  Password reset successful
                </p>

                <p className="mt-1 text-sm text-green-700">
                  Redirecting you to the login page...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7"
          >
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                New password
              </label>

              <div className="mt-2">
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter your new password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-slate-700"
              >
                Confirm new password
              </label>

              <div className="mt-2">
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirm your new password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Resetting password..." : "Reset password"}
            </button>
          </form>
        )}

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
  );
};

export default ResetPassword;
