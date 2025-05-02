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
  useField,
  useFormMetadata,
  useInputControl
} from '@conform-to/react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cva, VariantProps } from 'class-variance-authority';

import React from 'react';

interface OptionItem {
  label: string;
  key?: string;
  value: string;
}

interface SegmentControlFieldProps {
  meta: FieldMetadata<string>;
  placeholder?: string;
  label: string;
  options: Array<OptionItem>;
}

const segmentControlVariants = cva(
  'grid grid-cols-3 [&_button:first-of-type]:rounded-r-none [&_button:last-of-type]:rounded-l-none [&_:not(button:first-of-type)]:w-[calc(100%+1px)] [&_:not(button:first-of-type)]:-left-[1px] [&_:not(button:first-of-type):not(button:last-of-type)]:rounded-none focus-within:ring-2 focus-within:ring-primary/10 rounded-md',
  {
    variants: {
      items: {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4'
      }
    }
  }
);

type SegmentControlItems = VariantProps<typeof segmentControlVariants>['items'];

interface SegmentControlProps
  extends React.ComponentPropsWithRef<typeof RadioGroupPrimitive.Root>,
    VariantProps<typeof segmentControlVariants> {}

const SegmentControl = ({
  ref,
  className,
  children,
  items,
  ...props
}: SegmentControlProps) => {
  return (
    <RadioGroupPrimitive.Root
      className={segmentControlVariants({ items, className })}
      {...props}
      ref={ref}
    >
      {children}
    </RadioGroupPrimitive.Root>
  );
};

const SegmentControlItem = ({
  ref,
  className,
  children,
  ...props
}: React.ComponentPropsWithRef<typeof RadioGroupPrimitive.Item>) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn('flex', className)}
      asChild
      {...props}
    >
      <Button
        variant="outline"
        className="relative aria-checked:z-10"
        selectable
      >
        {children}
      </Button>
    </RadioGroupPrimitive.Item>
  );
};

export function SegmentControlField({
  meta,
  label,
  options,
  placeholder
}: SegmentControlFieldProps) {
  const control = useInputControl(meta);

  if (options.length > 4) {
    throw new Error('Segment control must be used with maximium 4 items');
  }

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label
        htmlFor={meta.id}
        className={cn(!meta.valid && 'text-destructive', 'font-semibold')}
      >
        {label}
      </Label>
      <SegmentControl
        items={options.length as SegmentControlItems}
        onValueChange={control.change}
        value={control.value}
      >
        {options.map(({ key, value, label }) => (
          <SegmentControlItem key={key ?? value} value={label}>
            {label}
          </SegmentControlItem>
        ))}
      </SegmentControl>
    </div>
  );
}
