const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { generateBookDescription, generateBookSummary, recommendSimilarBooks } = require('../services/groq');

/**
 * @swagger
 * /api/v1/books:
 *   get:
 *     tags: [Livres]
 *     summary: Liste des livres
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      include: {
        author: true,
        category: true
      }
    });

    const booksWithRecommendations = await Promise.all(
      books.map(async (book) => {
        const recommendations = await recommendSimilarBooks(book);
        return {
          ...book,
          ai: { recommendations }
        };
      })
    );

    res.json(booksWithRecommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/books/{id}:
 *   get:
 *     tags: [Livres]
 *     summary: Un livre
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id', async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        author: true,
        category: true
      }
    });
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    const [summary, recommendations] = await Promise.all([
      generateBookSummary(book),
      recommendSimilarBooks(book)
    ]);

    res.json({
      ...book,
      ai: {
        summary,
        recommendations
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/books:
 *   post:
 *     tags: [Livres]
 *     summary: Créer un livre (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Fondation
 *               description:
 *                 type: string
 *                 example: Premier tome
 *               publishedDate:
 *                 type: string
 *                 example: 1951-06-01
 *               authorId:
 *                 type: integer
 *                 example: 1
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               available:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: OK
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, publishedDate, authorId, categoryId, available } = req.body;

    const author = await prisma.author.findUnique({ where: { id: parseInt(authorId) } });
    const category = await prisma.category.findUnique({ where: { id: parseInt(categoryId) } });

    let finalDescription = description;
    if (!description) {
      finalDescription = await generateBookDescription(title, author?.name, category?.name);
    }

    const book = await prisma.book.create({
      data: {
        title,
        description: finalDescription,
        publishedDate: publishedDate ? new Date(publishedDate) : null,
        authorId: parseInt(authorId),
        categoryId: parseInt(categoryId),
        available: available !== undefined ? available : true
      },
      include: {
        author: true,
        category: true
      }
    });

    const summary = await generateBookSummary(book);
    const recommendations = await recommendSimilarBooks(book);

    res.status(201).json({
      ...book,
      ai: {
        summary,
        recommendations
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/books/{id}:
 *   put:
 *     tags: [Livres]
 *     summary: Modifier un livre (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               publishedDate:
 *                 type: string
 *               authorId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, publishedDate, authorId, categoryId, available } = req.body;
    const book = await prisma.book.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(publishedDate && { publishedDate: new Date(publishedDate) }),
        ...(authorId && { authorId: parseInt(authorId) }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(available !== undefined && { available })
      },
      include: {
        author: true,
        category: true
      }
    });
    res.json(book);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/books/{id}:
 *   delete:
 *     tags: [Livres]
 *     summary: Supprimer un livre (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.book.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Livre supprimé avec succès' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/books/{id}/summarize:
 *   get:
 *     tags: [Livres]
 *     summary: Générer un résumé IA du livre
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id/summarize', async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        author: true,
        category: true
      }
    });

    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    const summary = await generateBookSummary(book);
    res.json({ book: book.title, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/books/{id}/recommend:
 *   get:
 *     tags: [Livres]
 *     summary: Recommandations IA de livres similaires
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id/recommend', async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        author: true,
        category: true
      }
    });

    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    const recommendations = await recommendSimilarBooks(book);
    res.json({ book: book.title, recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
