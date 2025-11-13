const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     tags: [Catégories]
 *     summary: Liste des catégories
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        books: true
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     tags: [Catégories]
 *     summary: Une catégorie
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
    const category = await prisma.category.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        books: true
      }
    });
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     tags: [Catégories]
 *     summary: Créer une catégorie (Admin)
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
 *                 example: Roman
 *     responses:
 *       201:
 *         description: OK
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({
      data: { name }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     tags: [Catégories]
 *     summary: Modifier une catégorie (Admin)
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
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: { name }
    });
    res.json(category);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     tags: [Catégories]
 *     summary: Supprimer une catégorie (Admin)
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
    await prisma.category.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
