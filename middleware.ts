import { headers } from 'next/headers';
import { NextFetchEvent, NextMiddleware, NextRequest, NextResponse } from 'next/server';

// Don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};

const superAuthCredentials = {
  user: process.env.NEXT_SUPER_BASIC_AUTH_USER,
  password: process.env.NEXT_SUPER_BASIC_AUTH_PASSWORD
}

// Step 2. Check HTTP Basic Auth header if present
const isSuperAuthenticated = middl(async (req: NextRequest) => {
  const encodedCredentials = (await headers()).get('authorization')?.split(' ')[1] ?? '';

  const [user, password] = Buffer.from(encodedCredentials, 'base64').toString().split(':');
  
  const isSuperMatch = user === superAuthCredentials.user && password === superAuthCredentials.password

  if (!isSuperMatch) 
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic' },
    });
}, {
  matcher(req) {
    return req.nextUrl.pathname.startsWith('/super')
  }
})


export function middleware(req: NextRequest, event: NextFetchEvent) {
  
  return middlewares(req, event, isSuperAuthenticated);
}

async function middlewares(request: NextRequest, event: NextFetchEvent, ...nextMiddlewares: NextMiddleware[]) {

  const results = await Promise.all(nextMiddlewares.map((fn) => fn(request, event)));
  const response = results.find((results) => results !== undefined);

  return response ? response : NextResponse.next();
} 

function middl(execute: (req: NextRequest) => NextResponse | void | Promise<NextResponse | void>, options: { matcher?: (req: NextRequest) => boolean | Promise<boolean> } = {}) {
  return async function (req: NextRequest): Promise<NextResponse | void> {
    const { matcher = () => true } = options;

    const isMatching = await matcher(req);
    
    if (!isMatching) return;
    
    return await execute(req);
  }
}

