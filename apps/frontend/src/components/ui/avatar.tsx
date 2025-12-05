"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

/**
 * Renders the AvatarPrimitive.Root element with default avatar styling and optional custom classes.
 *
 * @param className - Additional CSS classes to merge with the component's default avatar styles.
 * @param props - Additional props are forwarded to `AvatarPrimitive.Root`.
 * @returns A React element representing the avatar root with merged `className` and forwarded props.
 */
function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders an avatar image with a square aspect ratio and size-filling styles.
 *
 * @param className - Additional CSS class names to merge with the defaults
 * @returns The configured AvatarPrimitive.Image element with `data-slot="avatar-image"` and combined classes
 */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

/**
 * Renders a styled avatar fallback used when the avatar image is unavailable.
 *
 * @param className - Additional CSS class names to merge with the component's default styling
 * @returns A JSX element wrapping fallback content with centered, rounded, and muted-background styling
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }