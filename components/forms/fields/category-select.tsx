'use client';

import { Button } from '@/components/ui/button';
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
  getInputProps,
  useField,
  useFormMetadata,
  useInputControl
} from '@conform-to/react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva, VariantProps } from 'class-variance-authority';

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { FormDescription } from '../description';

interface OptionItem {
  label: string;
  key?: string;
  value: string;
}

interface CategorySelectFieldProps {
  meta: FieldMetadata<string | string[]>;
  description?: string;
  placeholder?: string;
  label: string;
  options: Array<OptionItem>;
}

interface CategorySelectProps extends React.ComponentPropsWithRef<'div'> {}

const CategorySelect = ({
  ref,
  className,
  children,
  ...props
}: CategorySelectProps) => {
  return (
    <div
      ref={ref}
      className="flex gap-2 flex-wrap border p-2 rounded-md mt-2"
      {...props}
    >
      {children}
    </div>
  );
};

const CategorySelectItem = ({
  ref,
  className,
  children,
  checked,
  ...props
}: React.ComponentPropsWithRef<typeof CheckboxPrimitive.Root>) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn('flex', className)}
      asChild
      {...props}
    >
      <Badge variant="outline" className="cursor-pointer">
        {checked && <Check className="size-4 mr-2" />}
        {children}
      </Badge>
    </CheckboxPrimitive.Root>
  );
};

export function CategorySelectField(props: CategorySelectFieldProps) {
  const { meta, label, options, placeholder } = props;

  const selected = useMemo(
    () => new Set(typeof meta.value === 'string' ? [meta.value] : meta.value),
    [meta.value]
  );

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label
        htmlFor={meta.id}
        className={cn(!meta.valid && 'text-destructive', 'font-semibold')}
      >
        {label}
      </Label>
      <FormDescription $field={props} />
      <CategorySelect>
        {options.map(({ key, value, label }) => (
          <CategorySelectItem
            {...getInputProps(meta, {
              type: 'checkbox',
              value: key ?? value
            })}
            type="button"
            checked={selected.has(value)}
          >
            {label}
          </CategorySelectItem>
        ))}
      </CategorySelect>
    </div>
  );
}
