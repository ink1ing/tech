// 前端 API 服务
// 处理与 Cloudflare Workers 后端的通信

// 使用自定义域名的API端点
const API_BASE_URL = 'https://auth.ink1ing.tech';

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
      console.log(`🔍 尝试连接 API: ${API_BASE_URL}/api/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, section })
      });

      console.log(`📡 API 响应状态: ${response.status}`);

      const data = await response.json();
      console.log('📦 API 响应数据:', data);

      if (response.ok && data.success) {
        console.log('✅ 登录成功，保存token...');
        this.token = data.token;
        this.tokenExpiry = Math.floor(Date.now() / 1000) + data.expiresIn;
        
        console.log('💾 保存到localStorage...');
        // 保存到 localStorage
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('auth_token_expiry', this.tokenExpiry.toString());
        localStorage.setItem('auth_section', section);
        
        console.log('🔑 Token已保存:', this.token ? this.token.substring(0, 20) + '...' : 'null');
        console.log('⏰ 过期时间:', this.tokenExpiry);
        
        return { success: true };
      } else {
        return { success: false, error: data.error || '登录失败' };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // 提供更详细的错误信息
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { 
          success: false, 
          error: `无法连接到服务器 (${API_BASE_URL})。请检查Workers是否正确部署。详细错误: ${error.message}` 
        };
      }
      
      return { success: false, error: `网络错误: ${error.message}` };
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
    console.log('🔐 检查token有效性...');
    console.log('Token:', this.token ? '存在' : '不存在');
    console.log('Token过期时间:', this.tokenExpiry);
    console.log('当前时间:', Math.floor(Date.now() / 1000));
    
    if (!this.isTokenValid()) {
      throw new Error('未授权访问');
    }

    try {
      console.log('🚀 发送受保护内容请求...');
      console.log('Authorization header:', `Bearer ${this.token ? this.token.substring(0, 20) + '...' : 'null'}`);
      
      const response = await fetch(`${API_BASE_URL}/api/protected/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('🔍 受保护内容响应状态:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ 401错误 - token可能无效或过期');
          this.clearAuth();
          throw new Error('授权已过期，请重新登录');
        }
        throw new Error('获取内容失败');
      }

      const data = await response.json();
      console.log('✅ 受保护内容获取成功:', data);
      return data;
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
    const section = localStorage.getItem('auth_section');
    console.log('🔍 当前section:', section);
    return section;
  }
}

// 导出单例实例
const authService = new AuthService();
export default authService;