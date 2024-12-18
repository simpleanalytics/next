"use client";

import { useSimpleAnalytics } from "@simpleanalytics/next/client";
import { useState } from "react";

export default function Home() {
  const { trackEvent } = useSimpleAnalytics();
  const [count, setCount] = useState(0);

  return (
    <div className="">
      <h1>Count: {count}</h1>
      <button
        onClick={() => {
          setCount((count) => count + 1);
          trackEvent("clicked", { count });
        }}
      >
        increment
      </button>
    </div>
  );
}
