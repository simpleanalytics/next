"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { trackEvent } from "@simpleanalytics/next/server";

export async function exampleAction() {
  // Add your logic...

  after(async () => {
    await trackEvent("event_in_example_action", {
      // When running on Vercel passing the headers is not necessary.
      headers: await headers(),
    });
  });

  return { success: true };
}