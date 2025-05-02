"use server";
import { db } from "db/client";
import { Congregations, Persons } from "db/schema";

export async function submitSignUpRequest(form: FormData) {
	const [{ personId }] = await db
		.insert(Persons)
		.values({
			firstName: form.get("firstName") as string,
			lastName: form.get("lastName") as string,
			emailAddress: form.get("emailAddress") as string,
		})
		.returning({
			personId: Persons.id,
		});

	await db.insert(Congregations).values({
		id: form.get("congregationNumber") as string,
		name: form.get("congregationName") as string,
		authorId: personId,
	});
}
