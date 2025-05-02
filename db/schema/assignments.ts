import {
	pgTable,
	text,
	timestamp,
	uuid,
	integer,
	unique,
	date,
} from "drizzle-orm/pg-core";
import type { $Assignments, $AssignmentsScopes } from "./_types";
import { INT_PK_STARTS_WITH } from "./_constants";
import { Persons } from "./persons";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

/**
 * Types definitions
 */
export interface AssignmentSelectDTO
	extends InferSelectModel<typeof Assignments> {}

export interface AssignmentInsertDTO
	extends InferInsertModel<typeof Assignments> {}

/**
 * Database models
 */
export const Departments = pgTable("departments", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").unique().notNull(),
});

export const Assignments = pgTable("assignments", {
	id: integer("id")
		.primaryKey()
		.generatedAlwaysAsIdentity({ startWith: INT_PK_STARTS_WITH }),
	name: text("name").$type<$Assignments>().unique().notNull(),
	description: text("description"),
});

export const AssignmentsScopes = pgTable("assignments_scopes", {
	id: integer("id")
		.primaryKey()
		.generatedAlwaysAsIdentity({ startWith: INT_PK_STARTS_WITH }),
	name: text("name").$type<$AssignmentsScopes>().unique().notNull(),
	description: text("description"),
});

export const AssignmentsToPersons = pgTable(
	"assignments_to_persons",
	{
		assignmentDate: date("assignment_date"),
		assignmentId: integer("assignment_id").references(() => Assignments.id, {
			onDelete: "cascade",
		}),
		personId: uuid("person_id").references(() => Persons.id, {
			onDelete: "cascade",
		}),
		scopeId: integer("scope_id").references(() => AssignmentsScopes.id, {
			onDelete: "cascade",
		}),
		createdAt: timestamp("created_at").defaultNow(),
	},
	(t) => ({
		unique_assignment_by_person: unique()
			.on(t.assignmentDate, t.assignmentId, t.personId, t.scopeId)
			.nullsNotDistinct(),
	}),
);
