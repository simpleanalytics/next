export const DEFAULT_ALLOWED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "source",
  "medium",
  "campaign",
  "content",
  "term",
  "ref",
];

// Paths the plugin rewrites to the Simple Analytics script and queue.
export const PROXY_PATHS = /^\/(proxy\.js|auto-events\.js|simple\/.*)$/;

// Stylesheets, JavaScript, images, fonts, audio, video and JSON (with source
// maps and web app manifests).
const SKIPPED_EXTENSIONS =
  /\.(css|js|mjs|cjs|apng|avif|bmp|gif|ico|jpe?g|png|svg|tiff?|webp|eot|otf|ttf|woff2?|aac|flac|m4a|mp3|oga|ogg|opus|wav|weba|m4v|mov|mp4|ogv|webm|json|map|webmanifest)$/i;

function isSkipped(request: Request, path: string) {
  return (
    request.method !== "GET" ||
    SKIPPED_EXTENSIONS.test(path) ||
    // Next.js build assets and the image optimizer.
    path.includes("/_next/") ||
    PROXY_PATHS.test(path) ||
    // Pages Router JSON data, which Next.js shows middleware under the page
    // path. App Router payloads cannot be told apart: Next.js removes their
    // markers before middleware runs.
    request.headers.has("x-nextjs-data")
  );
}

// Request headers copied into the body, named in lower case with underscores.
// They cannot travel under their own names: fetch sets its own Accept,
// Accept-Language, User-Agent and Sec-Fetch-Mode on the request to the queue.
const COPIED_HEADERS = {
  user_agent: "User-Agent",
  referer: "Referer",
  accept: "Accept",
  accept_language: "Accept-Language",
  sec_fetch_mode: "Sec-Fetch-Mode",
  sec_fetch_dest: "Sec-Fetch-Dest",
  sec_fetch_site: "Sec-Fetch-Site",
  sec_fetch_user: "Sec-Fetch-User",
  sec_ch_ua: "Sec-CH-UA",
  signature_agent: "Signature-Agent",
  from: "From",
} as const;

type CopiedHeaderField = keyof typeof COPIED_HEADERS;

// Address headers travel to the queue under their own names, unchanged.
// Next.js gives proxy code no connection address, but it sets X-Forwarded-For
// to that address when a request arrives without one, and Vercel sets it to
// the visitor's address.
const ADDRESS_HEADERS = [
  "X-Forwarded-For",
  "CF-Connecting-IP",
  "True-Client-IP",
] as const;

export type RequestPayload = {
  version: 1;
  platform: "nextjs";
  hostname: string;
  path: string;
  query?: string;
  test?: true;
} & { [Field in CopiedHeaderField]?: string };

function filterQuery(searchParams: URLSearchParams, allowParams: string[]) {
  const allowed = new Set([...DEFAULT_ALLOWED_PARAMS, ...allowParams]);
  const query = new URLSearchParams();

  for (const [name, value] of searchParams) {
    if (allowed.has(name)) {
      query.append(name, value);
    }
  }

  return query.toString();
}

export function buildRequestReport(
  request: Request,
  options: {
    hostname: string;
    allowParams?: string[] | undefined;
    test?: boolean | undefined;
  },
) {
  const url = new URL(request.url);

  if (isSkipped(request, url.pathname)) {
    return undefined;
  }

  const query = filterQuery(url.searchParams, options.allowParams ?? []);

  const body: RequestPayload = {
    version: 1,
    platform: "nextjs",
    hostname: options.hostname,
    path: url.pathname,
    ...(query && { query }),
    ...(options.test && { test: true }),
  };

  for (const field of Object.keys(COPIED_HEADERS) as CopiedHeaderField[]) {
    const value = request.headers.get(COPIED_HEADERS[field]);

    if (value !== null) {
      body[field] = value;
    }
  }

  const headers: Record<string, string> = {};

  for (const name of ADDRESS_HEADERS) {
    const value = request.headers.get(name);

    if (value) {
      headers[name] = value;
    }
  }

  return { body, headers };
}
