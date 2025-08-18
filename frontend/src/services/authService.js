// 前端 API 服务
// 处理与 Cloudflare Workers 后端的通信

const API_BASE_URL = 'https://ink-auth-api.ink1ing.workers.dev'; // Cloudflare Workers API 端点

class AuthService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.tokenExpiry = localStorage.getItem('auth_token_expiry');
  }

  // 检查 token 是否有效
  isTokenValid() {
    if (!this.token || !this.tokenExpiry) {
      return false;
    }
    
    const now = Date.now() / 1000;
    return now < parseInt(this.tokenExpiry);
  }

  // 登录验证
  async login(password, section) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, section })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.token = data.token;
        this.tokenExpiry = Math.floor(Date.now() / 1000) + data.expiresIn;
        
        // 保存到 localStorage
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('auth_token_expiry', this.tokenExpiry.toString());
        localStorage.setItem('auth_section', section);
        
        return { success: true };
      } else {
        return { success: false, error: data.error || '登录失败' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: '网络错误，请重试' };
    }
  }

  // 验证当前 token
  async verifyToken() {
    if (!this.isTokenValid()) {
      return { valid: false };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: this.token })
      });

      const data = await response.json();
      
      if (!response.ok || !data.valid) {
        this.clearAuth();
        return { valid: false };
      }

      return { valid: true, section: data.section };
    } catch (error) {
      console.error('Token verification error:', error);
      this.clearAuth();
      return { valid: false };
    }
  }

  // 获取受保护内容
  async getProtectedContent() {
    if (!this.isTokenValid()) {
      throw new Error('未授权访问');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/protected/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuth();
          throw new Error('授权已过期，请重新登录');
        }
        throw new Error('获取内容失败');
      }

      return await response.json();
    } catch (error) {
      console.error('Get protected content error:', error);
      throw error;
    }
  }

  // 清除认证信息
  clearAuth() {
    this.token = null;
    this.tokenExpiry = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expiry');
    localStorage.removeItem('auth_section');
  }

  // 登出
  logout() {
    this.clearAuth();
  }

  // 获取当前登录的区域
  getCurrentSection() {
    return localStorage.getItem('auth_section');
  }
}

// 导出单例实例
const authService = new AuthService();
export default authService;