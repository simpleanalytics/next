import {
  existsSync,
  writeFileSync,
  readdirSync,
  statSync,
  mkdirSync,
} from "node:fs";
import { resolve, join, extname, relative } from "node:path";

interface RouteInfo {
  /** The relative path to the page file */
  page: string;
  /** The URL pattern for this route */
  pattern: string;
  /** Regular expression to match this route */
  regex: string;
  /** Parameters that can be extracted from this route */
  params: string[];
}

const PAGE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const EXCLUDED_FILES = new Set(["_app", "_document", "_error", "404", "500"]);
const APP_PAGE_FILES = new Set(["page.tsx", "page.jsx", "page.js", "page.mjs"]);
const APP_ROUTE_FILES = new Set(["route.ts", "route.js", "route.mjs"]);

let routes: RouteInfo[] = [];

/**
 * Determines if a file is a valid route file based on its name and directory type
 */
function isRouteFile(filename: string, isAppDir: boolean): boolean {
  if (isAppDir) {
    return APP_PAGE_FILES.has(filename) || APP_ROUTE_FILES.has(filename);
  }

  const ext = extname(filename);
  const name = filename.replace(ext, "");
  return PAGE_EXTENSIONS.has(ext) && !EXCLUDED_FILES.has(name);
}

/**
 * Converts a pages directory route path to a regex pattern and extracts parameter names
 */
function createPagesRoutePattern(routePath: string): {
  regex: string;
  params: string[];
} {
  // Normalize slashes and remove leading/trailing ones
  const normalizedPath = routePath
    .replace(/\\/g, "/") // Normalize slashes
    .replace(/\/+/g, "/") // Remove duplicate slashes
    .replace(/^\/|\/$/g, ""); // Remove leading and trailing slashes

  const params: string[] = [];

  // Convert the path to regex, handling different parameter types
  const regexPattern = normalizedPath
    .split("/")
    .map((segment) => {
      // Optional catch-all parameter [[...param]]
      if (segment.match(/^\[\[\.\.\.(\w+)]]$/)) {
        const param = segment.match(/^\[\[\.\.\.(\w+)]]$/)?.[1] || "";
        params.push(param);
        return "(?:/(.*))?";
      }
      // Catch-all parameter [...param]
      if (segment.match(/^\[\.\.\.(\w+)]$/)) {
        const param = segment.match(/^\[\.\.\.(\w+)]$/)?.[1] || "";
        params.push(param);
        return "/(.+)";
      }
      // Dynamic parameter [param]
      if (segment.match(/^\[(\w+)]$/)) {
        const param = segment.match(/^\[(\w+)]$/)?.[1] || "";
        params.push(param);
        return "/([^/]+)";
      }
      // Static segment
      return segment ? `/${segment}` : "";
    })
    .join("");

  // Create the final regex pattern
  const finalPattern = `^${regexPattern || "/"}$`;

  return {
    regex: finalPattern,
    params,
  };
}

/**
 * Converts an app directory route path to a regex pattern and extracts parameter names
 */
function createAppRoutePattern(routePath: string): {
  regex: string;
  params: string[];
} {
  // Remove route groups and normalize slashes
  const normalizedPath = routePath
    .replace(/\(.*?\)\//g, "") // Remove route groups
    .replace(/\\/g, "/") // Normalize slashes
    .replace(/\/+/g, "/") // Remove duplicate slashes
    .replace(/^\/|\/$/g, ""); // Remove leading and trailing slashes

  const params: string[] = [];

  // Convert the path to regex, handling different parameter types
  const regexPattern = normalizedPath
    .split("/")
    .map((segment) => {
      // Optional catch-all parameter [[...param]]
      if (segment.match(/^\[\[\.\.\.(\w+)]]$/)) {
        const param = segment.match(/^\[\[\.\.\.(\w+)]]$/)?.[1] || "";
        params.push(param);
        return "(?:/(.*))?";
      }
      // Catch-all parameter [...param]
      if (segment.match(/^\[\.\.\.(\w+)]$/)) {
        const param = segment.match(/^\[\.\.\.(\w+)]$/)?.[1] || "";
        params.push(param);
        return "/(.+)";
      }
      // Dynamic parameter [param]
      if (segment.match(/^\[(\w+)]$/)) {
        const param = segment.match(/^\[(\w+)]$/)?.[1] || "";
        params.push(param);
        return "/([^/]+)";
      }
      // Static segment
      return segment ? `/${segment}` : "";
    })
    .join("");

  // Create the final regex pattern
  const finalPattern = `^${regexPattern || "/"}$`;

  return {
    regex: finalPattern,
    params,
  };
}

/**
 * Recursively collects routes from pages directory
 */
function collectPageRoutesRecursively(dir: string, base = ""): RouteInfo[] {
  try {
    const collected: RouteInfo[] = [];
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        // Skip special directories
        if (item.startsWith("_") || item === "api") continue;

        // Recursively collect routes from subdirectories
        collected.push(
          ...collectPageRoutesRecursively(fullPath, join(base, item)),
        );
      } else if (isRouteFile(item, false)) {
        // Get the route path without the extension
        const routePath = join(
          base,
          item.replace(/\.(js|jsx|ts|tsx)$/, ""), // Remove extension
        ).replace(/\/index$/, ""); // Remove index from path

        // Generate the URL pattern and regex
        const { regex, params } = createPagesRoutePattern(routePath);
        const pattern = `/${routePath}`.replace(/\/+/g, "/");

        collected.push({
          page: relative(dir, fullPath),
          pattern: pattern === "/" ? "/" : pattern.replace(/\/$/, ""), // Normalize trailing slashes
          regex,
          params,
        });
      }
    }

    return collected;
  } catch (error) {
    console.error(`Error collecting routes from ${dir}:`, error);
    return [];
  }
}

