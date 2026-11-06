
export async function onRequest(context) {
  const headers = {
    'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  }
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  // 根据URL匹配路由
  const url = new URL(context.request.url);
  const pathname = url.pathname.replace('/glm/', '/');
  const targetUrl = new URL('https://open.bigmodel.cn' + pathname);

  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });
  try {
    const proxyHeaders = new Headers();
    const contentType = context.request.headers.get('Content-Type');
    if (contentType) proxyHeaders.set('Content-Type', contentType);
    const Authorization = context.request.headers.get('Authorization');
    if (Authorization) proxyHeaders.set('Authorization', Authorization);
    let response = await fetch(targetUrl.toString(), {
      method: context.request.method,
      headers: proxyHeaders,
      body: context.request.body
    });


    // 克隆响应并添加 CORS 头
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', context.request.headers.get('Origin') || '*');
    newResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    return newResponse;
  } catch (error) {
    return new Response('Error: ' + error.message, { status: 500 });
  }
}

