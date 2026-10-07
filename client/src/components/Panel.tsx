import type { PropsWithChildren, ReactNode } from "react";

interface PanelProps extends PropsWithChildren {
  className?: string;
  header?: ReactNode;
  headerAction?: ReactNode;
}

const Panel = ({
  className = "",
  header,
  headerAction,
  children,
}: PanelProps) => {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-5 ${className}`.trim()}
    >
      {(header || headerAction) && (
        <div className="flex items-start justify-between gap-3">
          {header}
          {headerAction}
        </div>
      )}

      {children}
    </section>
  );
};

export default Panel;
