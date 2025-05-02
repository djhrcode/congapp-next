import {
	pgTable,
	timestamp,
	uuid,
	varchar,
	smallint,
	integer,
	uniqueIndex,
	index,
} from "drizzle-orm/pg-core";
import {
	type InferInsertModel,
	type InferSelectModel,
	relations,
} from "drizzle-orm";
import { INT_PK_STARTS_WITH } from "./_constants";
import { Persons } from "./persons";

export const Reports = pgTable(
	"reports",
	{
		id: integer("id")
			.primaryKey()
			.generatedAlwaysAsIdentity({ startWith: INT_PK_STARTS_WITH }),
		hours: smallint("hours"),
		bibleStudies: smallint("bible_studies"),
		comments: varchar("comments", { length: 256 }),
		period: varchar("period", { length: 12 }),
		serviceYear: varchar("service_year", { length: 12 }),
		personId: uuid("person_id").references(() => Persons.id, {
			onDelete: "cascade",
		}),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => ({
		unique_person_by_period: uniqueIndex("unique_person_by_period").on(
			t.period,
			t.personId,
		),
		index_by_service_year: index("index_by_service_year").on(t.serviceYear),
	}),
);

export type ReportSelectDTO = InferSelectModel<typeof Reports>;
export type ReportInsertDTO = InferInsertModel<typeof Reports>;

export const $ReportsRelations = relations(Reports, ({ one }) => ({
	person: one(Persons, {
		fields: [Reports.personId],
		references: [Persons.id],
	}),
}));
