import * as LabelPrimitive from '@radix-ui/react-label';
import { FormFieldMetadata } from './_types';
import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';

export const FormLabel = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & FormFieldMetadata
>(({ className, $field, children, ...props }, ref) => {
  const { valid = true } = $field?.meta ?? {};
  const contentChild = children ?? $field?.label;

  return (
    <Label
      ref={ref}
      className={cn(!valid && 'text-destructive', className)}
      htmlFor={$field?.meta.id}
      {...props}
    >
      {contentChild}
      {contentChild && $field?.optional && (
        <span className="pl-1 text-muted-foreground font-light">
          (opcional)
        </span>
      )}
    </Label>
  );
});
FormLabel.displayName = 'FormLabel';
