import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onCloseDisabled?: boolean;
  closeButtonClassName?: string;
}

const ModalShell = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  onCloseDisabled = false,
  closeButtonClassName,
}: ModalShellProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                {icon}
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

              {description && (
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={onCloseDisabled}
            className={
              closeButtonClassName ??
              "rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            }
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {children}

        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
};

export default ModalShell;
