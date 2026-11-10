"use client";

import { Button, Spinner } from "flowbite-react";
import type { ComponentProps } from "react";

export function ActionButton({
  pending = false,
  disabled,
  children,
  ...props
}: ComponentProps<typeof Button> & { pending?: boolean }) {
  return (
    <Button {...props} disabled={disabled || pending}>
      {children}
      {pending && <Spinner size="sm" className="ms-2" />}
    </Button>
  );
}
