const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

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
    res.json(books);
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
    res.json(book);
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
    const book = await prisma.book.create({
      data: {
        title,
        description,
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
    res.status(201).json(book);
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

module.exports = router;
