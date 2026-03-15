"use client";

import { useEffect } from "react";

export function PwaRegister(): null {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Ignore registration failures in unsupported environments.
    });
  }, []);

  return null;
}
