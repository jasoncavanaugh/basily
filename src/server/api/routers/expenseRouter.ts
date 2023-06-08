import { COLOR_OPTIONS, ColorOption } from "src/utils/colors";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { Expense, ExpenseCategory } from "@prisma/client";
//Types
type ExpenseWithColorOption = Omit<ExpenseCategory, "color"> & { color: ColorOption };
export type ExpenseCategoryWithExpenses = ExpenseWithColorOption & { expenses: Expense[]; };
//Utils
function convert_to_cents(amount: string) {
  const [dollars_str, cents_str] = amount.split(".");
  const dollars = parseInt(dollars_str!);
  const cents = parseInt(cents_str!);
  return dollars * 100 + cents;
}
export const expenseRouter = createTRPCRouter({
  get_all_categories: protectedProcedure.query(async ({ input, ctx }) => {
    return ctx.prisma.expenseCategory.findMany({
      where: {
        user_id: ctx.session.user.id,
      },
      include: {
        expenses: true,
      },
    }) as Promise<ExpenseCategoryWithExpenses[]>;
  }),
  create: protectedProcedure
    .input(
      z.object({
        category_id: z.string(),
        amount: z.string().regex(/^\d*\.?\d*$/),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.expense.create({
        data: {
          amount: convert_to_cents(input.amount),
          category_id: input.category_id,
        },
      });
    }),
  delete: protectedProcedure
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
        color: z.enum(COLOR_OPTIONS),
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
