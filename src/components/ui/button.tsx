import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:shadow-md hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:translate-y-0 active:shadow-sm",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700 active:translate-y-0 active:shadow-sm",
        outline:
          "border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:border-gray-300 text-gray-700 active:translate-y-0 active:shadow-sm",
        secondary:
          "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 active:translate-y-0 active:shadow-sm",
        ghost: "hover:bg-gray-100 text-gray-700 shadow-none hover:shadow-none hover:translate-y-0",
        link: "text-blue-600 underline-offset-4 hover:underline shadow-none hover:shadow-none hover:translate-y-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
