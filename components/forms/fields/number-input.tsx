'use client';

import { Input, InputControl, InputInnerPrefix } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  FieldMetadata,
  useField,
  useFormMetadata,
  useInputControl
} from '@conform-to/react';
import React from 'react';
import { FormFieldProps } from '../_types';
import { FormDescription } from '../description';
import { FormErrorMessage } from '../error';
import { FormLabel } from '../label';

interface NumberInputProps extends FormFieldProps<number> {
  placeholder?: string;
}

export function NumberInputField(props: NumberInputProps) {
  const { meta, label, placeholder } = props;
  const control = useInputControl(meta);

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <FormLabel $field={props} />
      <Input invalid={!meta.valid}>
        <InputControl
          type="number"
          id={meta.id}
          name={meta.name}
          placeholder={placeholder}
          value={control.value}
          onChange={(event) => control.change(event.target.value)}
        />
      </Input>
      <FormDescription $field={props} />
      <FormErrorMessage $field={props} />
    </div>
  );
}
