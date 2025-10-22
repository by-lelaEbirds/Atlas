/**
 * LexAtlas Premium - Main Application
 * Inicialização e orquestração
 */

class LexAtlasApp {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    // Inicializar tema
    ThemeManager.init();

    // Verificar autenticação
    if (authManager.checkAuth()) {
      await this.initializeApp();
    } else {
      ui.showLoginScreen();
      this.setupLoginHandlers();
    }

    this.initialized = true;
  }

  async initializeApp() {
    // Carregar documentos
    await searchEngine.loadDocuments();
    
    // Mostrar tela da aplicação
    ui.showAppScreen();
    
    // Renderizar resultados iniciais
    ui.renderResults(searchEngine.docs);
    
    // Configurar event listeners
    this.setupEventListeners();
  }

  setupLoginHandlers() {
    ui.elements.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      const result = authManager.login(username, password);
      
      if (result.success) {
        ui.elements.loginError.style.display = 'none';
        Toast.success(result.message);
        
        // Aguardar um pouco antes de inicializar a app
        setTimeout(() => {
          this.initializeApp();
        }, 600);
      } else {
        ui.elements.loginError.textContent = result.message;
        ui.elements.loginError.style.display = 'block';
        Toast.error(result.message);
      }
    });
  }

  setupEventListeners() {
    // Busca
    ui.elements.searchBtn.addEventListener('click', () => ui.performSearch());
    ui.elements.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') ui.performSearch();
    });
    ui.elements.searchInput.addEventListener('input', debounce(() => ui.performSearch(), 300));

    // Filtros
    ui.elements.filterType.addEventListener('change', () => ui.performSearch());
    ui.elements.chips.forEach(chip => {
      chip.addEventListener('click', () => {
        ui.elements.chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        ui.performSearch();
      });
    });

    // Ações
    ui.elements.copyContentBtn.addEventListener('click', () => ui.copyContent());
    ui.elements.downloadContentBtn.addEventListener('click', () => ui.downloadContent());
    ui.elements.copyAllBtn.addEventListener('click', () => ui.copyAll());
    ui.elements.downloadBtn.addEventListener('click', () => ui.downloadSample());

    // Tema
    ui.elements.themeToggle.addEventListener('click', () => ThemeManager.toggle());

    // Logout
    ui.elements.logoutBtn.addEventListener('click', () => {
      authManager.logout();
      this.initialized = false;
      ui.showLoginScreen();
      this.setupLoginHandlers();
      Toast.success('Desconectado com sucesso!');
      
      // Limpar formulário
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
    });
  }
}

const app = new LexAtlasApp();

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

