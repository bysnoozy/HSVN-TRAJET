/// <reference lib="dom" />
import { useEffect, useRef } from "react";

interface Props {
  handle: string;
}

let widgetsScriptPromise: Promise<void> | null = null;

function loadWidgetsScript(): Promise<void> {
  const w = window as any;
  if (w.twttr?.widgets) return Promise.resolve();
  if (widgetsScriptPromise) return widgetsScriptPromise;
  widgetsScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
  return widgetsScriptPromise;
}

/** Web : injecte le widget officiel X (widgets.js) directement dans le DOM, comme sur n'importe quel site. */
export default function LineEmbedBody({ handle }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadWidgetsScript().then(() => {
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = "";
      const anchor = document.createElement("a");
      anchor.className = "twitter-timeline";
      anchor.setAttribute("data-height", "480");
      anchor.setAttribute("data-theme", "light");
      anchor.setAttribute("data-lang", "fr");
      anchor.setAttribute("data-dnt", "true");
      anchor.href = `https://twitter.com/${handle}`;
      anchor.textContent = `Publications de @${handle} sur X`;
      containerRef.current.appendChild(anchor);
      (window as any).twttr?.widgets?.load(containerRef.current);
    });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  return <div ref={containerRef} style={{ minHeight: 420 }} />;
}
