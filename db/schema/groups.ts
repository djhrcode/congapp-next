import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { type InferInsertModel, type InferSelectModel, relations } from "drizzle-orm";
import { Congregations } from "./congregations";
import { Persons } from "./persons";

/**
 * Types definitions
 */
export interface GroupSelectDTO extends InferSelectModel<typeof Groups> {}

export interface GroupInsertDTO extends InferInsertModel<typeof Groups> {}

/**
 * Database models
 */
export const Groups = pgTable("groups", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	congregationId: text("congregation_id").references(() => Congregations.id, {
		onDelete: "cascade",
	}),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const $GroupsRelations = relations(Groups, ({ many }) => ({
	persons: many(Persons),
}));
