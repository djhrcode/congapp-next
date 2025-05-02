import type { FieldApi } from "@tanstack/react-form";
import type { Struct } from "superstruct";

export interface FormFieldComponentProps<Type = unknown, Props = {}> {
    props: Props;
    field: FieldApi<unknown, string, undefined, undefined, Type>;
}

export interface FormFieldComponent<Type = unknown> {
    (props: FormFieldComponentProps<Type>): React.ReactNode;
}

export interface FormFieldRecord<Type> {
    struct?: Struct<Type, any>;
    Component: FormFieldComponent<Type>;
}

export interface FormFieldRegistry {
    [symbol: string | symbol]: FormFieldRecord<any>;
}

export class FieldSymbol<Type = unknown, Props = {}> {
    public Props: FormFieldComponentProps<Type, Props> =
        {} as FormFieldComponentProps<Type, Props>;

    constructor(
        public name: string,
        public struct?: Struct<Type, any>,
        public type: Type = {} as Type,
        public symbol: symbol = Symbol(name)
    ) {}
}

export function field<Type = unknown, Props = {}>(
    name: string,
    struct?: Struct<Type, any>
) {
    return new FieldSymbol<Type, Props>(name, struct);
}

export function registerField<Type>(
    field: FieldSymbol<Type>,
    Component: FormFieldComponent<Type>
): FormFieldRegistry {
    return {
        [field.symbol]: {
            struct: field.struct,
            Component,
        },
    };
}
