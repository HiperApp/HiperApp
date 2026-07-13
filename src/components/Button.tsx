import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-hiper-red text-white active:bg-red-700",
  secondary: "bg-hiper-navy text-white active:bg-blue-900",
  outline: "bg-white text-hiper-navy border-2 border-hiper-navy",
  ghost: "bg-transparent text-hiper-navy",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", fullWidth = true, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`tap-target ${fullWidth ? "w-full" : ""} rounded-button font-semibold text-lg px-6 py-4 shadow-soft transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 ${VARIANT_CLASSES[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
