interface RoutesModule {
  pattern: RegExp;
}

export async function isExistingRoute(path: string) {
  if (process.env.EXPERIMENTAL_ANALYTICS_MIDDLEWARE !== "1") {
    return true;
  }

  // @ts-expect-error
  const { pattern }: RoutesModule = await import("/.simpleanalytics/routes.js");

  return pattern.test(path);
}
