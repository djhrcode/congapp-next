import {
	type PersonSelectDTO,
	Persons,
	Reports,
	Roles,
	RolesToPersons,
} from "db/schema";
import { db } from "db/client";
import { and, eq, isNull, type SQL, sql } from "drizzle-orm";
import { RecordsTable } from "./table";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";
import type { DeepKeys } from "@tanstack/react-form";
import justSafeGet from "just-safe-get";

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

async function queryPublishersPendingByReports(period: string) {
	const filters: SQL[] = [];

	const rowsCount = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(Persons)
		.leftJoin(
			Reports,
			and(eq(Reports.personId, Persons.id), eq(Reports.period, period)),
		)
		.where(isNull(Reports.id));

	const rowsResult = await db
		.select()
		.from(Persons)
		.limit(10)
		.leftJoin(
			Reports,
			and(eq(Reports.personId, Persons.id), eq(Reports.period, period)),
		)
		.where(isNull(Reports.id));

	const rowsGrouped = listGroupBy(
		rowsResult,
		"persons.id",
		(prevItem: PersonSelectDTO | null, row): PersonSelectDTO => ({
			...row.persons,
		}),
	);

	return {
		total: rowsCount[0].count,
		data: rowsGrouped,
	};
}

async function queryPersons(): Promise<{
	total: number;
	data: PersonRecord[];
}> {
	const { pageNumber = 1, pageSize = 10 } = {};

	const offset = (pageNumber - 1) * pageSize;

	const filters: SQL[] = [];

	const rowsCount = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(Persons);

	const rowsResult = await db
		.select()
		.from(Persons)
		.limit(10)
		.leftJoin(RolesToPersons, eq(Persons.id, RolesToPersons.personId))
		.leftJoin(Roles, eq(RolesToPersons.roleId, Roles.id));

	const rowsGrouped = listGroupBy(
		rowsResult,
		"persons.id",
		(prevItem: PersonRecord | null, row): PersonRecord => ({
			...row.persons,
			rolesToPersons: row.roles
				? [
						...(prevItem?.rolesToPersons ?? []),
						{
							roleId: row.roles.id,
							role: { id: row.roles?.id, name: row.roles?.name },
						},
					]
				: (prevItem?.rolesToPersons ?? []),
		}),
	);

	return {
		total: rowsCount[0].count,
		data: rowsGrouped,
	};
}

export default async function CustomersPage() {
	const persons = await queryPersons();
	const personsPending = await queryPublishersPendingByReports("2025-3");

	return (
		<div>
			<pre>{JSON.stringify(personsPending, null, 2)}</pre>
			<RecordsTable persons={persons.data} total={persons.total} />
		</div>
	);
}
