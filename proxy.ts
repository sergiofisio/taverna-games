import { NextResponse, type NextRequest } from "next/server";

const LANGUAGE_HEADER = 'x-site-lang'
const EN_PREFIX = '/en'

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const english = pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`)

  if (!english && request.method === 'GET' && request.cookies.get('lang')?.value === 'en') {
    return NextResponse.redirect(new URL(`${EN_PREFIX}${pathname === '/' ? '' : pathname}${search}`, request.url))
  }

  const headers = new Headers(request.headers)
  headers.set(LANGUAGE_HEADER, english ? 'en' : 'pt')
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!api|admin|auth|_next|.*\\.[a-z0-9]+$|.*opengraph-image).*)'],
}
