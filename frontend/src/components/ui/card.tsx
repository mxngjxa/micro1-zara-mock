import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Renders a div configured as a styled card container.
 *
 * The root element includes data-slot="card" and default layout, spacing, border, and shadow styles.
 *
 * @param className - Additional CSS classes merged with the component's default classes
 * @param props - Additional props spread onto the root div (e.g., id, role, event handlers)
 * @returns A div element configured as a card container
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * Card header container with a responsive grid layout and a data-slot for card actions.
 *
 * Accepts standard div props which are spread onto the underlying element.
 *
 * @returns A `div` element serving as the card header with `data-slot="card-header"` and the component's default header classes.
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the title slot for a Card with bold, tight-leading typography.
 *
 * @returns A `div` element with `data-slot="card-title"`, default typography classes (`leading-none`, `font-semibold`), and any provided props and `className` merged.
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * Renders the card's descriptive text container.
 *
 * @param className - Additional CSS classes to merge with the component's default muted text and small-size styles
 * @returns A div element used for card descriptions
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * Renders the card's action area positioned at the end of the header grid.
 *
 * @param className - Additional CSS classes to merge with the component's default layout classes
 * @param props - Other props forwarded to the underlying div element
 * @returns A div element serving as the `data-slot="card-action"` area with default grid/alignment classes applied
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Card content container that applies horizontal padding and the `data-slot="card-content"` attribute.
 *
 * Spreads any remaining div props onto the underlying element and merges `className` with the default padding class.
 *
 * @returns The rendered card content div element
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * Card footer container that renders a styled div for a card's footer.
 *
 * @returns A `div` element serving as the card footer with `data-slot="card-footer"`, composed padding and border-top spacing classes, merged `className`, and any forwarded `div` props.
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}