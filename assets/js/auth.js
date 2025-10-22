/**
 * LexAtlas Premium - Authentication System
 * Sistema de autenticação simples com credenciais hardcoded
 */

class AuthManager {
  constructor() {
    this.credentials = {
      username: 'ADM',
      password: '12345678'
    };
    this.isAuthenticated = false;
    this.currentUser = null;
  }

  login(username, password) {
    if (username === this.credentials.username && password === this.credentials.password) {
      this.isAuthenticated = true;
      this.currentUser = username;
      localStorage.setItem('lexatlas_auth', JSON.stringify({
        user: username,
        timestamp: Date.now()
      }));
      return { success: true, message: 'Login realizado com sucesso!' };
    }
    return { success: false, message: 'Usuário ou senha inválidos' };
  }

  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    localStorage.removeItem('lexatlas_auth');
  }

  checkAuth() {
    const stored = localStorage.getItem('lexatlas_auth');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.isAuthenticated = true;
        this.currentUser = data.user;
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  isLoggedIn() {
    return this.isAuthenticated;
  }
}

const authManager = new AuthManager();

