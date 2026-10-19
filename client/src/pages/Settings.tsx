import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Panel from "../components/Panel";
import { useAuth } from "../context/AuthContext";
import CreateTransactionPinModal from "../components/CreateTransactionPinModal";
import ChangeTransactionPinModal from "../components/ChangeTransactionPinModal";

const Settings = () => {
  const navigate = useNavigate();
  const {
    user,
    createTransactionPin,
    changeTransactionPin,
    refreshUser,
  } = useAuth();
  const [isCreatePinOpen, setIsCreatePinOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const [notice, setNotice] = useState("");

  const accountName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  const handleCreatePin = async (pin: string) => {
    setIsUpdatingPin(true);
    setPinError("");

    try {
      await createTransactionPin(pin);
      await refreshUser();
      setIsCreatePinOpen(false);
      setNotice("Transaction PIN created.");
    } catch (error: any) {
      setPinError(
        error.response?.data?.message || "Unable to create transaction PIN.",
      );
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const handleChangePin = async (currentPin: string, newPin: string) => {
    setIsUpdatingPin(true);
    setPinError("");

    try {
      await changeTransactionPin(currentPin, newPin);
      await refreshUser();
      setIsChangePinOpen(false);
      setNotice("Transaction PIN changed.");
    } catch (error: any) {
      setPinError(
        error.response?.data?.message || "Unable to change transaction PIN.",
      );
    } finally {
      setIsUpdatingPin(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHeader onBack={() => navigate(-1)} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm text-slate-500">Account</p>
          <h1 className="mt-1 text-2xl font-semibold">Settings</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Panel header={<h2 className="font-semibold">Personal details</h2>}>
            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="account-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Account name
                </label>
                <input
                  id="account-name"
                  type="text"
                  value={accountName}
                  readOnly
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="account-email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="account-email"
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="account-phone"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Phone number
                </label>
                <input
                  id="account-phone"
                  type="tel"
                  value={user?.phone ?? "Not provided"}
                  readOnly
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none"
                />
              </div>
            </div>
          </Panel>

          <Panel header={<h2 className="font-semibold">Account details</h2>}>
            <div className="mt-5">
              <label
                htmlFor="account-number"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Account number
              </label>
              <input
                id="account-number"
                type="text"
                value={user?.accountNumber ?? ""}
                readOnly
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none"
              />
            </div>
          </Panel>

          <Panel
            className="md:col-span-2"
            header={<h2 className="font-semibold">Security</h2>}
          >
            {notice && (
              <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                {notice}
              </p>
            )}

            <div className="mt-5 divide-y divide-slate-100">
              <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">
                    Password
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Request a secure password reset link by email.
                  </p>
                </div>
                <Link
                  to="/forgot-password"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reset password
                </Link>
              </div>

              <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">
                    Transaction PIN
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {user?.hasTransactionPin
                      ? "A PIN is set for transaction authorization."
                      : "Set a PIN to authorize transactions."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPinError("");
                    setNotice("");
                    if (user?.hasTransactionPin) {
                      setIsChangePinOpen(true);
                    } else {
                      setIsCreatePinOpen(true);
                    }
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {user?.hasTransactionPin ? "Change PIN" : "Create PIN"}
                </button>
              </div>
            </div>
          </Panel>
        </div>
      </main>

      <CreateTransactionPinModal
        key={isCreatePinOpen ? "create-open" : "create-closed"}
        isOpen={isCreatePinOpen}
        onClose={() => setIsCreatePinOpen(false)}
        onSuccess={handleCreatePin}
        isLoading={isUpdatingPin}
        error={pinError}
      />

      <ChangeTransactionPinModal
        key={isChangePinOpen ? "change-open" : "change-closed"}
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
        onSuccess={handleChangePin}
        isLoading={isUpdatingPin}
        error={pinError}
      />
    </div>
  );
};

export default Settings;