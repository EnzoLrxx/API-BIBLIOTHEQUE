const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateBookDescription(title, authorName, categoryName) {
  const prompt = `Tu es un libraire expert. Génère une description courte (2-3 phrases) pour ce livre :

Titre: ${title}
Auteur: ${authorName || 'Inconnu'}
Catégorie: ${categoryName || 'Non spécifiée'}

Réponds uniquement avec la description, sans introduction.`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    max_tokens: 150
  });

  return completion.choices[0]?.message?.content || null;
}

async function generateBookSummary(bookData) {
  const prompt = `Tu es un critique littéraire. Voici les informations sur un livre :

Titre: ${bookData.title}
Auteur: ${bookData.author?.name || 'Inconnu'}
Catégorie: ${bookData.category?.name || 'Non spécifiée'}
Description: ${bookData.description || 'Aucune description'}

Génère un résumé court et captivant de ce livre (3-4 phrases maximum).`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    max_tokens: 200
  });

  return completion.choices[0]?.message?.content || 'Impossible de générer un résumé';
}

async function recommendSimilarBooks(bookData) {
  const prompt = `Tu es un libraire expert. Un client vient de lire ce livre :

Titre: ${bookData.title}
Auteur: ${bookData.author?.name || 'Inconnu'}
Catégorie: ${bookData.category?.name || 'Non spécifiée'}

Recommande exactement 3 livres similaires. Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ou après :
[
  {"title": "Titre du livre 1", "author": "Auteur 1"},
  {"title": "Titre du livre 2", "author": "Auteur 2"},
  {"title": "Titre du livre 3", "author": "Auteur 3"}
]`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.8,
    max_tokens: 300
  });

  const content = completion.choices[0]?.message?.content || '[]';

  try {
    const recommendations = JSON.parse(content);
    return recommendations;
  } catch {
    return [];
  }
}

module.exports = {
  generateBookDescription,
  generateBookSummary,
  recommendSimilarBooks
};
