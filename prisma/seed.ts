import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial foods dataset...');

  const initialFoods = [
    {
      name: 'Dada Ayam Rebus (Skinless Chicken Breast)',
      category: 'Protein',
      servingSizeG: 100,
      calories: 165,
      proteinG: 31.0,
      carbsG: 0.0,
      fatG: 3.6,
      sugarG: 0.0,
      fiberG: 0.0,
    },
    {
      name: 'Nasi Putih (Cooked White Rice)',
      category: 'Karbohidrat',
      servingSizeG: 100,
      calories: 130,
      proteinG: 2.7,
      carbsG: 28.2,
      fatG: 0.3,
      sugarG: 0.1,
      fiberG: 0.4,
    },
    {
      name: 'Nasi Merah (Cooked Brown Rice)',
      category: 'Karbohidrat',
      servingSizeG: 100,
      calories: 111,
      proteinG: 2.6,
      carbsG: 23.0,
      fatG: 0.9,
      sugarG: 0.4,
      fiberG: 1.8,
    },
    {
      name: 'Telur Ayam Utuh Rebus (Whole Boiled Egg)',
      category: 'Protein',
      servingSizeG: 50,
      calories: 78,
      proteinG: 6.3,
      carbsG: 0.6,
      fatG: 5.3,
      sugarG: 0.6,
      fiberG: 0.0,
    },
    {
      name: 'Putih Telur Rebus (Egg White)',
      category: 'Protein',
      servingSizeG: 33,
      calories: 17,
      proteinG: 3.6,
      carbsG: 0.2,
      fatG: 0.1,
      sugarG: 0.2,
      fiberG: 0.0,
    },
    {
      name: 'Pisang Cavendish (Banana)',
      category: 'Buah',
      servingSizeG: 100,
      calories: 89,
      proteinG: 1.1,
      carbsG: 22.8,
      fatG: 0.3,
      sugarG: 12.2,
      fiberG: 2.6,
    },
    {
      name: 'Oatmeal (Rolled Oats, mentah)',
      category: 'Karbohidrat',
      servingSizeG: 40,
      calories: 150,
      proteinG: 5.0,
      carbsG: 27.0,
      fatG: 3.0,
      sugarG: 1.0,
      fiberG: 4.0,
    },
    {
      name: 'Whey Protein Isolate (1 Scoop)',
      category: 'Suplemen',
      servingSizeG: 30,
      calories: 120,
      proteinG: 25.0,
      carbsG: 2.0,
      fatG: 1.0,
      sugarG: 1.0,
      fiberG: 0.0,
    },
    {
      name: 'Tempe Goreng / Kukus',
      category: 'Protein Nabati',
      servingSizeG: 100,
      calories: 192,
      proteinG: 20.3,
      carbsG: 7.6,
      fatG: 10.8,
      sugarG: 0.0,
      fiberG: 1.4,
    },
    {
      name: 'Brokoli Rebus (Boiled Broccoli)',
      category: 'Sayuran',
      servingSizeG: 100,
      calories: 35,
      proteinG: 2.4,
      carbsG: 7.2,
      fatG: 0.4,
      sugarG: 1.4,
      fiberG: 3.3,
    },
  ];

  for (const food of initialFoods) {
    const existing = await prisma.food.findFirst({
      where: { name: food.name },
    });

    if (!existing) {
      await prisma.food.create({
        data: food,
      });
    }
  }

  console.log(`Seeding completed. ${initialFoods.length} foods verified/seeded.`);
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
