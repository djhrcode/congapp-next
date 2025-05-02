'use client';

import { format, toDate } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

import { Input, InputControl, InputInnerPrefix } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  FieldMetadata,
  useField,
  useFormMetadata,
  useInputControl
} from '@conform-to/react';
import React, { useMemo } from 'react';
import { FormFieldProps } from '../_types';
import { FormDescription } from '../description';
import { FormErrorMessage } from '../error';
import { FormLabel } from '../label';

interface DatePickerProps extends FormFieldProps<Date> {
  disabled?: boolean;
  placeholder?: string;
}

export function DatePickerField(props: DatePickerProps) {
  const { meta, placeholder, disabled = false } = props;
  const control = useInputControl(meta);

  const date = useMemo(
    () => (control.value ? toDate(control.value) : undefined),
    [control.value]
  );

  return (
    <div className="grid w-full items-center gap-1.5">
      <FormLabel $field={props} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            variant="outline"
            focusable
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>Selecciona una fecha...</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => control.change(date?.toISOString())}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FormDescription $field={props} />
      <FormErrorMessage $field={props} />
    </div>
  );

  return (
    <Input invalid={!meta.valid}>
      <InputControl
        id={meta.id}
        name={meta.name}
        placeholder={placeholder}
        value={control.value}
        onChange={(event) => control.change(event.target.value)}
      />
    </Input>
  );
}
