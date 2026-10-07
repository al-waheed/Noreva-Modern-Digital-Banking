import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  containerClassName?: string;
}

const EmptyState = ({
  icon,
  title,
  description,
  action,
  containerClassName,
}: EmptyStateProps) => {
  return (
    <div
      className={
        containerClassName ??
        "flex min-h-64 flex-col items-center justify-center px-6 text-center"
      }
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-700">{title}</p>

      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>
      )}

      {action}
    </div>
  );
};

export default EmptyState;
