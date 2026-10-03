const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  const products = await prisma.product.findMany();
  const existingCategories = await prisma.category.findMany();
  const existingCategoryNames = existingCategories.map(c => c.name);

  for (const product of products) {
    if (!existingCategoryNames.includes(product.category)) {
      let type = 'CLOTHING';
      if (['FOOTWEAR', 'SNEAKER', 'BOOT', 'DERBY', 'OXFORD', 'LOAFER'].includes(product.category.toUpperCase())) {
        type = 'FOOTWEAR';
      } else if (['CAP', 'CAPS', 'HAT', 'BEANIE'].includes(product.category.toUpperCase())) {
        type = 'CAPS';
      } else if (['CHAIN', 'RING', 'ORNAMENT', 'JEWELRY'].includes(product.category.toUpperCase())) {
        type = 'ORNAMENT';
      }
      
      console.log(`Creating category: ${product.category} of type ${type}`);
      await prisma.category.create({
        data: {
          name: product.category,
          type: type
        }
      });
      existingCategoryNames.push(product.category);
    }
  }
  
  console.log("Migration complete!");
}

migrate().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
