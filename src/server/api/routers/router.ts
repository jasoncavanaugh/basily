import { BASE_COLORS, BaseColor } from "src/utils/colors";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Expense, ExpenseCategory } from "@prisma/client";

//Types

//Use 'BaseColor' type instead of the 'string' type that comes back from Prisma
type ExpenseWithBaseColor = Omit<ExpenseCategory, "color"> & {
  color: BaseColor;
};
export type ExpenseCategoryWithExpenses = ExpenseWithBaseColor & {
  expenses: Expense[];
};

//Utils
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

const DateZodSchema = z.object({
  month: z.number().gte(1).lte(12),
  day: z.number().gte(1).lte(31),
  year: z.number().gte(1),
});

export const router = createTRPCRouter({
  get_expenses: protectedProcedure
    .input(
      z.object({
        from_date: DateZodSchema,
        to_date: DateZodSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const { from_date, to_date } = input;
      const s = await ctx.prisma.expense.findMany({ where: { user_id: ctx.session.user.id } });
      console.log("USER_ID", ctx.session.user.id);
      console.log("JASON", s);

    const from = new Date(`${from_date.year}-${from_date.month}-${from_date.day}`);
    const to = new Date(`${to_date.year}-${to_date.month}-${to_date.day}`);
    console.log("FROM", from);
    console.log("TO", to);
      return ctx.prisma.expense.findMany({
        where: {
          AND: [{
            createdAt: {
              lte: to,
              gte: from
            },
          }, { user_id: ctx.session.user.id }],
        }
      })
    }),
  get_categories: protectedProcedure.query(async ({ input, ctx }) => {
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.expense.create({
        data: {
          amount: convert_to_cents(input.amount),
          category_id: input.category_id,
          user_id: ctx.session.user.id
        },
      });
    }),
  delete_expense: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.expense.delete({
        where: { id: input.id },
      });
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
      await ctx.prisma.expenseCategory.deleteMany({
        //Not sure why this needs to be "deleteMany" and not just "delete"
        where: {
          AND: [{ name: input.name }, { user_id: ctx.session.user.id }],
        },
      });
    }),
});
