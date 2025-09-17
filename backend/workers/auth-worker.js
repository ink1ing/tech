// Cloudflare Workers 认证API
// 部署到 Cloudflare Workers 用于处理用户认证

// 简化版JWT实现 - 使用标准的base64编码
async function generateJWT(payload, secret) {
  console.log('🔨 生成JWT, payload:', payload);
  
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // 使用标准base64编码，然后转换为base64url
  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  
  const unsignedToken = `${headerB64}.${payloadB64}`;
  console.log('📝 未签名token:', unsignedToken);
  
  // 生成签名
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(unsignedToken)
  );
  
  // 转换签名为base64url
  const signatureArray = new Uint8Array(signature);
  const signatureB64 = btoa(String.fromCharCode.apply(null, signatureArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  const finalToken = `${unsignedToken}.${signatureB64}`;
  console.log('✅ 生成的JWT:', finalToken.substring(0, 50) + '...');
  
  return finalToken;
}

async function verifyJWT(token, secret) {
  try {
    console.log('🔐 开始验证JWT...');
    console.log('Token:', token ? token.substring(0, 50) + '...' : 'null');
    console.log('Secret存在:', secret ? '是' : '否');
    
    if (!token || !secret) {
      console.log('❌ Token或Secret缺失');
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('❌ JWT格式错误, parts:', parts.length);
      return null;
    }
    
    const [headerB64, payloadB64, signatureB64] = parts;
    console.log('📦 JWT Parts验证开始');
    
    // 重新生成签名进行比较
    const unsignedToken = `${headerB64}.${payloadB64}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(unsignedToken)
    );
    
    // 转换为base64url格式
    const expectedSignatureArray = new Uint8Array(expectedSignature);
    const expectedSignatureB64 = btoa(String.fromCharCode.apply(null, expectedSignatureArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    console.log('🔍 签名对比:', {
      received: signatureB64.substring(0, 20) + '...',
      expected: expectedSignatureB64.substring(0, 20) + '...',
      match: signatureB64 === expectedSignatureB64
    });
    
    if (signatureB64 !== expectedSignatureB64) {
      console.log('❌ 签名不匹配');
      return null;
    }
    
    // 解析payload
    const payloadStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr);
    console.log('📦 解析后的payload:', payload);
    
    // 检查过期时间
    const now = Date.now() / 1000;
    console.log('⏰ 时间检查:', { now, exp: payload.exp, isExpired: payload.exp && now > payload.exp });
    
    if (payload.exp && now > payload.exp) {
      console.log('❌ Token已过期');
      return null;
    }
    
    console.log('✅ JWT验证成功');
    return payload;
    
  } catch (error) {
    console.error('❌ JWT验证异常:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

function base64urlEscape(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlUnescape(str) {
  str += new Array(5 - str.length % 4).join('=');
  return str.replace(/\-/g, '+').replace(/_/g, '/');
}

// CORS 处理
function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// 主处理函数
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(origin)
      });
    }
    
    // API 路由
    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      return handleLogin(request, env, origin);
    }
    
    if (url.pathname === '/api/auth/verify' && request.method === 'POST') {
      return handleVerify(request, env, origin);
    }
    
    if (url.pathname === '/api/protected/content' && request.method === 'GET') {
      return handleProtectedContent(request, env, origin);
    }
    
    return new Response('Not Found', { 
      status: 404,
      headers: corsHeaders(origin)
    });
  }
};

// 处理登录请求
async function handleLogin(request, env, origin) {
  try {
    const { password, section } = await request.json();
    
    // 从环境变量获取密码
    let correctPassword;
    if (section === 'private1' || section === '私有访问1' || section === 'Private Access 1') {
      correctPassword = env.PASSWORD_1;
    } else if (section === 'private2' || section === '私有访问2' || section === 'Private Access 2') {
      correctPassword = env.PASSWORD_2;
    } else {
      return new Response(JSON.stringify({ error: 'Invalid section' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin)
        }
      });
    }
    
    // 验证密码
    if (password !== correctPassword) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin)
        }
      });
    }
    
    // 生成 JWT
    const payload = {
      section,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
    };
    
    const token = await generateJWT(payload, env.JWT_SECRET);
    
    return new Response(JSON.stringify({ 
      success: true, 
      token,
      expiresIn: 86400 // 24小时
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(origin)
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(origin)
      }
    });
  }
}

// 处理token验证请求
async function handleVerify(request, env, origin) {
  try {
    const { token } = await request.json();
    
    const payload = await verifyJWT(token, env.JWT_SECRET);
    
    if (!payload) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin)
        }
      });
    }
    
    return new Response(JSON.stringify({ 
      valid: true, 
      section: payload.section 
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(origin)
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ valid: false }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(origin)
      }
    });
  }
}

// 处理受保护内容请求
async function handleProtectedContent(request, env, origin) {
  try {
    console.log('🔍 处理受保护内容请求...');
    const authHeader = request.headers.get('Authorization');
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid Authorization header');
      return new Response(JSON.stringify({ error: 'Missing token' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin)
        }
      });
    }
    
    const token = authHeader.substring(7);
    console.log('🔑 Extracted token:', token.substring(0, 20) + '...');
    console.log('🔐 Verifying JWT...');
    
    const payload = await verifyJWT(token, env.JWT_SECRET);
    console.log('📦 JWT payload:', payload);
    
    if (!payload) {
      console.log('❌ Invalid JWT token');
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin)
        }
      });
    }
    
    console.log('✅ JWT valid, section:', payload.section);
    
    // 根据section返回相应的受保护内容
    let protectedData = {};
    
    if (payload.section === 'private1' || payload.section === '私有访问1' || payload.section === 'Private Access 1') {
      protectedData = {
        links: [
          {
            title: '订阅链接1',
            title_en: 'Subscription Link 1',
            url: env.PROTECTED_LINK_1 || 'https://liangxin.xyz/api/v1/liangxin?OwO=e3b7da973fe06931eb2c76298109e5a5',
            description: '点击即可复制',
            description_en: 'Click to copy'
          }
        ]
      };
    } else if (payload.section === 'private2' || payload.section === '私有访问2' || payload.section === 'Private Access 2') {
      protectedData = {
        links: [
          {
            title: '速度a 质量a 可选性b 稳定性b all',
            title_en: 'Speed A Quality A Options B Stability B All', 
            url: 'https://liangxin.xyz/api/v1/liangxin?OwO=82c5e463214390893b93077965bcdeb5',
            description: '点击即可复制',
            description_en: 'Click to copy'
          },
          {
            title: '速度b质量b可选性a稳定性a iOS',
            title_en: 'Speed B Quality B Options A Stability A iOS', 
            url: 'https://fba02.fbsubcn01.cc:2096/flydsubal/z8uwnnb67kkmn8ip?list=shadowrocket&extend=1',
            description: '点击即可复制',
            description_en: 'Click to copy'
          },
          {
            title: '速度b质量a可选性a稳定性a Clash',
            title_en: 'Speed B Quality A Options A Stability A Clash', 
            url: 'https://fba01.fbsubcn01.cc:2096/flydsubal/27craqh8tw3miczq?clash=1&extend=1',
            description: '点击即可复制',
            description_en: 'Click to copy'
          }
        ]
      };
    }
    
    console.log('📤 Returning protected data:', protectedData);
    
    return new Response(JSON.stringify(protectedData), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(origin)
      }
    });
    
  } catch (error) {
    console.error('❌ Server error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(origin)
      }
    });
  }
}