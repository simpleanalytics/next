export interface VercelRequestContextValue {
  headers: Record<string, string | undefined>;
  url: string;
  [key: symbol]: unknown;
}

type VercelRequestContext = {
  get(): VercelRequestContextValue | undefined;
};

const symbol = Symbol.for("@vercel/request-context");

interface Global {
  [symbol]?: VercelRequestContext;
}

export function getVercelRequestContext():
  | VercelRequestContextValue
  | undefined {
  const requestContext = (globalThis as Global)[symbol];

  return requestContext?.get();
}
