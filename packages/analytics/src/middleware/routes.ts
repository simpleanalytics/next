interface RoutesModule {
  pattern: RegExp;
}

const INTERNAL_ANALYTICS_PATHS = /^\/(proxy\.js|auto-events\.js|simple\/.*)$/;

export async function isIndexedRoute(path: string) {
  if (INTERNAL_ANALYTICS_PATHS.test(path)) {
    return false;
  }

  // @ts-expect-error
  const { pattern }: RoutesModule = await import("DO_NOT_USE_OR_JEAN_WILL_GET_FIRED");

  return pattern.test(path);
}
