'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  FieldMetadata,
  useField,
  useFormMetadata,
  useInputControl
} from '@conform-to/react';
import React from 'react';

interface SelectProps {
  meta: FieldMetadata<string>;
  placeholder?: string;
  label: string;
  options: Array<{ label: string; key?: string; value: string }>;
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

export function SelectField({
  meta,
  label,
  options,
  placeholder
}: SelectProps) {
  const control = useInputControl(meta);

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label
        htmlFor={meta.id}
        className={cn(!meta.valid && 'text-destructive', 'font-semibold')}
      >
        {label}
      </Label>
      <Select onValueChange={control.change} value={control.value}>
        <SelectTrigger onBlur={control.blur} onFocus={control.focus}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map(({ key, value, label }) => (
            <SelectItem key={key ?? value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
