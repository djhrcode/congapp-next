import { FieldApi } from '@tanstack/react-form';

export type LabeledFieldComponent<Type, Props = {}> = React.FC<
  {
    label: string;
    field: FieldApi<
      any,
      any,
      Type,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
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
  } & Props
>;
