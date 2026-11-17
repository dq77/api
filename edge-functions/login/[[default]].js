
export async function onRequest(context) {
  
  const url = new URL(context.request.url);
  const pathname = url.pathname.replace('/login', '');
  const targetUrl = new URL('https://login.italent.cn' + pathname);
  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  try {
    // 两个必要的请求头转发
    const proxyHeaders = new Headers();
    const userAgent = context.request.headers.get('User-Agent');
    if (userAgent) proxyHeaders.set('User-Agent', userAgent);
    proxyHeaders.set('Content-Type', 'application/json;charset=utf-8');
    proxyHeaders.set('Host', 'login.italent.cn');
    let response = await fetch(targetUrl.toString(), {
      method: context.request.method,
      headers: proxyHeaders,
      body: context.request.body
    });


    const newResponse = new Response(response.body, response);
    // 获取所有 Set-Cookie 头（可能是数组）
    const setCookies = response.headers.get('Set-Cookie');
    if (setCookies) {
      // 按逗号分割多个 Cookie（注意：某些情况下可能需要更复杂的分割逻辑）
      const cookies = setCookies.split(/,\s*(?=ssn_)/);
      cookies.forEach(cookie => {
        const newCookie = cookie.replace(' domain=italent.cn;', '');
        newResponse.headers.append('Set-Cookie', newCookie);
      })
    }
    return newResponse;
  } catch (error) {
    return new Response('Error: ' + error.message, { status: 500 });
  }
}

