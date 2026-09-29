import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex h-10 w-44 items-center justify-center">
            <img src="/image/novera.png" alt="Noreva Logo" className="object-contain" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Features
            </a>

            <a
              href="#security"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Security
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-950 sm:block"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Open an account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="border-b border-slate-200">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
            <div className="max-w-xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Modern digital banking
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Banking built around your everyday life.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
                Manage your money, send payments, track your spending and access
                your digital card — all from one simple account.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="rounded-lg bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Open an account
                </Link>

                <Link
                  to="/login"
                  className="rounded-lg border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Sign in
                </Link>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Demo fintech platform for portfolio purposes.
              </p>
            </div>

            {/* Account Preview */}
            <div className="lg:pl-10">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                        Available balance
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight">
                        ₦100,000.00
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold">
                      Noreva
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Transfers</p>
                      <p className="mt-2 text-sm font-semibold">Available</p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Virtual Card</p>
                      <p className="mt-2 text-sm font-semibold">Active</p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Payments</p>
                      <p className="mt-2 text-sm font-semibold">Simple</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Everything in one place
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                The essentials for managing your money.
              </h2>

              <p className="mt-4 text-slate-600">
                Noreva brings everyday financial tools together in one
                straightforward experience.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 md:grid-cols-3">
              <div className="bg-white p-7">
                <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold">
                  01
                </div>

                <h3 className="text-lg font-semibold">Send money</h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Transfer money to another Noreva customer quickly and keep
                  track of every transaction.
                </p>
              </div>

              <div className="bg-white p-7">
                <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold">
                  02
                </div>

                <h3 className="text-lg font-semibold">Digital card</h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Access your virtual card details directly from your account
                  whenever you need them.
                </p>
              </div>

              <div className="bg-white p-7">
                <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold">
                  03
                </div>

                <h3 className="text-lg font-semibold">Track spending</h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  See your transaction history and understand where your money
                  is going.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="border-b border-slate-200">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Security
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Built with security in mind.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-slate-600">
                Your account is protected with authenticated sessions and secure
                password handling, giving you control over your financial
                information.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold">Secure authentication</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Account access is protected through authenticated sessions.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold">Transaction records</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Keep a clear record of transfers and account activity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="about">
          <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to get started?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-slate-600">
              Create your Noreva account and experience simple digital financial
              management.
            </p>

            <Link
              to="/register"
              className="mt-8 inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Open an account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span className="font-semibold text-slate-900">Noreva</span>

          <span>© 2026 Noreva. Portfolio demonstration.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
