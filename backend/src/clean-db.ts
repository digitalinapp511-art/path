import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
  console.log('🧹 Cleaning test data from database...');
  await prisma.report.deleteMany({});
  await prisma.testResult.deleteMany({});
  await prisma.sample.deleteMany({});
  await prisma.testOrderItem.deleteMany({});
  await prisma.testOrder.deleteMany({});
  await prisma.patient.deleteMany({});
  console.log('✅ All test patients, orders, samples and results deleted!');
}

clean()
  .catch((e) => console.log('Cleanup error:', e.message))
  .finally(() => prisma.$disconnect());
