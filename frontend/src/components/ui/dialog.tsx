"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Renders a dialog root element and adds a `data-slot="dialog"` attribute.
 *
 * @returns A React element for the dialog root with forwarded props and `data-slot="dialog"`.
 */
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

/**
 * Renders a trigger element for a dialog and attaches `data-slot="dialog-trigger"`.
 *
 * @returns A React element that serves as the dialog's trigger, forwarding all provided props.
 */
function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

/**
 * Renders a Radix Dialog Portal element with `data-slot="dialog-portal"` and forwards all props.
 *
 * @returns The rendered dialog portal element.
 */
function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

/**
 * Renders a Dialog close control that forwards all props and sets `data-slot="dialog-close"`.
 *
 * @returns A `DialogPrimitive.Close` element with `data-slot="dialog-close"` and all provided props forwarded.
 */
function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

/**
 * Renders a fullscreen translucent backdrop for a dialog that animates on open and close.
 *
 * The element receives data-slot="dialog-overlay", default backdrop and transition classes, and any additional classes passed via `className`.
 *
 * @param className - Additional CSS classes to merge with the overlay's default styling
 * @returns A DialogPrimitive.Overlay element configured as the dialog backdrop
 */
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the dialog's content inside a portal with overlay and optional top-right close button.
 *
 * Renders positioned and styled dialog content together with a fullscreen overlay. When
 * `showCloseButton` is true, a close control with an accessible "Close" label is rendered in
 * the top-right corner of the content.
 *
 * @param className - Additional CSS classes applied to the content container
 * @param children - Content to display inside the dialog
 * @param showCloseButton - When `true` (default), displays a close button inside the dialog
 * @returns The rendered dialog content element
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/**
 * Renders the dialog header container and applies layout, spacing, and alignment classes.
 *
 * @returns A div element with `data-slot="dialog-header"` intended to contain header content.
 */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

/**
 * Renders a dialog footer container with responsive layout and slot metadata.
 *
 * The footer arranges children in a column-reverse stack on small screens and in a row aligned to the end on larger screens, and includes `data-slot="dialog-footer"`.
 *
 * @returns A JSX element representing the styled dialog footer container
 */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the dialog title with consistent typography and a `data-slot="dialog-title"` attribute.
 *
 * @returns The rendered title element with the component's typography classes applied and any forwarded props.
 */
function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * Renders the dialog description element with standardized styling and a `data-slot` attribute.
 *
 * @param className - Additional CSS class names to append to the default muted small-text styling.
 * @returns A DialogPrimitive.Description element with merged classes and `data-slot="dialog-description"`.
 */
function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}