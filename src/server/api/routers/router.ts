import { BASE_COLORS, BaseColor } from "src/utils/colors";
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
export type GetExpensesOverDateRangeRet = {
  days: (Day & { expenses: Expense[] })[];
  expense_categories: ExpenseCategoryWithBaseColor[];
};

const DateZodSchema = z.object({
  day: z.number(),
  month_idx: z.number(),
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
        from_date: DateZodSchema,
        to_date: DateZodSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const { from_date, to_date } = input;

      let days = null;
      if (from_date.year === to_date.year) {
        //if (from_year == to_year) -> compare months and days
        days = await ctx.prisma.day.findMany({
          where: {
            AND: [
              { month: { lte: to_date.month_idx, gte: from_date.month_idx } },
              { year: from_date.year },
              { day: { lte: to_date.day, gte: from_date.day } },
              { user_id: ctx.session.user.id },
            ],
          },
          include: { expenses: true },
        });
      } else {
        /* if (from_year < to_year) -> {
         *    Just return from_year <= year <= to_year 
         *    Do the rest of the filtering on the frontend
         * }
         */
        days = await ctx.prisma.day.findMany({
          where: {
            year: { lte: to_date.year, gte: from_date.year },
          },
          include: { expenses: true },
        });
      }

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
});
