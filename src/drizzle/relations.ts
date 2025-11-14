import { relations } from "drizzle-orm/relations";
import { user, expenseCategory, session, expense, day, account } from "./schema";

export const expenseCategoryRelations = relations(expenseCategory, ({one, many}) => ({
	user: one(user, {
		fields: [expenseCategory.userId],
		references: [user.id]
	}),
	expenses: many(expense),
}));

export const userRelations = relations(user, ({many}) => ({
	expenseCategories: many(expenseCategory),
	sessions: many(session),
	expenses: many(expense),
	days: many(day),
	accounts: many(account),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const expenseRelations = relations(expense, ({one}) => ({
	expenseCategory: one(expenseCategory, {
		fields: [expense.categoryId],
		references: [expenseCategory.id]
	}),
	day: one(day, {
		fields: [expense.dayId],
		references: [day.id]
	}),
	user: one(user, {
		fields: [expense.userId],
		references: [user.id]
	}),
}));

export const dayRelations = relations(day, ({one, many}) => ({
	expenses: many(expense),
	user: one(user, {
		fields: [day.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));