import type { ReactNode } from "react";

interface QuickActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  fullWidth?: boolean;
}

const QuickActionButton = ({
  icon,
  label,
  onClick,
  type = "button",
  fullWidth = false,
}: QuickActionButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={
        fullWidth
          ? "flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 p-4 text-sm font-medium hover:bg-slate-50"
          : "flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 p-4 text-sm font-medium hover:bg-slate-50"
      }
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
        {icon}
      </span>
      {label}
    </button>
  );
};

export default QuickActionButton;
