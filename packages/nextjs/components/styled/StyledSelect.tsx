import React, { SelectHTMLAttributes, forwardRef } from "react";

interface StyledSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  widthClass?: string;
  sizeClass?: "select-xs" | "select-sm" | "select-md" | "select-lg";
}

export const StyledSelect = forwardRef<HTMLSelectElement, StyledSelectProps>(
  ({ children, label, widthClass = "w-full", sizeClass = "select-sm", className = "", ...props }, ref) => {
    return (
      <div className={label ? "flex items-center gap-2" : ""}>
        {label && <label htmlFor={props.id} className="text-sm font-medium">{label}</label>}
        <div className={`relative ${widthClass}`}>
          <select
            ref={ref}
            className={`select select-bordered ${sizeClass} w-full pl-3 pr-8 focus:outline-offset-0 hover:border-primary focus:border-primary ${className}`}
            style={{ 
              WebkitAppearance: "none", 
              MozAppearance: "none",
              appearance: "none",
              backgroundImage: "none"
            }}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
);

StyledSelect.displayName = "StyledSelect";

export default StyledSelect; 