import * as lib from "superstruct";
import type { ObjectSchema, ObjectType } from "superstruct/dist/utils";

type Nullable<T> = T | null;

type ErrorParser = (error: { key: any; value: unknown; type: string }) => string

type Refiner<Type> = (struct: lib.Struct<Type>) => lib.Struct<Type>

function refiner<Type, Params extends any[]>(
	name: string,
	refine: (value: Type, ...params: Params) => lib.Result,
) {
	return (...params: Params) =>
		(struct: lib.Struct<Type>) => {
			return lib.refine(struct, name, (value) => refine(value, ...params));
		};
}

interface FieldOptions<
	Type,
	IsOptional extends boolean,
	IsNullable extends boolean,
> {
	optional?: IsOptional;
	nullable?: IsNullable;
	defaulted?: Type | true;
}

const dataTypes = {
	string: {
		defaulted: "",
	},
	number: {
		defaulted: 0,
	},
	boolean: {
		defaulted: false,
	},
};

type If<Condition, Type> = Condition extends true ? Type : never;

type FieldStructResult<Type, IsOptional, IsNullable> = lib.Struct<
	Exclude<Type | If<IsOptional, undefined> | If<IsNullable, null>, never>
>;

function field<
	Type,
	IsOptional extends boolean,
	IsNullable extends boolean = false,
>(
	struct: lib.Struct<Type>,
	options?: {
		label?: string;
		optional?: IsOptional;
		nullable?: IsNullable;
		defaulted?: Type | true;
	},
): FieldStructResult<Type, IsOptional, IsNullable> {
	const {
		defaulted = false,
		optional = false,
		nullable = false,
	} = options ?? {};
	const { type } = struct;

	let result: lib.Struct<any> = struct;

	if (options?.defaulted) result = lib.defaulted(result, options.defaulted);

	if (options?.optional) result = lib.optional(result);

	if (!defaulted) {
		if (type === "object") result = lib.defaulted(result, {});

		if (type === "array") result = lib.defaulted(result, []);

		if (type !== "object" && type !== "array")
			result = lib.defaulted(
				lib.optional(result),
				type in dataTypes
					? dataTypes[type as keyof typeof dataTypes].defaulted
					: null,
			);
	}

	return result as FieldStructResult<Type, IsOptional, IsNullable>;
}

const $$getDefaultState = Symbol();

function getDefaultState<Type>(struct: lib.Struct<Type>): Type {
	if ($$getDefaultState in struct)
		return (struct as any)[$$getDefaultState]() as Type;

	throw new Error();
}

function isObjectStruct(
	struct: unknown,
): struct is lib.Struct<ObjectType<ObjectSchema>, ObjectSchema> {
	return struct instanceof lib.Struct && struct.type === "object";
}

function isArrayStruct(struct: unknown): struct is lib.Struct<any[]> {
	return (
		struct instanceof lib.Struct &&
		struct.schema instanceof lib.Struct &&
		struct.type === "array"
	);
}

function makeDefaultSchema<Schema>(
	struct: lib.Struct<Schema>,
): lib.Struct<Schema> {
	if (isObjectStruct(struct)) {
		const newSchema: ObjectSchema = {};

		Object.entries(struct.schema).forEach(([key, innerStruct]) => {
			Object.defineProperty(newSchema, key, {
				enumerable: true,
				value: makeDefaultSchema(innerStruct),
			});
		});

		const newStruct = lib.object(newSchema);

		return lib.defaulted(lib.object(newSchema), () =>
			newStruct.create({}),
		) as unknown as lib.Struct<Schema, Schema>;
	}

	if (isArrayStruct(struct)) {
		return lib.defaulted(struct, []) as unknown as lib.Struct<Schema>;
	}

	return lib.defaulted(struct, undefined);
}

function form<Schema extends ObjectSchema>(
	schema: Schema,
): lib.Struct<ObjectType<Schema>, Schema> {
	const schemaStruct = lib.object(schema);
	const defaultStruct = makeDefaultSchema(schemaStruct);

	Object.defineProperty(schemaStruct, $$getDefaultState, {
		value(): lib.Infer<lib.Struct<ObjectType<Schema>, Schema>> {
			return makeDefaultSchema(schemaStruct).create({});
		},
	});

	return schemaStruct;
}

const dataSchema = lib.defaulted(
	lib.object({
		address: lib.defaulted(
			lib.object({
				street1: lib.defaulted(lib.string(), ""),
				street2: lib.defaulted(lib.string(), ""),
			}),
			{},
		),
	}),
	{},
);

console.log("TESTING", dataSchema.create({}));

const formSchema = form({
	name: field(lib.string(), { label: "Nombre" }),
	roles: field(lib.array(lib.string()), { label: "Privilegios" }),

	address: form({
		street1: field(lib.string()),
		street2: field(lib.string()),

		location: form({
			country: field(lib.string()),
			state: field(lib.string()),
			zipCode: field(lib.string()),
		}),
	}),
});

console.log("FORM", getDefaultState(formSchema));

const positive = refiner("positive", (value: number) => {
	return value >= 0 ? true : "Must be a positive number";
});

const gt = refiner("gt", (value: number, min: number) => {
	return value >= min
		? true
		: { params: { min }, message: `Must be a number greater than ${min}` };
});

const lt = refiner("lt", (value: number, max: number) => {
	return value <= max
		? true
		: { params: { max }, message: `Must be a number lesser than ${max}` };
});

type RulesRefiner = 
	<Type>(struct: lib.Struct<Type>, ...rules: Refiner<Type>[]) => void

function rules<Type>(
	struct: lib.Struct<Type>,
	...refiners: Refiner<Type>[]
): lib.Struct<Type> {
	return (
		refiners.reduce(
			(carry, refiner) => {
				if (carry === null) return refiner(struct);

				return refiner(carry);
			},
			null as Nullable<lib.Struct<Type>>,
		) ?? struct
	);
}

const sample = lib.object({
	amount: rules(lib.number(), positive(), gt(5), lt(10)),
});

console.log(
	"validation",
	sample
		.validate({
			amount: -5,
		})?.[0]
		?.failures(),
);

export function parseFailure(failure: lib.Failure): lib.Failure {
	const { type, refinement, value, explanation } = failure;

	if (value === undefined)
		return {
			...failure,
			message: "The property is required",
		};

	if (type === "never")
		return {
			...failure,
			message: "Received an unexpected property",
		};

	return {
		...failure,
		message: `Invalid format. Expected to receive ${type} ${refinement} ${explanation}`,
	};
}

export function parseStructError(error: lib.StructError): lib.StructError {
	const { failures } = error;

	const failure = parseFailure(error);

	error.message = failure.message;
	error.failures = () => failures().map(parseFailure);

	return error;
}

interface ValidateOptions {
	coerce?: boolean;
	mask?: boolean;
	message?: string;
}

type ValidationResult<Type> = [undefined, Type] | [lib.StructError, undefined];

export function validate<Type>(
	value: unknown,
	struct: lib.Struct<Type>,
	options?: ValidateOptions,
): ValidationResult<Type> {
	const [error, result] = lib.validate(value, struct, options);

	if (error) return [parseStructError(error), result];

	return [undefined, result];
}
