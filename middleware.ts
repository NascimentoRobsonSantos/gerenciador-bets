import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;

  const { pathname } = request.nextUrl;

  // Rotas que não precisam de autenticação
  const publicPaths = ['/login'];

  // Se a rota é pública, permite o acesso
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Se não há token e a rota não é pública, redireciona para o login
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Se há token, permite o acesso
  return NextResponse.next();
}

// Configuração do matcher para o middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
