import {
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
	integer,
	unique,
	index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { INT_PK_STARTS_WITH } from "./_constants";
import { Persons } from "./persons";

type Roles =
	| "elder"
	| "ministerial_servant"
	| "regular_pioneer"
	| "auxiliar_pioneer"
	| "special_pioneer"
	| "secretary"
	| "coordinator"
	| "service_overseer"
	| "group_overseer"
	| "group_auxiliar"
	| "lnm_overseer";

export const Roles = pgTable("roles", {
	id: integer("id")
		.primaryKey()
		.generatedAlwaysAsIdentity({ startWith: INT_PK_STARTS_WITH }),
	name: varchar("name", { length: 36 }).$type<Roles>().unique().notNull(),
	description: varchar("description", { length: 256 }),
});

export const Permissions = pgTable("permissions", {
	id: integer("id")
		.primaryKey()
		.generatedAlwaysAsIdentity({ startWith: INT_PK_STARTS_WITH }),
	name: text("name").unique().notNull(),
	description: text("description"),
});

export const RolesToPermissions = pgTable(
	"roles_to_permissions",
	{
		roleId: integer("role_id").references(() => Roles.id, {
			onDelete: "cascade",
		}),
		permissionId: integer("permission_id").references(() => Permissions.id, {
			onDelete: "cascade",
		}),
	},
	(t) => ({
		index_unique_record: unique().on(t.roleId, t.permissionId),
	}),
);

export const RolesToPersons = pgTable(
	"roles_to_persons",
	{
		roleId: integer("role_id").references(() => Roles.id, {
			onDelete: "cascade",
		}),
		personId: uuid("person_id").references(() => Persons.id, {
			onDelete: "cascade",
		}),
		entityType: varchar("entity_type", { length: 36 }),
		entityId: varchar("entity_id"),
		createdAt: timestamp("created_at").defaultNow(),
		startsAt: timestamp("starts_at"),
		finishesAt: timestamp("finishes_at"),
	},
	(t) => ({
		index_role_by_entity_ref: index().on(t.roleId, t.personId),
		index_entity_by_person: index().on(t.entityId, t.entityType),
		unique_role_by_person: unique()
			.on(
				t.roleId,
				t.personId,
				t.entityId,
				t.entityType,
				t.startsAt,
				t.finishesAt,
			)
			.nullsNotDistinct(),
	}),
);

export const $RolesToPersonsRelations = relations(
	RolesToPersons,
	({ one, many }) => ({
		role: one(Roles, {
			fields: [RolesToPersons.roleId],
			references: [Roles.id],
		}),
		person: one(Persons, {
			fields: [RolesToPersons.personId],
			references: [Persons.id],
		}),
	}),
);
