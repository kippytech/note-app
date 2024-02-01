import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userSystemEnum = pgEnum("user_sys_enum", ["system", "user"]);

// export const users = pgTable("users", {
//   id: varchar("id", { length: 256 }).notNull().primaryKey(),
//   email: varchar("email", { length: 256 }),
// });

// export const userRelations = relations(users, ({ many }) => ({
//   notes: many(notes),
// }));

export const notes = pgTable("notes", {
  id: serial("id").primaryKey().notNull(),
  //id: varchar("userId", { length: 256 }).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("text"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  userId: varchar("userId", { length: 256 }).notNull(),
  //   userId: varchar("userId", { length: 256 })
  //     .references(() => users.id)
  //     .notNull(),
});

// export const noteRelations = relations(notes, ({ one }) => ({
//   user: one(users, {
//     fields: [notes.userId],
//     references: [users.id],
//   }),
// }));

export type Note = typeof notes.$inferSelect;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey().notNull(),
  //id: varchar("userId", { length: 256 }).notNull(),
  content: text("text").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  //updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  userId: varchar("userId", { length: 256 }),
  role: userSystemEnum("role").notNull(),
});
//   userId: varchar("userId", { length: 256 })
//     .references(() => users.id)
//     .notNull(),
//});
export type MessageSchema = typeof messages.$inferSelect;
