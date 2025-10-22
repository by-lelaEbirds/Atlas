/**
 * LexAtlas Premium - UI Manager
 * Gerenciador de interface
 */

class UIManager {
  constructor() {
    this.elements = {
      loginScreen: document.getElementById('loginScreen'),
      appScreen: document.getElementById('appScreen'),
      loginForm: document.getElementById('loginForm'),
      loginError: document.getElementById('loginError'),
      searchInput: document.getElementById('searchInput'),
      searchBtn: document.getElementById('searchBtn'),
      filterType: document.getElementById('filterType'),
      chips: document.querySelectorAll('.chip'),
      resultsGrid: document.getElementById('resultsGrid'),
      viewerTitle: document.getElementById('viewerTitle'),
      viewerBadge: document.getElementById('viewerBadge'),
      editor: document.getElementById('editor'),
      recsList: document.getElementById('recsList'),
      copyContentBtn: document.getElementById('copyContentBtn'),
      downloadContentBtn: document.getElementById('downloadContentBtn'),
      copyAllBtn: document.getElementById('copyAllBtn'),
      downloadBtn: document.getElementById('downloadBtn'),
      insightBox: document.getElementById('insightBox'),
      insightCount: document.getElementById('insightCount'),
      themeToggle: document.getElementById('themeToggle'),
      logoutBtn: document.getElementById('logoutBtn')
    };

    this.selectedDocId = null;
  }

  showLoginScreen() {
    this.elements.loginScreen.classList.remove('hidden');
    this.elements.appScreen.classList.remove('active');
  }

  showAppScreen() {
    this.elements.loginScreen.classList.add('hidden');
    this.elements.appScreen.classList.add('active');
  }

  renderResults(docs) {
    this.elements.resultsGrid.innerHTML = '';

    if (!docs.length) {
      this.elements.resultsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-muted);">
          <p style="font-size: 16px; font-weight: 600;">Nenhum resultado encontrado</p>
          <p style="font-size: 14px; margin-top: 8px;">Tente outra busca ou ajuste os filtros</p>
        </div>
      `;
      this.elements.insightBox.style.display = 'none';
      return;
    }

    this.elements.insightBox.style.display = 'block';

    docs.slice(0, 8).forEach((doc, index) => {
      const card = document.createElement('div');
      card.className = 'result-card';
      card.style.animationDelay = `${index * 0.05}s`;
      
      const envText = doc.env === 'onprem' ? 'On-Prem' : 'Nuvem';
      const tagsText = (doc.tags || []).slice(0, 2).join(', ');

      card.innerHTML = `
        <div class="card-header">
          <span class="card-badge">${doc.type}</span>
          <span class="card-env">${envText}</span>
        </div>
        <h3 class="card-title">${doc.title}</h3>
        <div class="card-meta">
          <span>${doc.date}</span>
          <span>${tagsText}</span>
        </div>
      `;

      card.addEventListener('click', () => this.selectDocument(doc.id));
      this.elements.resultsGrid.appendChild(card);
    });

    this.elements.insightCount.textContent = docs.length;
  }

  selectDocument(docId) {
    const doc = searchEngine.docs.find(d => d.id === docId);
    if (!doc) return;

    this.selectedDocId = docId;

    this.elements.viewerTitle.textContent = doc.title;
    this.elements.editor.innerHTML = '';
    this.elements.editor.textContent = doc.content;
    
    const envText = doc.env === 'onprem' ? 'On-Prem' : 'Nuvem';
    this.elements.viewerBadge.textContent = envText;

    this.renderRecommendations(docId);
  }

  renderRecommendations(docId) {
    this.elements.recsList.innerHTML = '';
    const similar = searchEngine.findSimilar(docId, 3);

    if (!similar.length) {
      const li = document.createElement('li');
      li.innerHTML = '<div class="rec-type" style="color: var(--text-muted); font-weight: 600;">Nenhum modelo similar</div>';
      this.elements.recsList.appendChild(li);
      return;
    }

    similar.forEach((doc, index) => {
      const li = document.createElement('li');
      li.className = 'rec-item';
      li.style.animationDelay = `${index * 0.05}s`;
      li.innerHTML = `
        <div class="rec-title">${doc.title}</div>
        <div class="rec-type">${doc.type}</div>
      `;
      li.addEventListener('click', () => this.selectDocument(doc.id));
      this.elements.recsList.appendChild(li);
    });
  }

  performSearch() {
    const query = this.elements.searchInput.value.trim();
    const type = this.elements.filterType.value;
    const env = document.querySelector('.chip.active')?.dataset.env || '';

    const filters = {};
    if (type) filters.type = type;
    if (env) filters.env = env;

    const results = searchEngine.search(query, filters);
    this.renderResults(results);
  }

  async copyContent() {
    if (this.elements.editor.textContent.includes('Clique em um documento')) {
      Toast.error('Selecione um documento primeiro');
      return;
    }

    try {
      await navigator.clipboard.writeText(this.elements.editor.textContent);
      Toast.success('Conteúdo copiado!');
    } catch (err) {
      Toast.error('Erro ao copiar');
    }
  }

  downloadContent() {
    if (this.elements.editor.textContent.includes('Clique em um documento')) {
      Toast.error('Selecione um documento primeiro');
      return;
    }

    const filename = (this.elements.viewerTitle.textContent || 'modelo').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.txt';
    FileUtils.download(this.elements.editor.textContent, filename);
    Toast.success('Arquivo baixado!');
  }

  copyAll() {
    const summary = searchEngine.docs.map(doc => `${doc.title} (${doc.type})`).join('\n');
    navigator.clipboard.writeText(summary);
    Toast.success('Resumo copiado!');
  }

  downloadSample() {
    const sample = searchEngine.docs.slice(0, 3).map(doc => `${doc.title}\n${doc.content}\n---\n`).join('\n');
    FileUtils.download(sample, 'amostra_modelos.txt');
    Toast.success('Amostra baixada!');
  }
}

const ui = new UIManager();

