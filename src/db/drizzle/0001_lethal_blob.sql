ALTER TABLE "ExpenseCategory" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "ExpenseCategory" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "Expense" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "Expense" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "Day" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "User" RENAME COLUMN "emailVerified" TO "email_verified";--> statement-breakpoint
ALTER TABLE "ExpenseCategory" DROP CONSTRAINT "ExpenseCategory_user_id_fkey"; -- > statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "email_verified" SET DATA TYPE timestamp with time zone;
ALTER TABLE "User" ALTER COLUMN "email_verified" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Expense" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;
ALTER TABLE "Expense" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Expense" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;
ALTER TABLE "Expense" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ExpenseCategory" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;
ALTER TABLE "ExpenseCategory" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ExpenseCategory" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;
ALTER TABLE "ExpenseCategory" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Day" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;
ALTER TABLE "Day" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
DROP INDEX "ExpenseCategory_user_id_name_key";--> statement-breakpoint
ALTER TABLE "ExpenseCategory" ALTER COLUMN "color" SET DEFAULT 'pink';--> statement-breakpoint
ALTER TABLE "Session" ALTER COLUMN "expires" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Session" ALTER COLUMN "expires" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "VerificationToken" ALTER COLUMN "expires" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "VerificationToken" ALTER COLUMN "expires" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "Session" DROP COLUMN "id";
ALTER TABLE "Session" ADD PRIMARY KEY ("sessionToken");--> statement-breakpoint