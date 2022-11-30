import httpStatus from 'http-status';
import { NextResponse } from 'next/server';

const TRAILING_SLASH = /\/$/;

const PUBLIC_FILE = /web-cms-assets/;
const WEB_CMS_PATH = /web-cms\/api/;

// Browser version of pino is being used, so we need
// to add the values ourselves, otherwise the message
// just gets printed through the console.
// This is also the reason we are creating a new instance
// of the logger, some node functions are not allowed in
// Edge functions (which these are)
function formatRequest(req) {
  return {
    level: 30,
    time: new Date().getTime(),
    method: req.method,
    pathname: req.nextUrl.pathname,
    msg: `${req.method} performed on ${req.nextUrl.pathname}`,
    url: req.url,
    origin: req.nextUrl.origin,
  };
}

export const middleware = request => {

  // The rewrite in the config doesn't seem to apply after this middleware,
  // so we remove the web-cms-assets prefix here
  if (PUBLIC_FILE.test(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.pathname.split('/web-cms-assets')[1];
    return NextResponse.rewrite(url);
  }

  if (WEB_CMS_PATH.test(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.pathname.replace('/web-cms/api', '/api');
    return NextResponse.rewrite(url);
  }

  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('/api/') ||
    request.nextUrl.pathname.includes('/flags/') ||
    request.nextUrl.pathname.endsWith('.txt') ||
    request.nextUrl.pathname.endsWith('.xml') ||
    PUBLIC_FILE.test(request.nextUrl.pathname)
  ) {
    return;
  }

  if (request.nextUrl.locale === 'default') {
    const url = request.nextUrl.clone();
    url.pathname = `/en${url.pathname}`.replace(TRAILING_SLASH, '');
    return NextResponse.redirect(url, {
      status: httpStatus.PERMANENT_REDIRECT,
    });
  }

  return NextResponse.next();
};
