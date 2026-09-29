import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}

const PasswordInput = ({
  id,
  value,
  onChange,
  placeholder = "Enter your password",
  required = false,
  minLength,
  autoComplete,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
		minLength={minLength}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
      />

      <button
        type="button"
        onClick={() => setShowPassword((current) => !current)}
        className="absolute right-0 top-0 flex h-full w-11 cursor-pointer items-center justify-center text-slate-500 hover:text-slate-700"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

export default PasswordInput;
