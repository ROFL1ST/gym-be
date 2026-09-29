-- CreateEnum
CREATE TYPE "fitness_level_enum" AS ENUM ('easy', 'medium', 'intermediate');

-- CreateEnum
CREATE TYPE "fitness_goal" AS ENUM ('lose', 'gain', 'healthy');

-- CreateEnum
CREATE TYPE "schedule_status_enum" AS ENUM ('pending', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "meal_type_enum" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateEnum
CREATE TYPE "gender_enum" AS ENUM ('male', 'female');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "gender" "gender_enum" NOT NULL,
    "age" INTEGER NOT NULL,
    "weight" DECIMAL(6,2) NOT NULL,
    "height" DECIMAL(6,2) NOT NULL,
    "fitness_level" "fitness_level_enum" NOT NULL,
    "fitness_goal" "fitness_goal" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_streaks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" DATE,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "focus_muscle" VARCHAR(100) NOT NULL,
    "status" "schedule_status_enum" NOT NULL DEFAULT 'pending',
    "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "ai_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_histories" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "schedule_id" UUID,
    "focus_muscle" VARCHAR(100) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "notes" TEXT,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plans" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "meal_type" "meal_type_enum" NOT NULL,
    "target_calories" INTEGER NOT NULL,
    "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "ai_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plan_details" (
    "id" UUID NOT NULL,
    "meal_plan_id" UUID NOT NULL,
    "food_id" UUID,
    "food_name_custom" VARCHAR(255),
    "portion_g" DECIMAL(8,2) NOT NULL,
    "calculated_calories" DECIMAL(8,2) NOT NULL,
    "calculated_protein" DECIMAL(8,2) NOT NULL,
    "calculated_carbs" DECIMAL(8,2) NOT NULL,
    "calculated_fat" DECIMAL(8,2) NOT NULL,
    "calculated_sugar" DECIMAL(8,2) NOT NULL,
    "calculated_fiber" DECIMAL(8,2) NOT NULL,

    CONSTRAINT "meal_plan_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foods" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "serving_size_g" DECIMAL(8,2) NOT NULL,
    "calories" DECIMAL(8,2) NOT NULL,
    "protein_g" DECIMAL(8,2) NOT NULL,
    "carbs_g" DECIMAL(8,2) NOT NULL,
    "fat_g" DECIMAL(8,2) NOT NULL,
    "sugar_g" DECIMAL(8,2) NOT NULL,
    "fiber_g" DECIMAL(8,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_streaks_user_id_key" ON "user_streaks"("user_id");

-- CreateIndex
CREATE INDEX "schedules_user_id_scheduled_date_idx" ON "schedules"("user_id", "scheduled_date");

-- CreateIndex
CREATE INDEX "workout_histories_user_id_completed_at_idx" ON "workout_histories"("user_id", "completed_at");

-- CreateIndex
CREATE INDEX "meal_plans_user_id_date_idx" ON "meal_plans"("user_id", "date");

-- CreateIndex
CREATE INDEX "meal_plan_details_meal_plan_id_idx" ON "meal_plan_details"("meal_plan_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_histories" ADD CONSTRAINT "workout_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_histories" ADD CONSTRAINT "workout_histories_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_details" ADD CONSTRAINT "meal_plan_details_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_details" ADD CONSTRAINT "meal_plan_details_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
