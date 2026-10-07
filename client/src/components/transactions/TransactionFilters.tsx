import {
  CalendarDays,
  Download,
  Search,
  X,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface TransactionFiltersProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  fromDate: string;
  setFromDate: Dispatch<SetStateAction<string>>;
  toDate: string;
  setToDate: Dispatch<SetStateAction<string>>;
  hasFilters: boolean;
  clearFilters: () => void;
  filteredTransactionsLength: number;
  isDownloading: boolean;
  onDownload: () => void;
}

export const TransactionFilters = ({
  search,
  setSearch,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  hasFilters,
  clearFilters,
  filteredTransactionsLength,
  isDownloading,
  onDownload,
}: TransactionFiltersProps) => {
  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Search transactions
          </label>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, account, reference..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            From
          </label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            To
          </label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <X size={15} />
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={onDownload}
            disabled={filteredTransactionsLength === 0 || isDownloading}
            className="flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={15} />

            {isDownloading ? "Preparing..." : "Download PDF"}
          </button>
        </div>
      </div>
    </section>
  );
};
