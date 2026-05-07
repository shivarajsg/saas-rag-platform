"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast",
          title: "toast-title",
          description: "toast-description",
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
