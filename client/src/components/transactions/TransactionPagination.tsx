import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface TransactionPaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const TransactionPagination = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: TransactionPaginationProps) => {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 sm:px-6">
      <p className="text-sm text-slate-500">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={onPrevious}
          className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={onNext}
          className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
