"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

/**
 * Renders a Radix UI label root element with default styling and a data-slot attribute.
 *
 * @param className - Additional CSS classes to merge with the component's default styles
 * @param props - All other props are forwarded to the underlying Radix `LabelPrimitive.Root`
 * @returns A React element for a styled `LabelPrimitive.Root` with merged class names and forwarded props
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }