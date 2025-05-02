'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavItem({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={clsx(
        'flex h-9 w-full items-center justify-start px-4 rounded-sm text-muted-foreground transition-colors hover:text-foreground text-sm',
        {
          'bg-accent text-black': pathname === href
        }
      )}
    >
      {children}
    </Link>
  );
}
