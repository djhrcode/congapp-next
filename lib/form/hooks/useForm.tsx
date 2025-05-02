import {
  FieldApi,
  FormApi,
  useForm as useTanstackForm,
  type DeepKeys,
  type FieldApiOptions,
  type FieldValidators,
  type FormOptions,
  type ReactFormApi,
  type FieldComponent,
  FormValidateOrFn,
  FormAsyncValidateOrFn,
  FieldValidateOrFn,
  DeepValue,
  FieldAsyncValidateOrFn,
  createFormHook,
  ReactFormExtendedApi,
  useTransform,
  mergeForm,
  FormState,
  formOptions,
  createFormHookContexts,
  FormValidateFn,
  FormValidateAsyncFn,
  FieldValidateFn,
  FieldValidateAsyncFn
} from '@tanstack/react-form';

import {
  ServerValidateError,
  createServerValidate
} from '@tanstack/react-form/nextjs';
import { object, string, Struct } from 'superstruct';
import { useActionState, type ComponentProps } from 'react';
import { useField } from '@/lib/form/contexts/fields';
import type { FieldSymbol } from '@/lib/form/utils/field';
import { validate } from '@/lib/structs/utils/validate';
import { fieldValidator } from '../utils/validator';

// export useFieldContext for use in your custom components
export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

const MyTextField = ({ label }: { label: string }) => {
  return <input />;
};

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    MyTextField
  },
  formComponents: {}
});

const InputField: LabeledFieldComponent<string, { isNumeric?: boolean }> = ({
  field,
  label
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium">{label}</label>
      <input
        type="text"
        value={field.state.value ?? ''}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        className="border rounded p-2"
      />
      {field.state.meta.isTouched && field.state.meta.errors?.length > 0 && (
        <p className="text-red-500 text-sm">
          {field.state.meta.errors.join(', ')}
        </p>
      )}
    </div>
  );
};

const SignUpForm = object({
  email: string()
});

const form = useAppForm({
  defaultValues: {
    firstName: '',
    lastName: ''
  }
});

function useThisForm<
  TFormData,
  TOnMount extends undefined | FormValidateFn<TFormData>,
  TOnChange extends undefined | FormValidateFn<TFormData>,
  TOnChangeAsync extends undefined | FormValidateAsyncFn<TFormData>,
  TOnBlur extends undefined | FormValidateFn<TFormData>,
  TOnBlurAsync extends undefined | FormValidateAsyncFn<TFormData>,
  TOnSubmit extends undefined | FormValidateFn<TFormData>,
  TOnSubmitAsync extends undefined | FormValidateAsyncFn<TFormData>,
  TOnServer extends undefined | FormValidateAsyncFn<TFormData>,
  TSubmitMeta
>(struct: Struct<TFormData>) {
  const form = useAppForm<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnServer,
    never
  >({
    validators: {
      onChange: () => {
        return {
          fields: {}
        };
      }
    }
  });

  const FormField: FieldComponent<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnServer,
    never
  > = (props) => {
    const InnerFormField = form.AppField as FieldComponent<
      TFormData,
      TOnMount,
      TOnChange,
      TOnChangeAsync,
      TOnBlur,
      TOnBlurAsync,
      TOnSubmit,
      TOnSubmitAsync,
      TOnServer,
      never
    >;

    return (
      <InnerFormField
        {...props}
        validators={
          {
            ...(props.validators ?? {}),

            onChange: ({ value }) => {
              const fieldStruct = getDeepStruct(struct, props.name);

              if (fieldStruct) {
                const [error] = validate(value, fieldStruct);

                return error ? [error.message] : [];
              }

              return [];
            }
          } as ComponentProps<typeof InnerFormField>['validators']
        }
      />
    );
  };

  return {
    ...form,
    FormField
  };
}

function isObjectStruct(
  struct: Struct<any, any>
): struct is Struct<object, Record<string, Struct>> {
  return struct instanceof Struct && struct.type === 'object';
}

