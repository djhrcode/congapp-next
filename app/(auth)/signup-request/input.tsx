'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  FieldMetadata,
  useField,
  useFormMetadata,
  useInputControl
} from '@conform-to/react';
import React from 'react';

interface InputProps {
  meta: FieldMetadata<string>;
  label: string;
}

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

export function InputField({ meta, label }: InputProps) {
  const control = useInputControl(meta);

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label
        htmlFor={meta.id}
        className={cn(!meta.valid && 'text-destructive', 'font-semibold')}
      >
        {label}
      </Label>
      <Input
        id={meta.id}
        name={meta.name}
        value={control.value}
        onChange={(event) => control.change(event.target.value)}
      />
      {!meta.valid && (
        <FormDescription
          id={meta.descriptionId}
          className={cn(!meta.valid && 'text-destructive')}
        >
          {meta.errors?.join(',')}
        </FormDescription>
      )}
    </div>
  );
}
