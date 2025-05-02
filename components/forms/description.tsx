import React from 'react';
import { FormFieldMetadata } from './_types';
import { cn } from '@/lib/utils';

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & FormFieldMetadata
>(({ className, children, $field, ...props }, ref) => {
  const { valid = false } = $field?.meta ?? {};
  const description = $field?.description ?? children;

  if (!valid || !description) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={$field?.meta.descriptionId}
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    >
      {description}
    </p>
  );
});

FormDescription.displayName = 'FormDescription';
