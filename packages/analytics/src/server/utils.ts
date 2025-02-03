export function isDoNotTrackEnabled(headers: Headers) {
  return headers.has("DNT") && headers.get("DNT") === "1";
}

export function parseRequest(request: Request) {
  const url = new URL(request.url);

  return {
    path: url.pathname,
    searchParams: url.searchParams,
  };
}
