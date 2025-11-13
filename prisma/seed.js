const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@bibliotheque.com' },
    update: {},
    create: {
      email: 'admin@bibliotheque.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log('Admin créé:', admin.email);

  const author1 = await prisma.author.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Isaac Asimov',
      biography: 'Écrivain américain de science-fiction',
      birthDate: new Date('1920-01-02')
    }
  });

  const author2 = await prisma.author.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Victor Hugo',
      biography: 'Écrivain français du 19ème siècle',
      birthDate: new Date('1802-02-26')
    }
  });

  console.log('Auteurs créés:', author1.name, author2.name);

  const category1 = await prisma.category.upsert({
    where: { name: 'Science-Fiction' },
    update: {},
    create: {
      name: 'Science-Fiction'
    }
  });

  const category2 = await prisma.category.upsert({
    where: { name: 'Roman' },
    update: {},
    create: {
      name: 'Roman'
    }
  });

  console.log('Catégories créées:', category1.name, category2.name);

  const book1 = await prisma.book.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Fondation',
      description: 'Premier tome de la série Fondation',
      publishedDate: new Date('1951-06-01'),
      available: true,
      authorId: author1.id,
      categoryId: category1.id
    }
  });

  const book2 = await prisma.book.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Les Misérables',
      description: 'Roman historique et social',
      publishedDate: new Date('1862-04-03'),
      available: true,
      authorId: author2.id,
      categoryId: category2.id
    }
  });

  console.log('Livres créés:', book1.title, book2.title);
  console.log('Seeding terminé!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
