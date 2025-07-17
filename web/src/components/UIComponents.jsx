// Card
export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
)

export const CardHeader = ({ children, className = "" }) => (
  <div className={`p-4 pb-2 ${className}`}>{children}</div>
)

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 pt-0 ${className}`}>{children}</div>
)

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
)

// Badge
export const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800 border-red-200",
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

// Button
export const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  ...props
}) => {
  const variants = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
    link: "text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline",
  }

  const sizes = {
    default: "px-4 py-2",
    sm: "px-3 py-1.5 text-sm",
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

// Input
export const Input = ({ className = "", ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

// Separator
export const Separator = ({ className = "" }) => (
  <hr className={`border-0 border-t border-gray-200 ${className}`} />
)

// ScrollArea
export const ScrollArea = ({ children, className = "" }) => (
  <div className={`overflow-auto ${className}`}>{children}</div>
)
