import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userSystemEnum = pgEnum("user_sys_enum", ["system", "user"]);

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("text"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  //userId: varchar('userId', {length: 256}).notNull()
  userId: varchar("userId", { length: 256 })
    .references(() => users.id)
    .notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  text: text("text"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  //userId: varchar('userId', {length: 256}).notNull(),
  role: userSystemEnum("role").notNull(),
  userId: varchar("userId", { length: 256 })
    .references(() => users.id)
    .notNull(),
});

export const users = pgTable("users", {
  id: varchar("id", { length: 256 }).notNull().primaryKey(),
  email: varchar("email", { length: 256 }).unique(),
});
