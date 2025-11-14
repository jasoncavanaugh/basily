import {
  pgTable,
  uniqueIndex,
  foreignKey,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/relations";

export const expenseCategory = pgTable(
  "ExpenseCategory",
  {
    id: text().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
    color: text().notNull(),
    name: text().notNull(),
  },
  (table) => [
    uniqueIndex("ExpenseCategory_user_id_name_key").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.name.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "ExpenseCategory_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const expense = pgTable(
  "Expense",
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
    amount: integer().notNull(),
    userId: text("user_id").notNull(),
    categoryId: text("category_id").notNull(),
    dayId: text("day_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [expenseCategory.id],
      name: "Expense_category_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.dayId],
      foreignColumns: [day.id],
      name: "Expense_day_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Expense_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const day = pgTable(
  "Day",
  {
    id: text().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    month: integer().notNull(),
    day: integer().notNull(),
    year: integer().notNull(),
  },
  (table) => [
    uniqueIndex("Day_user_id_month_day_year_key").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
      table.month.asc().nullsLast().op("int4_ops"),
      table.day.asc().nullsLast().op("int4_ops"),
      table.year.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Day_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

// Next Auth stuff
export const session = pgTable(
  "Session",
  {
    id: text().primaryKey().notNull(),
    sessionToken: text().notNull(),
    userId: text().notNull(),
    expires: timestamp({ precision: 3, mode: "string" }).notNull(),
  },
  (table) => [
    uniqueIndex("Session_sessionToken_key").using(
      "btree",
      table.sessionToken.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Session_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const verificationToken = pgTable(
  "VerificationToken",
  {
    identifier: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ precision: 3, mode: "string" }).notNull(),
  },
  (table) => [
    uniqueIndex("VerificationToken_identifier_token_key").using(
      "btree",
      table.identifier.asc().nullsLast().op("text_ops"),
      table.token.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("VerificationToken_token_key").using(
      "btree",
      table.token.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const user = pgTable(
  "User",
  {
    id: text().primaryKey().notNull(),
    name: text(),
    email: text(),
    emailVerified: timestamp({ precision: 3, mode: "string" }),
    image: text(),
  },
  (table) => [
    uniqueIndex("User_email_key").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const account = pgTable(
  "Account",
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    type: text().notNull(),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text(),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (table) => [
    uniqueIndex("Account_provider_providerAccountId_key").using(
      "btree",
      table.provider.asc().nullsLast().op("text_ops"),
      table.providerAccountId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Account_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

// RELATIONS

export const expenseCategoryRelations = relations(
  expenseCategory,
  ({ one, many }) => ({
    user: one(user, {
      fields: [expenseCategory.userId],
      references: [user.id],
    }),
    expenses: many(expense),
  })
);

export const userRelations = relations(user, ({ many }) => ({
  expenseCategories: many(expenseCategory),
  sessions: many(session),
  expenses: many(expense),
  days: many(day),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const expenseRelations = relations(expense, ({ one }) => ({
  expenseCategory: one(expenseCategory, {
    fields: [expense.categoryId],
    references: [expenseCategory.id],
  }),
  day: one(day, {
    fields: [expense.dayId],
    references: [day.id],
  }),
  user: one(user, {
    fields: [expense.userId],
    references: [user.id],
  }),
}));

export const dayRelations = relations(day, ({ one, many }) => ({
  expenses: many(expense),
  user: one(user, {
    fields: [day.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
