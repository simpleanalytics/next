export function isDoNotTrackEnabled(headers: Headers) {
  return headers.has("DNT") && headers.get("DNT") === "1";
}
