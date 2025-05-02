"use server";

import { createAdminSupabase } from "@/lib/auth/supabase";
import { db } from "db/client";
import { Congregations, Persons } from "db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function getRequests() {
	const queryResult = await db
		.select()
		.from(Congregations)
		.leftJoin(Persons, eq(Persons.id, Congregations.authorId));

	return queryResult.map(({ congregations, persons }) => ({
		personId: persons?.id,
		firstName: persons?.firstName,
		lastName: persons?.lastName,
		identityProviderId: persons?.identityProviderId,
		...congregations,
	}));
}

export async function approveSignUpRequest(congregationId: string) {
	const [updated] = await db
		.update(Congregations)
		.set({
			isVerified: true,
		})
		.where(eq(Congregations.id, congregationId))
		.returning({
			personId: Congregations.authorId,
		});

	if (!updated || !updated.personId)
		return {
			errors: [{ error: "Congregation not found or has author linked" }],
		};

	return sendUserInviteEmail(updated.personId);
}

/**
 * Sends invitation email if user not registered or
 * sends a signin magic link if user already registered
 */
export async function sendUserInviteEmail(userId: string) {
	const supabase = await createAdminSupabase();

	const author = await db.query.Persons.findFirst({
		where: eq(Persons.id, userId),
		with: { congregation: true },
	});

	if (!author || !author.emailAddress)
		return {
			errors: [
				{ error: "Congregation author not found or has no email address" },
			],
		};

	const origin = (await headers()).get("origin");

	console.log("author.congregation", author.congregation);
	console.log("redirectTo", `${origin}/password-reset`);

	const { isVerified = false } = author.congregation ?? {};

	if (isVerified) {
		const signInInvitation = await supabase.auth.signInWithOtp({
			email: author.emailAddress,
			options: {
				emailRedirectTo: `${origin}/password-reset`,
			},
		});

		if (signInInvitation.error)
			return { errors: [{ error: signInInvitation.error.message }] };

		return { message: "User sign in email invitation has been approved!" };
	}

	const emailInvitation = await supabase.auth.admin.inviteUserByEmail(
		author.emailAddress,
		{
			data: {
				external_id: author.id,
				first_name: author.firstName,
				last_name: author.lastName,
			},
			redirectTo: `${origin}/password-reset`,
		},
	);

	if (emailInvitation.error)
		return { errors: [{ error: emailInvitation.error.message }] };

	await db
		.update(Persons)
		.set({
			identityProviderId: emailInvitation.data.user.id,
		})
		.where(eq(Persons.id, author.id));

	return { message: "User sign up request has been approved!" };
}
