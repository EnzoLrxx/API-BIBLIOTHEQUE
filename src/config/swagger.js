const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Bibliothèque',
      version: '1.0.0',
      description: 'API REST pour la gestion d\'une bibliothèque numérique avec authentification JWT'
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez votre token JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@test.com' },
            role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Book: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Fondation' },
            description: { type: 'string', example: 'Premier tome de la série Fondation' },
            publishedDate: { type: 'string', format: 'date', example: '1951-06-01' },
            available: { type: 'boolean', example: true },
            authorId: { type: 'integer', example: 1 },
            categoryId: { type: 'integer', example: 1 },
            author: { $ref: '#/components/schemas/Author' },
            category: { $ref: '#/components/schemas/Category' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Author: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Isaac Asimov' },
            biography: { type: 'string', example: 'Écrivain de science-fiction américain' },
            birthDate: { type: 'string', format: 'date', example: '1920-01-02' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Science-Fiction' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Message d\'erreur' }
          }
        }
      }
    },
    security: []
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);
