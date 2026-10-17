import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  onBack?: () => void;
  backLabel?: string;
  rightContent?: ReactNode;
  children?: ReactNode;
}

const PageHeader = ({
  onBack,
  backLabel = "Back",
  rightContent,
  children,
}: PageHeaderProps) => {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            {backLabel}
          </button>
        ) : (
          <div />
        )}

        {rightContent ?? <div className="flex h-10 w-25 items-center justify-center" />}
      </div>

      {children}
    </header>
  );
};

export default PageHeader;
