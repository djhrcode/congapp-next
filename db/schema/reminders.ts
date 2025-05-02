import { pgTable, text, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import type { ReminderStatus } from "./_types";

export const reminder = pgTable("reminders", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	schedule: jsonb("schedule").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reminderExecution = pgTable("reminder_executions", {
	id: uuid("id").defaultRandom().primaryKey(),
	status: text("status").$type<ReminderStatus>().notNull(),
	comment: text("comment"),
	reminderId: uuid("reminder_id").references(() => reminder.id, {
		onDelete: "cascade",
	}),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
