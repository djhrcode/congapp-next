import { validate } from '@/lib/structs/utils/validate';
import { Struct } from 'superstruct';
import {
  FieldValidateFn,
  FormValidateFn,
  FormValidator
} from '@tanstack/react-form';

export function fieldValidator<T>(
  schema: Struct<T, any>
): FieldValidateFn<any, any, T> {
  return ({ value }) => {
    const [error] = validate(value, schema);
    return error ? [error.message] : [];
  };
}

export function formValidator<T>(schema: Struct<T, any>): FormValidateFn<T> {
  return ({ value }) => {
    const [error] = validate(value, schema);

    return {
      fields: Object.fromEntries(
        error?.failures().map((failure) => [failure.key, failure.value]) ?? []
      ),
      form: error ? [error.message] : []
    };
  };
}
