interface StatCardProps {
  label: string;
  value: string | number;
  caption: string;
  valueClassName?: string;
}

const StatCard = ({
  label,
  value,
  caption,
  valueClassName,
}: StatCardProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>

      <p
        className={
          valueClassName ?? "mt-2 text-xl font-semibold text-slate-900"
        }
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">{caption}</p>
    </div>
  );
};

export default StatCard;
