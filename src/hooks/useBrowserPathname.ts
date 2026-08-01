"use client";

import { useEffect, useState } from "react";

const LOCATION_EVENT = "cake:location";
let patchCount = 0;
let originalPushState: History["pushState"] | null = null;
let originalReplaceState: History["replaceState"] | null = null;

function emitLocationChange() {
  window.dispatchEvent(new Event(LOCATION_EVENT));
}

function ensureHistoryPatched() {
  if (patchCount === 0) {
    originalPushState = window.history.pushState;
    originalReplaceState = window.history.replaceState;

    window.history.pushState = function pushStatePatched(...args) {
      const result = originalPushState!.apply(this, args);
      emitLocationChange();
      return result;
    };
    window.history.replaceState = function replaceStatePatched(...args) {
      const result = originalReplaceState!.apply(this, args);
      emitLocationChange();
      return result;
    };
  }
  patchCount += 1;
}

function releaseHistoryPatch() {
  patchCount = Math.max(0, patchCount - 1);
  if (patchCount === 0 && originalPushState && originalReplaceState) {
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    originalPushState = null;
    originalReplaceState = null;
  }
}

/** Pathname for root-layout clients without next/navigation hooks. */
export function useBrowserPathname() {
  const [pathname, setPathname] = useState("/");

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    ensureHistoryPatched();
    sync();

    window.addEventListener("popstate", sync);
    window.addEventListener(LOCATION_EVENT, sync);

    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener(LOCATION_EVENT, sync);
      releaseHistoryPatch();
    };
  }, []);

  return pathname;
}
