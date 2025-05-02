'use client';

import { Input, InputControl, InputInnerPrefix } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  FieldMetadata,
  getInputProps,
  useField,
  useFormMetadata,
  useInputControl
} from '@conform-to/react';
import { FormFieldProps } from '../_types';
import { FormDescription } from '../description';
import { FormLabel } from '../label';
import { Checkbox } from '@/components/ui/checkbox';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

interface ConfirmProps extends FormFieldProps<boolean> {
  placeholder?: string;
  disabled?: boolean;
}

const confirmWrapperVariant = cva(
  'group flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-background text-left focus-visible:ring-2 focus-visible:ring-primary/10 focus-within:outline-none',
  {
    variants: {
      color: {
        primary: 'aria-checked:border-primary aria-checked:focus-visible:ring-4'
      },
      disabled: {
        true: 'border-muted bg-muted text-muted-foreground'
      }
    },
    defaultVariants: {
      color: 'primary'
    }
  }
);

const Confirm = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, disabled, children, ...props }, ref) => (
  <CheckboxPrimitive.Root ref={ref} disabled={disabled} asChild {...props}>
    <button
      className={confirmWrapperVariant({
        disabled,
        className
      })}
    >
      <div className="h-4 w-4 shrink-0 rounded-[4px] border border-primary ring-offset-background group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-disabled:cursor-not-allowed group-disabled:opacity-50 group-aria-checked:bg-primary group-aria-checked:text-primary-foreground">
        <CheckboxPrimitive.Indicator
          className={cn('flex items-center justify-center text-current')}
        >
          <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
      </div>
      {children}
    </button>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export function ConfirmField(props: ConfirmProps) {
  const { meta, disabled } = props;
  const checkboxProps = getInputProps(meta, {
    type: 'checkbox',
    value: meta.value
  });

  return (
    <Confirm {...checkboxProps} disabled={disabled} type="button">
      <div className="space-y-1 leading-none">
        <FormLabel $field={props} />
        <FormDescription $field={props} />
      </div>
    </Confirm>
  );
}
