require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRouter = require('./routes/auth');
const booksRouter = require('./routes/books');
const authorsRouter = require('./routes/authors');
const categoriesRouter = require('./routes/categories');
const errorHandler = require('./middleware/errorHandler');
const { limiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/api/', limiter);

app.get('/', (req, res) => {
  res.json({
    message: 'API Bibliotheque',
    documentation: `http://localhost:${PORT}/api-docs`
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Bibliothèque - Documentation'
}));

app.get('/api/v1', (req, res) => {
  res.json({
    message: 'API Bibliothèque v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      books: '/api/v1/books',
      authors: '/api/v1/authors',
      categories: '/api/v1/categories'
    },
    documentation: `http://localhost:${PORT}/api-docs`
  });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/books', booksRouter);
app.use('/api/v1/authors', authorsRouter);
app.use('/api/v1/categories', categoriesRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
