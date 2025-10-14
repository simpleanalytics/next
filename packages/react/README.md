# Simple Analytics for React

This package provides a simple way to add privacy-friendly pageview and event tracking using Simple Analytics to your React application.

## Installation

To install the package, run:

```bash
npm i @simpleanalytics/react
```

## Usage

### Include the analytics script

The client-side analytics component, `SimpleAnalytics`, imports the Simple Analytics tracking script.

```tsx
import { SimpleAnalytics } from "@simpleanalytics/react";

export default function App() {
  return (
    <div>
      {/* ... rest of your app */}
      <SimpleAnalytics />
    </div>
  );
}
```

By default, the script will be loaded from `https://scripts.simpleanalyticscdn.com/latest.js`. If you use a custom domain for your scripts, you can pass it as a prop:

```tsx
<SimpleAnalytics domain="custom.domain.com" />
```

### Tracking events

To start programmatically tracking events use the `trackEvent` function.
This requires the `<SimpleAnalytics />` component to be present in your application.

```tsx
import { trackEvent } from "@simpleanalytics/react";

export default function MyComponent() {
  return (
    <button
      onClick={() => {
        trackEvent("clicked");
      }}
    >
      Track event
    </button>
  );
}
```
