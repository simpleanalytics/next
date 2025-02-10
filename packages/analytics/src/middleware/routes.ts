interface RoutesModule {
  pattern: RegExp;
}

export async function isExistingRoute(path: string) {
  // @ts-expect-error
  const { pattern }: RoutesModule = await import("/.simpleanalytics/routes.js");

  return pattern.test(path);
}
