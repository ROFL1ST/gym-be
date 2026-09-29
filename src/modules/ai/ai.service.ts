import { prisma } from '../../config/db';

// ─── Tipe AI Workout Eksternal ────────────────────────────────────────────────

export interface ExternalWorkoutExercise {
  name: string;
  target: string;
  muscle_group: string;
  equipment: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  progression_note: string;
}

export interface ExternalWorkoutDay {
  date: string;             // YYYY-MM-DD
  title: string;
  focus_muscle: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  exercises: ExternalWorkoutExercise[];
}

export interface ExternalWorkoutPlanResponse {
  workout_plan: ExternalWorkoutDay[];
  [key: string]: any;
}

// ─── Interfaces lama ─────────────────────────────────────────────────────────

export interface WorkoutRecommendationParams {
  fitnessLevel: 'easy' | 'medium' | 'intermediate';
  fitnessGoal: 'lose' | 'gain' | 'healthy';
  lastWorkoutFocus?: string;
  targetDate?: string;
}

export interface MealRecommendationParams {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  fitnessGoal: 'lose' | 'gain' | 'healthy';
  fitnessLevel: 'easy' | 'medium' | 'intermediate';
}

// ─── Fungsi AI Workout Eksternal ──────────────────────────────────────────────

const AI_WORKOUT_BASE_URL = 'https://smartgym-ai-workout.onrender.com';

export interface CallExternalWorkoutAIParams {
  fitnessLevel: 'easy' | 'medium' | 'intermediate';
  fitnessGoal: 'lose' | 'gain' | 'healthy';
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  history: Array<{ focus_muscle: string; completed_at: string }>;
  startDate?: string;
}

/**
 * Memanggil AI Workout eksternal di Render dan mengembalikan workout_plan 7 hari.
 */
