import { NextRequest } from "next/server";
import type { PageviewServerContext, ServerContextWithPath, ServerComponentSearchParamsProp } from "./interfaces";

export function isDoNotTrackEnabled(headers: Headers) {
  return headers.has("DNT") && headers.get("DNT") === "1";
}

function parseSearchParameters(params: ServerComponentSearchParamsProp | undefined) {
  const searchParams = new URLSearchParams();

  if (!params) {
    return searchParams;
  }

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    if (typeof value === "string") {
      searchParams.append(key, value);
      continue;
    }

  
    for (const item of value) {
      searchParams.append(key, item);
    }
  }

  return searchParams;
}

export function parseServerContext(options: ServerContextWithPath): PageviewServerContext {
  if ("request" in options) {
    const searchParams = getSearchParameters(options.request);

    return {
      path: getPath(options.request),
      headers: options.request.headers,
      searchParams,
    }
  }

  return {
    path: options.path,
    headers: options.headers,
    searchParams: parseSearchParameters(options.searchParams),
  }
}

function getPath(request: Request) {
  // When request is an NextRequest, the URL will already be parsed (see Next.js implementation)
  if (request instanceof NextRequest) {
    return request.nextUrl.pathname;
  }

  return new URL(request.url).pathname;
}

function getSearchParameters(request: Request) {
  if (request instanceof NextRequest) {
    return request.nextUrl.searchParams;
  }

  return new URL(request.url).searchParams;
}
