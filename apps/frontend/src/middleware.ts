import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const host = request.headers.get('host') || '';

    // Перехватываем запросы со старого домена и делаем 301 редирект
    if (host === 'tdrusstankosbyt.ru' || host === 'www.tdrusstankosbyt.ru') {
        const url = request.nextUrl.clone();
        url.host = 'td-rss.ru';
        url.port = ''; // очищаем порт на всякий случай
        return NextResponse.redirect(url, 301);
    }
}

export const config = {
    // Выполнять middleware для всех путей, кроме служебных
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
