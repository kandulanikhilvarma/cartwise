import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

const protectedPaths = ['/home', '/scan', '/grocery', '/barcode', '/settings']

export default auth((request: NextRequest) => {
  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))
  const isAuthed = Boolean((request as NextRequest & { auth?: unknown }).auth)

  if (!isProtected) {
    return NextResponse.next()
  }

  if (isAuthed) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/login', request.url)
  return NextResponse.redirect(loginUrl)
})

export const config = {
  matcher: ['/home/:path*', '/scan/:path*', '/grocery/:path*', '/barcode/:path*', '/settings/:path*'],
}