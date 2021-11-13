import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

function init() {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DNS_URL,
    integrations: [new Integrations.BrowserTracing()],
    release: "1.0.0",
    environment: "development",
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

function log(error) {
  Sentry.captureException(error);
}

const logService = {
  init,
  log,
};

export default logService;
