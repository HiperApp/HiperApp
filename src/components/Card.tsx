import { HTMLAttributes } from "react";

export default function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white rounded-card shadow-card p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
