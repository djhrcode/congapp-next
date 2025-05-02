import type { ServerAction } from "./actions";

export async function run<Params extends unknown[] = [], Response = unknown>(
	action: ServerAction<Params, Response>,
	...params: Params
): Promise<Response> {
	const response = await action(...params);

	if (response.status === "success") {
		return response.result.data;
	}

	throw new Error(`ServerActionError: ${response.error.message}`);
}