function isArrayStruct(
  struct: Struct<any, any>
): struct is Struct<any[], Struct[]> {
  return struct instanceof Struct && struct.type === 'array';
}

function getDeepStruct<Type>(struct: Struct<Type>, deepKey: DeepKeys<Type>) {
  if (typeof deepKey !== 'string') return;

  const deepKeys = deepKey.split('.');
  const lastIndex = deepKeys.length - 1;

  let deepSchema: Struct<any, unknown> | null = struct;

  deepKeys.every((currentKey, currentIndex) => {
    const isLast = lastIndex === currentIndex;

    if (deepSchema && isObjectStruct(deepSchema)) {
      if (currentKey in deepSchema.schema) {
        deepSchema = deepSchema.schema?.[currentKey];
      }

      return true;
    }
  });

  return deepSchema;
}

interface UseFormHookReturn<
  TFormData,
  TOnMount extends undefined | FormValidateOrFn<TFormData>,
  TOnChange extends undefined | FormValidateOrFn<TFormData>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnBlur extends undefined | FormValidateOrFn<TFormData>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnSubmit extends undefined | FormValidateOrFn<TFormData>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
  TOnServer extends undefined | FormAsyncValidateOrFn<TFormData>,
  HookFormApi extends FormApi<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnServer
  >
> {
  state: HookFormApi['state'];
  setFieldValue: HookFormApi['setFieldValue'];
  validate: HookFormApi['validate'];
  validateSync: HookFormApi['validateSync'];
  validateField: HookFormApi['validateField'];

  Subscribe: ReactFormApi<TFormData>['Subscribe'];
  Field: FormFieldComponent<TFormData>;
}

export function superstructAdapter<T>(schema: Struct<T, any>) {
  return (value: any) => {
    const [error] = validate(value, schema);
    return error ? [error.message] : [];
  };
}

// You can pass other form options here
export const formOpts = formOptions({
  defaultValues: {
    firstName: '',
    age: 0
  }
});

createServerValidate({});

const FormField: FormFieldV1 = (props) => {
  return <></>;
};

export function useForm<TFormData>(struct: Struct<TFormData, any>) {
  const adapter = superstructAdapter(struct);

  const [state, action] = useActionState<
    FormState<TFormData, any, any, any, any, any, any, any, any>
  >((formData) => {
    return {};
  });

  const form = useTanstackForm({
    defaultValues: {
      firstName: '',
      lastName: ''
    },
    validators: {
      onChange(event) {
        return {
          form: adapter(event.value)
        };
      }
    },
    onSubmit(props) {},
    transform: useTransform((baseForm) => mergeForm(baseForm, state!), [state])
  });

  <>
    <FormField form={form} name="firstName" component={InputField} />
    <FormField form={form} name="lastName" component={InputField} />
    <FormField form={form} name="firstName" component={InputField} />
  </>;

  return form;
}

type FormFieldProps<
  TFormData,
  Props,
  Form extends ReactFormExtendedApi<
    TFormData,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >,
  Name extends DeepKeys<TFormData>,
  Type extends DeepValue<TFormData, Name>,
  Component extends LabeledFieldComponent<Type, Props>
> = {
  form: Form;
  name: Name;
  component: Component;
};

interface FormFieldV1 {
  <
    TFormData,
    Name extends DeepKeys<TFormData>,
    Type extends DeepValue<TFormData, Name>,
    Component extends LabeledFieldComponent<Type, any>
  >(
    props: {
      form: ReactFormExtendedApi<
        TFormData,
        any,
        any,
        any,
        any,
        any,
        any,
        any,
        any,
        any
      >;
      name: Name;
      component: Component;
    } & (Component extends LabeledFieldComponent<Type, infer Props>
      ? Props
      : {})
  ): React.ReactNode;
}
export default InputField;
