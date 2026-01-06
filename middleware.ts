import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rota de auth - verifica se já está logado
  if (pathname === '/auth') {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (token) {
      // Já está logado, redireciona para dashboard
      return NextResponse.redirect(new URL('/dash', request.url))
    }
    // Não está logado, permite acessar a página de auth
    return NextResponse.next()
  }

  // Rota de escolha de role - apenas para usuários autenticados SEM role definido
  if (pathname === '/dash/choose-role') {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Se já tem role definido (não é BUSINESS padrão ou já escolheu), redireciona para dashboard
    if (token.role && token.role !== 'BUSINESS') {
      return NextResponse.redirect(new URL('/dash', request.url))
    }

    return NextResponse.next()
  }

  // Rota de redefinição de senha - apenas para primeiro acesso
  if (pathname === '/auth/reset-password') {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Se não é primeiro acesso, redireciona para dashboard
    if (!token.first_login) {
      return NextResponse.redirect(new URL('/dash', request.url))
    }

    return NextResponse.next()
  }

  // Rotas protegidas do dashboard (exceto /auth e /dash/choose-role)
  if (pathname.startsWith('/dash')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Se não tem token, redireciona para login
    if (!token) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Se é primeiro acesso e é ADMIN, redireciona para reset de senha
    if (token.first_login && token.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/reset-password', request.url))
    }

    // Permite acesso
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dash/:path*', '/auth', '/auth/reset-password'],
}
