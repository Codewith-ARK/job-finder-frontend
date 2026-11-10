"use client";

import { Button } from "flowbite-react";
import Link from "next/link";
import type { ComponentProps } from "react";

type LinkButtonProps = Omit<ComponentProps<typeof Button>, "as" | "href"> & {
  href: string;
};

export function LinkButton({ href, ...props }: LinkButtonProps) {
  return <Button as={Link} href={href} {...props} />;
}