export async function callExternalWorkoutAI(
  params: CallExternalWorkoutAIParams,
): Promise<ExternalWorkoutPlanResponse> {
  const { fitnessLevel, fitnessGoal, age, gender, weight, height, history, startDate } = params;

  const body: Record<string, any> = {
    user_profile: {
      fitness_level: fitnessLevel,
      fitness_goal: fitnessGoal,
      ...(age !== undefined && { age }),
      ...(gender !== undefined && { gender }),
      ...(weight !== undefined && { weight }),
      ...(height !== undefined && { height }),
    },
    history,
    ...(startDate && { start_date: startDate }),
  };

  const res = await fetch(`${AI_WORKOUT_BASE_URL}/generate-workout-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000), // 60 detik timeout (free tier bisa lambat)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`AI Workout eksternal error ${res.status}: ${errText}`);
  }

  return res.json() as Promise<ExternalWorkoutPlanResponse>;
}

/**
 * Simpan workout_plan dari AI eksternal ke tabel schedules (bulk insert, skip hari Rest).
 * Mengembalikan array schedule yang berhasil dibuat.
 */
export async function saveWorkoutPlanToSchedules(
  userId: string,
  workoutPlan: ExternalWorkoutDay[],
) {
  // Filter hanya hari yang bukan rest & punya focus_muscle
  const trainingDays = workoutPlan.filter(
    (day) => day.focus_muscle !== null && day.exercises.length > 0,
  );

  if (trainingDays.length === 0) return [];

  // Cek duplikat — jangan insert kalau tanggal sudah ada schedule untuk user ini
  const dates = trainingDays.map((d) => new Date(d.date));
  const existingSchedules = await prisma.schedule.findMany({
    where: {
      userId,
      scheduledDate: { in: dates },
    },
    select: { scheduledDate: true },
  });

  const existingDates = new Set(
    existingSchedules.map((s) => s.scheduledDate.toISOString().split('T')[0]),
  );

  const newDays = trainingDays.filter((day) => !existingDates.has(day.date));

  if (newDays.length === 0) return [];

  // Bulk insert via transaction
  const created = await prisma.$transaction(
    newDays.map((day) =>
      prisma.schedule.create({
        data: {
          userId,
          title: day.title,
          scheduledDate: new Date(day.date),
          focusMuscle: day.focus_muscle!,
          status: 'pending',
          isAiGenerated: true,
          aiNotes: `Dibuat otomatis oleh AI Workout. Latihan: ${day.exercises.map((e) => e.name).join(', ')}.`,
        },
      }),
    ),
  );

  return created;
}

// ─── Fungsi lama (recommend-workout single day) ───────────────────────────────

export async function generateWorkoutRecommendation(params: WorkoutRecommendationParams) {
  const { fitnessLevel, fitnessGoal, lastWorkoutFocus } = params;

  // Pola siklus Push-Pull-Legs adaptif
  let recommendedFocus = 'Chest & Triceps';
  let title = 'Push Day (Dada & Trisep)';

  if (lastWorkoutFocus) {
    const lastLower = lastWorkoutFocus.toLowerCase();
    if (lastLower.includes('chest') || lastLower.includes('push') || lastLower.includes('dada')) {
      recommendedFocus = 'Back & Biceps';
      title = 'Pull Day (Punggung & Bisep)';
    } else if (lastLower.includes('back') || lastLower.includes('pull') || lastLower.includes('punggung')) {
      recommendedFocus = 'Legs & Shoulders';
      title = 'Leg Day (Kaki & Bahu)';
    } else if (lastLower.includes('leg') || lastLower.includes('kaki')) {
      recommendedFocus = 'Full Body & Core';
      title = 'Full Body & Perut';
    }
  }

  // Rekomendasi durasi dan variasi latihan berdasarkan level
  let duration = 45;
  let exercises: Array<{ name: string; sets: number; reps: string; restSec: number }> = [];

  if (fitnessLevel === 'easy') {
    duration = 35;
    if (recommendedFocus === 'Chest & Triceps') {
      exercises = [
        { name: 'Push Up (Lutut / Standar)', sets: 3, reps: '8-10', restSec: 60 },
        { name: 'Dumbbell Chest Press (Ringan)', sets: 3, reps: '10-12', restSec: 60 },
        { name: 'Triceps Rope Pushdown', sets: 3, reps: '12', restSec: 45 },
      ];
    } else if (recommendedFocus === 'Back & Biceps') {
      exercises = [
        { name: 'Lat Pulldown Mesin', sets: 3, reps: '10-12', restSec: 60 },
        { name: 'Seated Cable Row', sets: 3, reps: '10-12', restSec: 60 },
        { name: 'Dumbbell Bicep Curl', sets: 3, reps: '12', restSec: 45 },
      ];
    } else {
      exercises = [
        { name: 'Bodyweight Squats', sets: 3, reps: '12-15', restSec: 60 },
        { name: 'Leg Extension Mesin', sets: 3, reps: '12', restSec: 60 },
        { name: 'Plank', sets: 3, reps: '30 detik', restSec: 45 },
      ];
    }
  } else if (fitnessLevel === 'medium') {
    duration = 55;
    if (recommendedFocus === 'Chest & Triceps') {
      exercises = [
        { name: 'Barbell Flat Bench Press', sets: 4, reps: '8-10', restSec: 90 },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restSec: 75 },
        { name: 'Chest Cable Flyes', sets: 3, reps: '12-15', restSec: 60 },
        { name: 'Overhead Tricep Extension', sets: 3, reps: '12', restSec: 60 },
      ];
    } else if (recommendedFocus === 'Back & Biceps') {
      exercises = [
        { name: 'Barbell Bent Over Row', sets: 4, reps: '8-10', restSec: 90 },
        { name: 'Lat Pulldown Wide Grip', sets: 3, reps: '10-12', restSec: 75 },
        { name: 'Face Pulls (Rear Delts)', sets: 3, reps: '15', restSec: 60 },
        { name: 'Hammer Curls', sets: 3, reps: '12', restSec: 60 },
      ];
    } else {
      exercises = [
        { name: 'Barbell Back Squats', sets: 4, reps: '8-10', restSec: 90 },
        { name: 'Romanian Deadlift', sets: 3, reps: '10', restSec: 75 },
        { name: 'Walking Lunges', sets: 3, reps: '12 langkah', restSec: 60 },
        { name: 'Standing Calf Raises', sets: 4, reps: '15', restSec: 45 },
      ];
    }
  } else {
    // intermediate
    duration = 70;
    if (recommendedFocus === 'Chest & Triceps') {
      exercises = [
        { name: 'Heavy Barbell Bench Press (RPE 8)', sets: 5, reps: '5-6', restSec: 120 },
        { name: 'Incline Barbell Press', sets: 4, reps: '8-10', restSec: 90 },
        { name: 'Weighted Dips / Dips', sets: 3, reps: '8-10', restSec: 75 },
        { name: 'Incline Dumbbell Flyes', sets: 3, reps: '12', restSec: 60 },
        { name: 'Skull Crushers', sets: 4, reps: '10-12', restSec: 60 },
      ];
    } else if (recommendedFocus === 'Back & Biceps') {
      exercises = [
        { name: 'Conventional Deadlift', sets: 4, reps: '5', restSec: 150 },
        { name: 'Pull-Up / Weighted Pull-Up', sets: 4, reps: '6-8', restSec: 90 },
        { name: 'T-Bar Row', sets: 4, reps: '8-10', restSec: 75 },
        { name: 'Single Arm Dumbbell Row', sets: 3, reps: '10', restSec: 60 },
        { name: 'Incline Dumbbell Bicep Curl', sets: 4, reps: '10-12', restSec: 60 },
      ];
    } else {
      exercises = [
        { name: 'Heavy Barbell Squats', sets: 5, reps: '5', restSec: 150 },
        { name: 'Bulgarian Split Squats', sets: 3, reps: '10 per kaki', restSec: 75 },
        { name: 'Leg Press', sets: 4, reps: '10-12', restSec: 90 },
        { name: 'Lying Leg Curl', sets: 4, reps: '12', restSec: 60 },
        { name: 'Hanging Leg Raises', sets: 4, reps: '15', restSec: 45 },
      ];
    }
  }

  const aiNotes = `Model Rekomendasi AI mendeteksi level '${fitnessLevel}' dan target '${fitnessGoal}'. Otot target difokuskan pada '${recommendedFocus}' untuk memberi waktu istirahat pada otot yang dilatih sebelumnya (${lastWorkoutFocus || 'Sesi awal'}).`;

  return {
    title,
    focusMuscle: recommendedFocus,
    durationMinutes: duration,
    fitnessLevel,
    fitnessGoal,
    exercises,
    aiNotes,
    isAiGenerated: true,
  };
}

export async function generateMealRecommendation(params: MealRecommendationParams) {
  const { weight, height, age, gender, fitnessGoal, fitnessLevel } = params;

  // 1. Hitung BMR (Mifflin-St Jeor)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // 2. Activity Multiplier berdasarkan level
  let activityMultiplier = 1.375; // easy
  if (fitnessLevel === 'medium') activityMultiplier = 1.55;
  if (fitnessLevel === 'intermediate') activityMultiplier = 1.725;

  const tdee = Math.round(bmr * activityMultiplier);

  // 3. Kalori Target berdasarkan Goal
  let targetCalories = tdee;
  if (fitnessGoal === 'lose') {
    targetCalories = Math.max(1200, tdee - 500); // Defisit 500 kalori
  } else if (fitnessGoal === 'gain') {
    targetCalories = tdee + 400; // Surplus 400 kalori
  }

  // 4. Makronutrien rasio
  const proteinGrams = Math.round(weight * 2.0); // 2.0g per kg berat badan
  const proteinCalories = proteinGrams * 4;

  const fatCalories = Math.round(targetCalories * 0.25); // 25% lemak sehat
  const fatGrams = Math.round(fatCalories / 9);

  const remainingCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
  const carbsGrams = Math.round(remainingCalories / 4);

  // 5. Query rekomendasi makanan dari database `foods`
  const foods = await prisma.food.findMany({ take: 10 });

  const aiNotes = `Berdasarkan kalkulasi BMR (${Math.round(bmr)} kcal) dan TDEE (${tdee} kcal), target harian Anda disesuaikan menjadi ${targetCalories} kcal untuk mendukung tujuan '${fitnessGoal}'. Pembagian makro: Protein ${proteinGrams}g, Karbo ${carbsGrams}g, Lemak ${fatGrams}g.`;

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    macroDistribution: {
      proteinG: proteinGrams,
      carbsG: carbsGrams,
      fatG: fatGrams,
    },
    mealPlanSuggestion: {
      breakfastCalories: Math.round(targetCalories * 0.25),
      lunchCalories: Math.round(targetCalories * 0.35),
      dinnerCalories: Math.round(targetCalories * 0.30),
      snackCalories: Math.round(targetCalories * 0.10),
    },
    recommendedFoods: foods.slice(0, 5),
    aiNotes,
    isAiGenerated: true,
  };
}
