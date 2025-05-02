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
import React from 'react';
import { FormFieldProps } from '../_types';
import { FormDescription } from '../description';
import { FormErrorMessage } from '../error';
import { FormLabel } from '../label';
import { Textarea } from '@/components/ui/textarea';

interface TextareaInputProps extends FormFieldProps<string> {
  placeholder?: string;
}

export function TextareaInputField(props: TextareaInputProps) {
  const { meta, placeholder } = props;
  const control = useInputControl(meta);

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <FormLabel $field={props} />
      <Textarea {...getInputProps(meta, { type: 'text' })} />
      <FormDescription $field={props} />
      <FormErrorMessage $field={props} />
    </div>
  );
}