/**
 * Recursively collects routes from app directory
 */
function collectAppRoutesRecursively(dir: string, base = ""): RouteInfo[] {
  try {
    const collected: RouteInfo[] = [];
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        // Skip special directories like api
        if (item.startsWith("api")) continue;

        // For route groups, remove the group name but keep processing the contents
        const nextBase =
          item.startsWith("(") && item.endsWith(")")
            ? base // Keep the same base for route groups
            : join(base, item);

        // Recursively collect routes from subdirectories
        collected.push(...collectAppRoutesRecursively(fullPath, nextBase));
      } else if (isRouteFile(item, true)) {
        // Only process page.tsx files (or similar)
        if (!APP_PAGE_FILES.has(item)) continue;

        // Generate the URL pattern and regex
        const { regex, params } = createAppRoutePattern(base);
        const pattern = `/${base}`.replace(/\/+/g, "/");

        collected.push({
          page: relative(dir, fullPath),
          pattern: pattern === "/" ? "/" : pattern.replace(/\/$/, ""),
          regex,
          params,
        });
      }
    }

    return collected;
  } catch (error) {
    console.error(`Error collecting routes from ${dir}:`, error);
    return [];
  }
}

/**
 * Creates a combined regex pattern that matches any of the given routes
 */
function createCombinedRoutePattern(routes: RouteInfo[]): string {
  // Get all unique regex patterns without the ^ and $ anchors
  const patterns = routes.map((route) => route.regex.slice(1, -1));

  // Join them with OR operator and add anchors
  // Add (?:[?#].*)?$ to optionally match query params and hash fragments at the end
  return `^(?:${patterns.join("|")})(?:[?#].*)?$`;
}

/**
 * Writes collected routes to a file in the .simpleanalytics directory
 */
function writeRoutesToFile(dir: string, routes: RouteInfo[]): void {
  try {
    const routesDir = resolve(dir, ".simpleanalytics");
    if (!existsSync(routesDir)) {
      mkdirSync(routesDir, { recursive: true });
    }

    const middlewareRoutesPath = resolve(routesDir, "routes.js");
    const combinedPattern = createCombinedRoutePattern(routes);

    // Escape forward slashes and other special characters for regex literal
    const escapedPattern = combinedPattern.slice(1, -1).replace(/\//g, "\\/");

    const routesContent = `
// This file is auto-generated at build time.
// Do not edit this file manually.

export const routes = ${JSON.stringify(routes, null, 2)};

// Original regex pattern (for debugging):
// ${combinedPattern}

// Combined regex pattern that matches any of the above routes
export const pattern = /${escapedPattern}/;

// Example usage:
// const isValidRoute = pattern.test('/some/path');
`.trim();

    writeFileSync(middlewareRoutesPath, routesContent);
  } catch (error) {
    console.error("Error writing routes file:", error);
  }
}

/**
 * Determines the project structure and returns the appropriate base directory
 */
function getBaseDir(dir: string) {
  const usesSrc =
    existsSync(join(dir, "src", "pages")) ||
    existsSync(join(dir, "src", "app"));
  return usesSrc ? join(dir, "src") : dir;
}

export function resolveRoutes() {
  const baseDir = getBaseDir(process.cwd());
  const pagesDir = join(baseDir, "pages");
  const appDir = join(baseDir, "app");

  routes = [];

  // Collect Page routes
  if (existsSync(pagesDir)) {
    routes.push(...collectPageRoutesRecursively(pagesDir));
  }

  // Collect App routes
  if (existsSync(appDir)) {
    routes.push(...collectAppRoutesRecursively(appDir));
  }

  // Write collected routes to file
  writeRoutesToFile(process.cwd(), routes);

  return "./.simpleanalytics/routes.js";
}