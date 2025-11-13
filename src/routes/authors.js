const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/authors:
 *   get:
 *     tags: [Auteurs]
 *     summary: Liste des auteurs
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', async (req, res) => {
  try {
    const authors = await prisma.author.findMany({
      include: {
        books: true
      }
    });
    res.json(authors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/authors/{id}:
 *   get:
 *     tags: [Auteurs]
 *     summary: Un auteur
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
    const author = await prisma.author.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        books: true
      }
    });
    if (!author) {
      return res.status(404).json({ error: 'Auteur non trouvé' });
    }
    res.json(author);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/authors:
 *   post:
 *     tags: [Auteurs]
 *     summary: Créer un auteur (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Isaac Asimov
 *               biography:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 example: 1920-01-02
 *     responses:
 *       201:
 *         description: OK
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, biography, birthDate } = req.body;
    const author = await prisma.author.create({
      data: {
        name,
        biography,
        birthDate: birthDate ? new Date(birthDate) : null
      }
    });
    res.status(201).json(author);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/authors/{id}:
 *   put:
 *     tags: [Auteurs]
 *     summary: Modifier un auteur (Admin)
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
 *               name:
 *                 type: string
 *               biography:
 *                 type: string
 *               birthDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, biography, birthDate } = req.body;
    const author = await prisma.author.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(biography !== undefined && { biography }),
        ...(birthDate && { birthDate: new Date(birthDate) })
      }
    });
    res.json(author);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Auteur non trouvé' });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/authors/{id}:
 *   delete:
 *     tags: [Auteurs]
 *     summary: Supprimer un auteur (Admin)
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
    await prisma.author.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Auteur supprimé avec succès' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Auteur non trouvé' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
