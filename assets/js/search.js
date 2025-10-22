/**
 * LexAtlas Premium - Search Engine
 * Motor de busca com índice invertido
 */

class SearchEngine {
  constructor() {
    this.docs = [];
    this.index = {};
    this.cache = new Map();
  }

  async loadDocuments(url = 'data/docs.json') {
    try {
      const response = await fetch(url);
      this.docs = await response.json();
      this.buildIndex();
      return this.docs;
    } catch (err) {
      console.error('Erro ao carregar documentos:', err);
      Toast.error('Falha ao carregar documentos');
      return [];
    }
  }

  buildIndex() {
    this.index = {};
    this.docs.forEach((doc, idx) => {
      const tokens = this.tokenizeDoc(doc);
      tokens.forEach(token => {
        if (!this.index[token]) {
          this.index[token] = [];
        }
        this.index[token].push(idx);
      });
    });
  }

  tokenizeDoc(doc) {
    const text = `${doc.title} ${doc.content} ${(doc.tags || []).join(' ')}`.toLowerCase();
    return StringUtils.tokenize(text);
  }

  scoreDocument(doc, queryTokens) {
    if (!queryTokens.length) {
      return new Date(doc.date).getTime();
    }

    let score = 0;
    const docText = `${doc.title} ${doc.content} ${(doc.tags || []).join(' ')}`.toLowerCase();
    
    queryTokens.forEach(token => {
      if (docText.includes(token)) score += 10;
      if (doc.title.toLowerCase().includes(token)) score += 20;
      if ((doc.tags || []).some(tag => tag.toLowerCase().includes(token))) score += 15;
      const matches = (docText.match(new RegExp(token, 'g')) || []).length;
      score += matches * 2;
    });

    const daysOld = (Date.now() - new Date(doc.date).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 10 - daysOld);

    return score;
  }

  search(query, filters = {}) {
    const cacheKey = JSON.stringify({ query, filters });
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const queryTokens = StringUtils.tokenize(query);
    
    let results = this.docs
      .filter(doc => {
        if (filters.type && doc.type !== filters.type) return false;
        if (filters.env && doc.env !== filters.env) return false;
        return true;
      })
      .map(doc => ({
        ...doc,
        score: this.scoreDocument(doc, queryTokens)
      }))
      .sort((a, b) => b.score - a.score);

    this.cache.set(cacheKey, results);
    return results;
  }

  findSimilar(docId, limit = 3) {
    const doc = this.docs.find(d => d.id === docId);
    if (!doc) return [];

    const docTokens = new Set(StringUtils.tokenize(`${doc.title} ${doc.tags.join(' ')}`));
    
    return this.docs
      .filter(d => d.id !== docId)
      .map(d => {
        const otherTokens = new Set(StringUtils.tokenize(`${d.title} ${d.tags.join(' ')}`));
        const intersection = [...docTokens].filter(t => otherTokens.has(t)).length;
        const union = new Set([...docTokens, ...otherTokens]).size;
        const similarity = union === 0 ? 0 : intersection / union;
        return { ...d, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .filter(d => d.similarity > 0);
  }
}

const searchEngine = new SearchEngine();

