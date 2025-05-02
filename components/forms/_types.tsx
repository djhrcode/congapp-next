import { FieldMetadata } from '@conform-to/react';

export interface FormFieldProps<Type = any> {
  optional?: boolean;
  label: string;
  description?: string;
  meta: FieldMetadata<Type>;
}

export interface FormFieldMetadata {
  $field?: FormFieldProps;
}
