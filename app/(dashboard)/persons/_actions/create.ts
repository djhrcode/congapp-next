"use server";
import {
	type PersonInsertDTO,
	type PersonSelectDTO,
	Persons,
	type ReportInsertDTO,
	Reports,
	type RoleInsertDTO,
	RolesToPersons,
} from "db/schema";
import { db } from "db/client";
import { and, type SQL, sql } from "drizzle-orm";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";
import type { DeepKeys } from "@tanstack/react-form";
import justSafeGet from "just-safe-get";
import { asAction } from "@/lib/actions/actions";

export type QueryPersonsResult = ReturnType<
	typeof queryPersons
> extends Promise<infer Return>
	? Return
	: ReturnType<typeof queryPersons>;

async function paginated<Config extends TableConfig>(
	table: PgTableWithColumns<Config>,
	config: {
		pageSize: number;
		pageNumber: number;
	},
	filters?: (table: PgTableWithColumns<Config>) => SQL[],
) {
	const { pageNumber = 1, pageSize = 10 } = config;

	const offset = (pageNumber - 1) * pageSize;
	const wheres = filters?.(table) ?? [];

	const hasFilters = wheres.length > 0;

	const [data, total] = await Promise.all([
		hasFilters
			? db
					.select()
					.from(table)
					.where(and(...wheres))
					.limit(pageSize)
					.offset(offset)
			: db.select().from(table).limit(pageSize).offset(offset),
		hasFilters
			? db
					.select({ count: sql<number>`COUNT(*)` })
					.from(Persons)
					.where(and(...wheres))
					.then((r) => r[0].count)
			: db
					.select({ count: sql<number>`COUNT(*)` })
					.from(Persons)
					.then((r) => r[0].count),
	]);

	return {
		data,
		pageNumber,
		pageSize,
		total: total,
		totalPages: Math.ceil(total / pageSize),
	};
}

interface PersonRecord extends PersonSelectDTO {
	rolesToPersons: Array<{ roleId: number; role: { id: number; name: string } }>;
}

function listGroupBy<Item, Result>(
	list: Array<Item>,
	indexBy: DeepKeys<Item>,
	factory: (prevItem: null | Result, item: Item) => Result,
): Result[] {
	return Object.values(
		list.reduce(
			(indexed, item) => {
				const index = justSafeGet(item as {}, indexBy as string);

				return {
					...indexed,
					[index]: factory(indexed[index] ?? null, item),
				};
			},
			{} as Record<string, Result>,
		),
	);
}

interface CreatePersonData extends PersonInsertDTO {}

interface CreatePersonWithRelations extends CreatePersonData {
	reports?: ReportInsertDTO[];
	roles?: RoleInsertDTO & { id: number }[];
}

export const createPersonAction = asAction(async function CreatePersonAction(
	person: CreatePersonWithRelations,
) {
	const [personCreated] = await db
		.insert(Persons)
		.values({ ...person })
		.returning({
			id: Persons.id,
			firstName: Persons.firstName,
			lastName: Persons.lastName,
		});

	if (person.reports?.length) {
		await db.insert(Reports).values(person.reports);
	}

	if (person.roles?.length) {
		await db.insert(RolesToPersons).values(
			person.roles.map((role) => ({
				roleId: role.id,
				personId: personCreated.id,
			})),
		);
	}

	return {
		created: personCreated,
	};
}, "Se ha creado el registro de persona con éxito");
