"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface Props {
  title?: string;
  back?: boolean;
  right?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export default function Screen({ title, back, right, footer, children }: Props) {
  const router = useRouter();
  return (
    <div className="flex min-h-dvh flex-col pt-[env(safe-area-inset-top)]">
      <header className="flex h-14 items-center gap-2 px-5">
        {back && (
          <button aria-label="뒤로" onClick={() => router.back()} className="-ml-2 p-2 text-xl">
            ‹
          </button>
        )}
        <h1 className="flex-1 text-base font-semibold">{title}</h1>
        {right}
      </header>
      <main className="flex flex-1 flex-col px-5">{children}</main>
      {footer && (
        <footer className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">{footer}</footer>
      )}
    </div>
  );
}
