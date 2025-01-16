const UTM_PARAMS = ["source", "medium", "content", "term", "campaign"] as const;

function parseUtmParameter(name: string, strictUtm: boolean) {
  if (strictUtm) {
    return UTM_PARAMS.find((param) => name === `utm_${param}`);
  }

  if (name === "ref") {
    return "source";
  }

  return UTM_PARAMS.find((param) => name === `utm_${param}` || name === param);
}

interface UtmOptions {
  strictUtm: boolean;
}

interface UtmParameters {
  source?: string | undefined;
  campaign?: string | undefined;
  medium?: string | undefined;
  content?: string | undefined;
  term?: string | undefined;
}

export function parseUtmParameters(searchParams: URLSearchParams, options: UtmOptions) {
  const params: UtmParameters = {};

  for (const [name, value] of searchParams.entries()) {
    const param = parseUtmParameter(name, options.strictUtm);

    if (param) {
      params[param] = value;
    }
  }

  return params;
}
