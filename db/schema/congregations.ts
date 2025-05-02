import {
	pgTable,
	pgEnum,
	text,
	boolean,
	timestamp,
	uuid,
	varchar,
	smallint,
	integer,
	uniqueIndex,
	date,
} from "drizzle-orm/pg-core";
import {
	type InferInsertModel,
	type InferSelectModel,
	relations,
} from "drizzle-orm";
import { INT_PK_STARTS_WITH } from "./_constants";

/**
 * Types definitions
 */
export interface CongregationSelectDTO
	extends InferSelectModel<typeof Congregations> {}

export interface CongregationInsertDTO
	extends InferInsertModel<typeof Congregations> {}

/**
 * Database models
 */
export const Congregations = pgTable("congregations", {
	id: varchar("id", { length: 36 }).primaryKey(),
	name: text("name").notNull(),
	isVerified: boolean("is_verified").default(false),
	authorId: uuid("author_id"),
});

export const meetingsTypeEnum = pgEnum("meeting_type", [
	"midweek",
	"weekend",
	"memorial",
]);

export const CongregationAttendanceReports = pgTable(
	"congregation_attendance_reports",
	{
		id: integer("id")
			.primaryKey()
			.generatedAlwaysAsIdentity({ startWith: INT_PK_STARTS_WITH }),
		virtualAttendance: smallint("virtual_attendance"),
		inPersonAttendance: smallint("inperson_attendance"),
		meetingType: meetingsTypeEnum("meeting_type"),
		congregationId: varchar("congregation_id").references(
			() => Congregations.id,
			{
				onDelete: "cascade",
			},
		),
		meetingDate: date("meeting_date"),
	},

	(t) => ({
		unique_attendance_report_by_cong: uniqueIndex(
			"unique_attendance_report_by_cong",
		).on(t.meetingDate, t.meetingType, t.congregationId),
	}),
);

export const $CongregationAttendanceReportsRelations = relations(
	CongregationAttendanceReports,
	({ one }) => ({
		congregation: one(Congregations, {
			fields: [CongregationAttendanceReports.congregationId],
			references: [Congregations.id],
		}),
	}),
);

export const CongregationMonthlyReports = pgTable(
	"congregation_monthly_reports",
	{
		id: integer("id")
			.primaryKey()
			.generatedAlwaysAsIdentity({ startWith: INT_PK_STARTS_WITH }),
		activePublishers: smallint("active_publishers"),
		midweekTotalAttendance: smallint("midweek_total_attendance"),
		midweekTotalMeetings: smallint("midweek_total_meetings"),
		midweekAvgAttendance: smallint("midweek_avg_attendance"),
		weekendTotalAttendance: smallint("weekend_total_attendance"),
		weekendTotalMeetings: smallint("weekend_total_meetings"),
		weekendAvgAttendance: smallint("weekend_avg_attendance"),
		bibleStudies: smallint("bible_studies"),
		period: varchar("period", { length: 12 }),
		congregationId: varchar("congregation_id").references(
			() => Congregations.id,
			{
				onDelete: "cascade",
			},
		),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => ({
		unique_cong_report_by_period: uniqueIndex(
			"unique_cong_report_by_period",
		).on(t.period, t.congregationId),
	}),
);

export const $CongregationMonthlyReportsRelations = relations(
	CongregationMonthlyReports,
	({ one }) => ({
		congregation: one(Congregations, {
			fields: [CongregationMonthlyReports.congregationId],
			references: [Congregations.id],
		}),
	}),
);
