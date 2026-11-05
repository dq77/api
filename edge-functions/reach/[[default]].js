
export async function onRequest(context) {
  const headers = {
    'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  }
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  // 根据URL匹配路由
  const url = new URL(context.request.url);
  let pathname = url.pathname;
  let targetUrl = new URL('https://www.baidu.com')
  // reach搜路由
  if (pathname.startsWith('/reach/')) {

    // 处理 cookie 设置请求
    const cookieValue = url.searchParams.get('cookievalue');
    if (cookieValue) {
      return new Response('Parameter received: ' + cookieValue, {
        headers: { ...headers,
          'Set-Cookie': `ssn_Tita_PC=${cookieValue}; Path=/; SameSite=None; Secure`,
        }
      });
    }
    pathname = pathname.replace('/reach/', '/');
    targetUrl = new URL('https://account.italent.cn' + pathname);
  } else if (pathname.startsWith('/loginehr/')) {
    pathname = pathname.replace('/loginehr/', '/');
    targetUrl = new URL('https://login.italent.cn' + pathname);
  }

  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });
  try {
    // 两个必要的请求头转发
    const proxyHeaders = new Headers();
    const userAgent = context.request.headers.get('User-Agent');
    if (userAgent) proxyHeaders.set('User-Agent', userAgent);
    const cookie = context.request.headers.get('Cookie');
    if (cookie) proxyHeaders.set('Cookie', cookie);

    let response = await fetch(targetUrl.toString(), {
      method: context.request.method,
      headers: proxyHeaders,
      body: context.request.body
    });


    // 克隆响应并添加 CORS 头
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', context.request.headers.get('Origin') || '*');
    newResponse.headers.set('Access-Control-Allow-Credentials', 'true'); // 获取原始 Set-Cookie 头
    // 获取所有 Set-Cookie 头（可能是数组）
    const setCookies = response.headers.get('Set-Cookie');
    if (setCookies) {
      // 按逗号分割多个 Cookie（注意：某些情况下可能需要更复杂的分割逻辑）
      const cookies = setCookies.split(/,\s*(?=ssn_)/);
      cookies.forEach(cookie => {
        newCookie = cookie.replace(' domain=italent.cn;', '');
        newResponse.headers.append('Set-Cookie', newCookie);
      })
    }
    return newResponse;
  } catch (error) {
    return new Response('Error: ' + error.message, { status: 500 });
  }
}

