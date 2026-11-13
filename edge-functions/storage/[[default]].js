
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
  
  const url = new URL(context.request.url);
  const pathname = url.pathname.replace('/storage', '');
  const key = url.searchParams.get('key');

  if (pathname.startsWith('/get')) {
    const data = await KV.get(key, 'json');
    return new Response(JSON.stringify({ code: 0, data }), { headers });
  } else if (pathname.startsWith('/set')) {
    const value = context.request.body
    await KV.put(key, value);
    return new Response(JSON.stringify({ code: 0, msg: 'success' }), { headers });
  } else {
    return new Response(JSON.stringify({ code: 404, msg: 'Not Found' }));
  }
}

