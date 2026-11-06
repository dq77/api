
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
  const pathname = url.pathname.replace('/weather/', '/');
  const targetUrl = new URL('https://products.weather.com.cn' + pathname);

  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });
  try {

    let response = await fetch(targetUrl.toString(), {
      method: context.request.method,
      headers: new Headers(context.request.headers),
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

