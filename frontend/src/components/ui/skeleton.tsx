import { cn } from "@/lib/utils"

/**
 * Renders a skeleton placeholder element with a pulsing background and rounded corners.
 *
 * @param className - Additional CSS classes to merge with the component's base styles
 * @returns The rendered div element representing the skeleton placeholder
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }