import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  ReceiptText,
  Settings,
  Wallet,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import ReceiveMoneyModal from "../components/ReceiveMoneyModal";
import NotificationBell from "../components/NotificationBell";
import api from "../lib/api";

const Dashboard = () => {
  const { token, logout, user } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboard(response.data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    }
  }, [token]);

  const firstName = dashboard?.user?.firstName || "User";
  const balance = Number(dashboard?.account?.balance || 0);
  const accountNumber = dashboard?.account?.accountNumber || "0000000000";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/*Receive Money Modal*/}
      <ReceiveMoneyModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
      />

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo placeholder */}
        <div className="flex h-20 items-center border-b border-slate-200 px-6">
          <div className="flex h-12 w-full items-center justify-center">
            {/* <span className="text-xs font-medium text-slate-400">
              <img
                src="/image/novera.png"
                alt="Noreva Logo"
                className="h-full w-full object-contain"
              />
            </span> */}
            <Link to="/" className="flex h-10 w-30 items-center justify-center">
              <img
                src="/image/novera.png"
                alt="Noreva Logo"
                className="object-contain"
              />
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="ml-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Main
          </p>

          <button className="flex w-full items-center gap-3 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-900">
            <LayoutDashboard size={18} />
            Overview
          </button>

          <button
            onClick={() => navigate("/send-money")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            <ArrowUpRight size={18} />
            Transfers
          </button>

          <button
            onClick={() => navigate("/transactions")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            <ReceiptText size={18} />
            Transactions
          </button>

          <button
            type="button"
            onClick={() => navigate("/cards")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            <CreditCard size={18} />
            Cards
          </button>

          <button
            onClick={() => navigate("/scheduled-payments")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            <Wallet size={18} />
            Scheduled payments
          </button>

          <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Account
          </p>

          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            <Settings size={18} />
            Settings
          </button>
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-200 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm text-slate-500">Dashboard</p>

            <h1 className="text-lg font-semibold text-slate-900">
              Welcome back, {firstName}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />

            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 hover:bg-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <span className="hidden text-sm font-medium text-slate-700 sm:block">
                {firstName}
              </span>

              <ChevronDown
                size={15}
                className="hidden text-slate-400 sm:block"
              />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <p className="text-sm text-slate-500">Loading your account...</p>
            </div>
          ) : (
            <>
              {/* Mobile heading */}
              <div className="mb-6 lg:hidden">
                <p className="text-sm text-slate-500">Dashboard</p>

                <h1 className="mt-1 text-xl font-semibold">
                  Welcome back, {firstName}
                </h1>
              </div>

              {/* Balance + actions */}
              <div className="grid gap-6 lg:grid-cols-3">
                <section className="rounded-xl bg-slate-900 p-6 text-white lg:col-span-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-400">
                        Available balance
                      </p>

                      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                        {formatCurrency(balance)}
                      </h2>
                    </div>

                    <Wallet className="text-slate-400" size={22} />
                  </div>

                  <div className="mt-8 border-t border-slate-700 pt-4">
                    <p className="text-xs text-slate-400">Account number</p>

                    <p className="mt-1 text-sm font-medium">{accountNumber}</p>
                  </div>
                </section>

                {/* Quick actions */}
                <section className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-900">
                    Quick actions
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate("/send-money")}
                      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 p-4 text-sm font-medium hover:bg-slate-50"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                        <ArrowUpRight size={18} />
                      </span>
                      Send money
                    </button>

                    <button
                      onClick={() => setIsReceiveOpen(true)}
                      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 p-4 text-sm font-medium hover:bg-slate-50"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                        <ArrowDownLeft size={18} />
                      </span>
                      Receive
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/cards")}
                      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 p-4 text-sm font-medium hover:bg-slate-50"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                        <CreditCard size={18} />
                      </span>
                      Cards
                    </button>

                    <button
                      onClick={() => navigate("/transactions")}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <ReceiptText size={18} />
                      History
                    </button>
                  </div>
                </section>
              </div>

              {/* Stats */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">Money received</p>

                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    ₦
                    {Number(
                      dashboard?.stats?.moneyReceived || 0,
                    ).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">This month</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">Money sent</p>

                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    ₦
                    {Number(dashboard?.stats?.moneySent || 0).toLocaleString(
                      "en-NG",
                      {
                        minimumFractionDigits: 2,
                      },
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">This month</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">Transactions</p>

                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {dashboard?.stats?.transactionCount || 0}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">This month</p>
                </div>
              </div>

              {/* Lower section */}
              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {/* Chart */}
                <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Account activity
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Your transaction activity over time
                      </p>
                    </div>

                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  <div className="mt-6 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dashboard?.monthlyActivity || []}
                        margin={{
                          top: 10,
                          right: 10,
                          left: -20,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />

                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) =>
                            `₦${Number(value).toLocaleString("en-NG")}`
                          }
                        />

                        <Tooltip
                          formatter={(value) =>
                            `₦${Number(value).toLocaleString("en-NG", {
                              minimumFractionDigits: 2,
                            })}`
                          }
                        />

                        <Bar dataKey="amount" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Recent transactions */}
                <section className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Recent transactions
                      </h2>
                    </div>

                    <button
                      onClick={() => navigate("/transactions")}
                      className="text-sm font-medium text-slate-700 hover:text-slate-950"
                    >
                      View all
                    </button>
                  </div>

                  <div className="mt-5 space-y-4">
                    {dashboard?.transactions?.length > 0 ? (
                      dashboard.transactions
                        .slice(0, 5)
                        .map((transaction: any) => {
                          const isReceived =
                            transaction.receiverId === user?.id;

                          const otherPerson = isReceived
                            ? transaction.sender
                            : transaction.receiver;

                          return (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                    isReceived
                                      ? "bg-slate-100 text-slate-700"
                                      : "bg-slate-900 text-white"
                                  }`}
                                >
                                  {isReceived ? (
                                    <ArrowDownLeft size={16} />
                                  ) : (
                                    <ArrowUpRight size={16} />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-900">
                                    {otherPerson
                                      ? `${otherPerson.firstName} ${otherPerson.lastName}`
                                      : "Noreva User"}
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {isReceived
                                      ? "Money received"
                                      : "Money sent"}
                                  </p>
                                </div>
                              </div>

                              <div className="ml-3 shrink-0 text-right">
                                <p
                                  className={`text-sm font-semibold ${
                                    isReceived
                                      ? "text-emerald-600"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {isReceived ? "+" : "-"}₦
                                  {Number(transaction.amount).toLocaleString(
                                    "en-NG",
                                    {
                                      minimumFractionDigits: 2,
                                    },
                                  )}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {new Date(
                                    transaction.createdAt,
                                  ).toLocaleDateString("en-NG")}
                                </p>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="py-8 text-center">
                        <ReceiptText
                          size={22}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm text-slate-500">
                          No transactions yet
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
