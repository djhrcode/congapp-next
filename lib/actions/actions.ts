import "server-only";

export type ServerAction<
	Params extends unknown[] = [],
	Response = unknown,
> = (...params: Params) => Promise<ServerActionResult<Response>>

export interface ServerActionError {
	code: string;
	message: string;
}

type ServerActionResult<Response = unknown, Error = ServerActionError> =
	| {
			status: "success";
			result: { data: Response; message: string };
			error: undefined;
	  }
	| {
			status: "error";
			result?: { data: Response; message: string };
			error: Error;
	  };

function asActionError(error: unknown): ServerActionError {
	if (error instanceof Error) {
		return {
			code: error.name,
			message: error.message,
		};
	}

	return {
		code: "unknown",
		message:
			"Ha ocurrido un error inesperado. Estamos trabajando para corregirlo",
	};
}

export function asAction<Response, Params extends unknown[]>(
	action: (...params: Params) => Promise<Response>,
	message: string,
): ServerAction<Params, Response> {
	return async (...params: Params): Promise<ServerActionResult<Response>> => {
		try {
			const response = await action(...params);

			return {
				status: "success",
				result: { data: response, message },
				error: undefined,
			};
		} catch (error) {
			return {
				status: "error",
				result: undefined,
				error: asActionError(error),
			};
		}
	};
}
