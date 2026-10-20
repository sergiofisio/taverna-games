import { NextResponse, type NextRequest } from "next/server";

const LANGUAGE_HEADER = 'x-site-lang'
const EN_PREFIX = '/en'
// Behind Nginx the forwarded proto is https while the Node server only speaks http.
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const headers = new Headers(request.headers)

  if (pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`)) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(EN_PREFIX.length) || '/'
    if (LOCAL_HOSTS.has(url.hostname)) url.protocol = 'http:'
    headers.set(LANGUAGE_HEADER, 'en')
    return NextResponse.rewrite(url, { request: { headers } })
  }

  if (request.method === 'GET' && request.cookies.get('lang')?.value === 'en') {
    return NextResponse.redirect(new URL(`${EN_PREFIX}${pathname === '/' ? '' : pathname}${search}`, request.url))
  }

  headers.set(LANGUAGE_HEADER, 'pt')
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!api|admin|auth|_next|.*\\.[a-z0-9]+$|.*opengraph-image).*)'],
}
