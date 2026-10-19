import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface BrandLinkProps {
  children: ReactNode;
  className?: string;
}

const BrandLink = ({ children, className }: BrandLinkProps) => {
  const { user } = useAuth();

  return (
    <Link
      to={user ? "/dashboard" : "/"}
      aria-label={user ? "Go to dashboard" : "Go to home"}
      className={className}
    >
      {children}
    </Link>
  );
};

export default BrandLink;