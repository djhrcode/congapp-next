import * as lib from "superstruct";

export interface Refiner<Type> {
    (struct: lib.Struct<Type>): lib.Struct<Type>;
}

export interface RefinerFactory<Type, Params extends any[]> {
    (...params: Params): Refiner<Type>;
}

export function refiner<Type, Params extends any[]>(
    name: string,
    refine: (value: Type, ...params: Params) => lib.Result
): RefinerFactory<Type, Params> {
    return (...params: Params) =>
        (struct: lib.Struct<Type>) => {
            return lib.refine(struct, name, (value) =>
                refine(value, ...params)
            );
        };
}
