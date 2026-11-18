import { test } from "node:test";
import assert from "node:assert/strict";

import { buildRequestReport } from "../src/server/request-payload.ts";

const hostname = "example.com";

function get(url, headers = {}) {
  return new Request(url, { headers });
}

test("a page request reports the hostname setting, not the Host header", () => {
  const report = buildRequestReport(
    get("https://www.example.org/pricing", { Host: "www.example.org" }),
    { hostname },
  );

  assert.deepEqual(report.body, {
    version: 1,
    platform: "nextjs",
    hostname: "example.com",
    path: "/pricing",
  });
});

test("the query keeps only allowed parameters, in their original order", () => {
  const report = buildRequestReport(
    get(
      "https://example.com/pricing?utm_source=chatgpt.com&ref=ai&token=synthetic-secret&source=demo&email=person%40example.invalid&utm_medium=social&utm_campaign=launch&utm_content=hero&utm_term=analytics&medium=m&campaign=c&content=x&term=t",
    ),
    { hostname },
  );

  assert.equal(report.body.path, "/pricing");
  assert.equal(
    report.body.query,
    "utm_source=chatgpt.com&ref=ai&source=demo&utm_medium=social&utm_campaign=launch&utm_content=hero&utm_term=analytics&medium=m&campaign=c&content=x&term=t",
  );
});

test("the query is left out when no allowed parameter is present", () => {
  const report = buildRequestReport(
    get("https://example.com/account?token=synthetic-secret&UTM_SOURCE=upper"),
    { hostname },
  );

  assert.equal("query" in report.body, false);
});

test("allowParams adds parameters to the default list", () => {
  const report = buildRequestReport(
    get("https://example.com/?gclid=abc&utm_source=newsletter&session=1"),
    { hostname, allowParams: ["gclid"] },
  );

  assert.equal(report.body.query, "gclid=abc&utm_source=newsletter");
});

test("copied request headers travel in the body under their snake_case names", () => {
  const report = buildRequestReport(
    get("https://example.com/pricing", {
      "User-Agent": "Mozilla/5.0 (compatible; ChatGPT-User/1.0)",
      Referer: "https://chatgpt.com/",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Site": "cross-site",
      "Sec-Fetch-User": "?1",
      "Sec-CH-UA": '"Chromium";v="130"',
      "Signature-Agent": '"https://chatgpt.com"',
      From: "robot@example.invalid",
      Cookie: "session=synthetic-secret",
      Authorization: "Bearer synthetic-secret",
      "X-Forwarded-For": "203.0.113.7",
    }),
    { hostname },
  );

  assert.deepEqual(report.body, {
    version: 1,
    platform: "nextjs",
    hostname: "example.com",
    path: "/pricing",
    user_agent: "Mozilla/5.0 (compatible; ChatGPT-User/1.0)",
    referer: "https://chatgpt.com/",
    accept: "text/html,application/xhtml+xml",
    accept_language: "en-US",
    sec_fetch_mode: "navigate",
    sec_fetch_dest: "document",
    sec_fetch_site: "cross-site",
    sec_fetch_user: "?1",
    sec_ch_ua: '"Chromium";v="130"',
    signature_agent: '"https://chatgpt.com"',
    from: "robot@example.invalid",
  });
});

test("a header missing from the request is left out, an empty one is kept", () => {
  const report = buildRequestReport(
    get("https://example.com/", { "User-Agent": "" }),
    { hostname },
  );

  assert.equal(report.body.user_agent, "");
  assert.equal("referer" in report.body, false);
  assert.equal("accept" in report.body, false);
});

test("address headers pass on unchanged as headers, never in the body", () => {
  const report = buildRequestReport(
    get("https://example.com/pricing", {
      "X-Forwarded-For": "198.51.100.23, 203.0.113.7",
      "CF-Connecting-IP": "198.51.100.23",
      "True-Client-IP": "198.51.100.24",
      "X-Real-IP": "192.0.2.1",
      Cookie: "session=synthetic-secret",
      Authorization: "Bearer synthetic-secret",
    }),
    { hostname },
  );

  assert.deepEqual(report.headers, {
    "X-Forwarded-For": "198.51.100.23, 203.0.113.7",
    "CF-Connecting-IP": "198.51.100.23",
    "True-Client-IP": "198.51.100.24",
  });
  assert.deepEqual(report.body, {
    version: 1,
    platform: "nextjs",
    hostname: "example.com",
    path: "/pricing",
  });
});

test("no address header is invented when the request has none", () => {
  const report = buildRequestReport(get("https://example.com/pricing"), {
    hostname,
  });

  assert.deepEqual(report.headers, {});
});

test("only GET requests are reported", () => {
  for (const method of ["POST", "HEAD", "PUT", "DELETE", "OPTIONS"]) {
    const request = new Request("https://example.com/pricing", { method });

    assert.equal(buildRequestReport(request, { hostname }), undefined, method);
  }
});

test("stylesheets, JavaScript, images, fonts, audio, video and JSON are skipped by path", () => {
  const skipped = [
    "/styles/site.css",
    "/app.js",
    "/module.mjs",
    "/legacy.cjs",
    "/app.js.map",
    "/logo.png",
    "/photo.JPG",
    "/photo.jpeg",
    "/animation.gif",
    "/hero.webp",
    "/hero.avif",
    "/icon.svg",
    "/favicon.ico",
    "/fonts/inter.woff2",
    "/fonts/inter.woff",
    "/fonts/inter.ttf",
    "/fonts/inter.otf",
    "/podcast.mp3",
    "/sound.wav",
    "/sound.ogg",
    "/clip.mp4",
    "/clip.webm",
    "/api/data.json",
    "/manifest.webmanifest",
    "/_next/static/chunks/main.js",
    "/_next/image",
    "/docs/_next/image",
    "/simple/append",
  ];

  for (const path of skipped) {
    const request = get(`https://example.com${path}?w=64`);

    assert.equal(buildRequestReport(request, { hostname }), undefined, path);
  }
});

test("pages, unknown paths and other files are reported", () => {
  const reported = [
    "/",
    "/pricing",
    "/blog/v1.2/release-notes",
    "/page-that-does-not-exist",
    "/about.html",
    "/robots.txt",
    "/sitemap.xml",
    "/feed.rss",
    "/whitepaper.pdf",
    "/llms.txt",
  ];

  for (const path of reported) {
    const report = buildRequestReport(get(`https://example.com${path}`), {
      hostname,
    });

    assert.equal(report?.body.path, path);
  }
});

test("Pages Router data requests are skipped as JSON", () => {
  // Next.js hands middleware these /_next/data/<build>/pricing.json requests
  // with the page path, and keeps the x-nextjs-data header.
  const request = get("https://example.com/pricing", { "x-nextjs-data": "1" });

  assert.equal(buildRequestReport(request, { hostname }), undefined);
});

test("test mode asks the queue to store nothing and explain", () => {
  const request = get("https://example.com/pricing?utm_source=chatgpt.com");

  assert.deepEqual(buildRequestReport(request, { hostname, test: true }).body, {
    version: 1,
    platform: "nextjs",
    hostname: "example.com",
    path: "/pricing",
    query: "utm_source=chatgpt.com",
    test: true,
  });
  assert.equal(
    "test" in buildRequestReport(request, { hostname, test: false }).body,
    false,
  );
});
