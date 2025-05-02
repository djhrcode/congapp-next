import {
	pgTable,
	text,
	boolean,
	timestamp,
	jsonb,
	uuid,
	varchar,
	date,
} from "drizzle-orm/pg-core";
import {
	type InferInsertModel,
	type InferSelectModel,
	relations,
} from "drizzle-orm";
import type { $PersonAddress, Gender } from "./_types";
import { Groups } from "./groups";
import { Congregations } from "./congregations";
import { Reports } from "./reports";
import { Permissions, Roles, RolesToPersons } from "./roles";

/**
 * Types definitions
 */
export interface PersonSelectDTO extends InferSelectModel<typeof Persons> {}

export interface PersonInsertDTO extends InferInsertModel<typeof Persons> {}

/**
 * Database models
 */
export const Persons = pgTable("persons", {
	id: uuid("id").defaultRandom().primaryKey(),
	identityProviderId: text("identity_provider_id").unique(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	gender: text("gender").$type<Gender>().default("Male"),
	emailAddress: text("email_address"),
	phoneNumber: text("phone_number"),
	address: jsonb("address").$type<$PersonAddress>(),
	birthDate: date("birth_date"),
	inactiveDate: date("inactive_date"),
	baptismDate: date("baptism_date"),
	publisherDate: date("publisher_date"),
	groupId: uuid("group_id").references(() => Groups.id, {
		onDelete: "set null",
	}),
	congregationId: varchar("congregation_id").references(
		() => Congregations.id,
		{
			onDelete: "cascade",
		},
	),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	isSchoolStudent: boolean("is_school_student").default(false),
	isInactive: boolean("is_inactive").default(false),
	isIrregular: boolean("is_irregular").default(false),
	isExemplary: boolean("is_exemplary").default(false),
});

export const $PersonRelations = relations(Persons, ({ one, many }) => ({
	congregation: one(Congregations, {
		fields: [Persons.congregationId],
		references: [Congregations.id],
	}),
	reports: many(Reports),
	group: one(Groups, {
		fields: [Persons.groupId],
		references: [Groups.id],
	}),
	roles: many(Roles),
	permissions: many(Permissions),
	rolesToPersons: many(RolesToPersons),
}));
