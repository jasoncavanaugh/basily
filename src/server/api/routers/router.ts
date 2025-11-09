import { BASE_COLORS, BaseColor } from "../../../utils/tailwind-colors";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Expense, ExpenseCategory, Day } from "@prisma/client";

/*
 * TYPES
 */

//Use 'BaseColor' type instead of the 'string' type that comes back from Prisma
export type ExpenseCategoryWithBaseColor = Omit<ExpenseCategory, "color"> & {
  color: BaseColor;
};
export type ExpenseCategoryWithExpenses = ExpenseCategoryWithBaseColor & {
  expenses: Expense[];
};

export type DayWithExpenses = Day & { expenses: Expense[] };
export type GetExpensesOverDateRangeRet = {
  days: DayWithExpenses[];
  expense_categories: ExpenseCategoryWithBaseColor[];
};

const DateZodSchema = z.object({
  day: z.number().gt(0),
  month_idx: z.number().gte(0).lte(11),
  year: z.number(),
});

/*
 * UTILS
 */
function convert_to_cents(amount: string) {
  const split_amount = amount.split(".");
  if (split_amount.length > 2 || split_amount.length < 1) {
    console.error("split_amount.length > 2 || split_amount.length < 1");
    throw new Error(
      "'amount' was formatted incorrectly in 'convert_to_cents' function"
    );
  }
  const dollars = parseInt(split_amount[0]!);
  let amount_in_cents = dollars * 100;
  if (split_amount.length === 2) {
    const cents = parseInt(split_amount[1]!);
    amount_in_cents += cents;
  }
  return amount_in_cents;
}
const _NUMBER_OF_ROWS_PER_PAGE = 30;

/*
 * ROUTES
 */
export const router = createTRPCRouter({
  get_expenses_paginated_by_days: protectedProcedure
    .input(z.object({ page: z.number().gte(0) }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.day.findMany({
        where: {
          user_id: ctx.session.user.id,
        },
        include: {
          expenses: true,
        },
        skip: input.page * _NUMBER_OF_ROWS_PER_PAGE,
        take: -_NUMBER_OF_ROWS_PER_PAGE,
      });
    }),
  get_expenses_over_date_range: protectedProcedure
    .input(
      z.object({
        from_year: z.number(),
        to_year: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { from_year, to_year } = input;
      const days = await ctx.prisma.day.findMany({
        where: {
          year: { lte: to_year, gte: from_year },
          user_id: ctx.session.user.id,
        },
        include: { expenses: true },
      });
      //Sort from latest to oldest
      days.sort((a, b) => {
        const a_date = new Date(a.year, a.month, a.day);
        const b_date = new Date(b.year, b.month, b.day);
        return a_date < b_date ? 1 : -1;
      });

      //Get categories
      const expense_categories = (await ctx.prisma.expenseCategory.findMany({
        where: { user_id: ctx.session.user.id },
      })) as ExpenseCategoryWithBaseColor[];
      return { days, expense_categories };
    }),
  get_categories: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.expenseCategory.findMany({
      where: {
        user_id: ctx.session.user.id,
      },
    }) as Promise<ExpenseCategoryWithBaseColor[]>;
  }),
  get_categories_with_expenses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.expenseCategory.findMany({
      where: {
        user_id: ctx.session.user.id,
      },
      include: {
        expenses: true,
      },
    }) as Promise<ExpenseCategoryWithExpenses[]>;
  }),
  create_expense: protectedProcedure
    .input(
      z.object({
        category_id: z.string(),
        amount: z.string().regex(/^\d*(\.\d\d)?$/),
        date: DateZodSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      let day = await ctx.prisma.day.findUnique({
        where: {
          user_id_month_day_year: {
            user_id: ctx.session.user.id,
            month: input.date.month_idx,
            day: input.date.day,
            year: input.date.year,
          },
        },
      });
      if (!day) {
        day = await ctx.prisma.day.create({
          data: {
            user_id: ctx.session.user.id,
            month: input.date.month_idx,
            day: input.date.day,
            year: input.date.year,
          },
        });
      }
      await ctx.prisma.expense.create({
        data: {
          amount: convert_to_cents(input.amount),
          category_id: input.category_id,
          user_id: ctx.session.user.id,
          day_id: day.id,
        },
      });
    }),
  delete_expense: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const deleted_expense = await ctx.prisma.expense.delete({
        where: { id: input.id },
      });
      const other_expenses_for_day = await ctx.prisma.expense.findMany({
        where: { day_id: deleted_expense.day_id },
      });
      if (other_expenses_for_day.length === 0) {
        await ctx.prisma.day.delete({ where: { id: deleted_expense.day_id } });
      }
    }),
  create_category: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        color: z.enum(BASE_COLORS),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.expenseCategory.create({
        data: {
          name: input.name,
          color: input.color,
          user_id: ctx.session.user.id,
        },
      });
    }),
  delete_category: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.expenseCategory.delete({
        where: {
          user_id_name: { user_id: ctx.session.user.id, name: input.name },
        },
      });
    }),
  edit_category: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        new_name: z.string(),
        new_color: z.enum(BASE_COLORS),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.expenseCategory.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.new_name,
          color: input.new_color,
        },
      });
    }),
});
