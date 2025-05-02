import React from 'react';
import { FormFieldMetadata } from './_types';
import { cn } from '@/lib/utils';

export const FormErrorMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & FormFieldMetadata
>(({ className, $field, children, ...props }, ref) => {
  const { valid = false } = $field?.meta ?? {};
  const message = $field?.meta.errors?.at(0) ?? children;

  if (valid || !message) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={$field?.meta.errorId}
      className={cn('text-xs text-destructive', className)}
      {...props}
    >
      {message}
    </p>
  );
});
FormErrorMessage.displayName = 'FormErrorMessage';
