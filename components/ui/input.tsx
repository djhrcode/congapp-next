'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';

export interface InputProps extends React.InputHTMLAttributes<HTMLDivElement> {}

export interface InputControlProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const inputWrapperCx = cva(
  [
    'flex h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground',
    'focus-within:outline-none focus-within:border-1 focus-within:ring-2 focus-within:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 '
  ],
  {
    variants: {
      invalid: {
        true: 'focus-within:border-red-500 focus-within:bg-red-50',
        false: 'focus-within:border-primary focus-within:bg-primary/5'
      }
    }
  }
);
const inputControlCx = cva(
  [
    'flex h-full w-full border-none px-3 py-2 text-sm bg-transparent',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50 '
  ],
  {
    variants: {}
  }
);

function useMergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): (node: T | null) => void {
  return React.useCallback(
    (node: T | null) => {
      refs.forEach((ref) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref && typeof ref === 'object') {
          (ref as React.MutableRefObject<T | null>).current = node;
        }
      });
    },
    [refs]
  );
}

const Input = React.forwardRef<
  HTMLDivElement,
  InputProps & VariantProps<typeof inputWrapperCx>
>(function Input(
  { className, type, invalid = false, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={inputWrapperCx({ className, invalid })}
      {...props}
    >
      {children}
    </div>
  );
});

export const InputControl = React.forwardRef<
  HTMLInputElement,
  InputControlProps & VariantProps<typeof inputWrapperCx>
>(function InputControl({ className, type, ...props }, ref) {
  const innerRef = React.useRef<HTMLInputElement>(null);
  const inputRef = useMergeRefs(ref, innerRef);

  return (
    <input
      ref={inputRef}
      type={type}
      className={inputControlCx({ className })}
      {...props}
    />
  );
});

export const InputInnerPrefix = React.forwardRef<
  HTMLDivElement,
  InputProps & VariantProps<typeof inputWrapperCx>
>(function InputControl({ className, type, ...props }, ref) {
  return (
    <div
      ref={ref}
      className="text-muted-foreground pl-3 py-2 h-full flex text-sm items-center"
      {...props}
    />
  );
});

export const InputInnerSuffix = React.forwardRef<
  HTMLDivElement,
  InputProps & VariantProps<typeof inputWrapperCx>
>(function InputControl({ className, type, ...props }, ref) {
  return (
    <div
      ref={ref}
      className="text-muted-foreground pr-3 py-2 h-full flex text-sm items-center"
      {...props}
    />
  );
});

export { Input };
