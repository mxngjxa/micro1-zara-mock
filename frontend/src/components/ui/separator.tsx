"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * Renders a styled separator element with configurable orientation and decorative mode.
 *
 * @param className - Additional CSS classes to apply to the separator container
 * @param orientation - Layout orientation, either `"horizontal"` or `"vertical"`
 * @param decorative - Whether the separator is presentational (no accessibility role), `true` by default
 * @returns A React element that renders a styled Radix UI separator
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }