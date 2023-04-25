import { COLOR_OPTIONS } from "src/utils/colors";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const expenseRouter = createTRPCRouter({
  get_all_categories: protectedProcedure.query(async ({ input, ctx }) => {
    return ctx.prisma.expenseCategory.findMany({
      where: {
        user_id: ctx.session.user.id,
      },
      include: {
        expenses: true,
      },
    });
  }),
  create: protectedProcedure
    .input(z.object({ category_id: z.string(), amount: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.expense.create({
        data: {
          amount: input.amount,
          category_id: input.category_id,
        },
      });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.expense.deleteMany({
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
      await ctx.prisma.expenseCategory.create({
        data: {
          name: input.name,
          color: input.color,
          user_id: ctx.session.user.id,
        },
      });
    }),
  delete_category: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {}),
});
