// functions/_middleware.js
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 1. Reject POSTs bigger than 1 MB
  if (request.method === 'POST' && request.headers.get('content-length') > 1_000_000) {
    return new Response('Payload too large', { status: 413 });
  }

  // 2. Very light UA bot list
  const ua = request.headers.get('user-agent') || '';
  const bots = /bot|crawl|spider|scraping/i;
  if (bots.test(ua) && url.pathname !== '/robots.txt') {
    return new Response('Blocked', { status: 403 });
  }

  // 3. Let everything else through
  return context.next();
}