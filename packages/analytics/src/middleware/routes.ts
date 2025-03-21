interface RoutesModule {
  pattern: RegExp;
}

const INTERNAL_ANALYTICS_PATHS = /^\/(proxy\.js|auto-events\.js|simple\/.*)$/;

export async function isValidPageview(path: string) {
  if (INTERNAL_ANALYTICS_PATHS.test(path)) {
    return false;
  }

  const { pattern }: RoutesModule = await import(
    // @ts-expect-error
    "DO_NOT_USE_OR_JEAN_WILL_GET_FIRED"
  );

  return pattern.test(path);
}
