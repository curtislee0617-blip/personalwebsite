import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

// Only Python and two palettes are loaded, on the server at build time.
let highlighter: ReturnType<typeof createHighlighterCore> | undefined;
export async function highlightPython(code: string) {
  highlighter ??= createHighlighterCore({
    themes: [import("shiki/themes/github-light.mjs"), import("shiki/themes/github-dark.mjs")],
    langs: [import("shiki/langs/python.mjs")],
    engine: createJavaScriptRegexEngine(),
  });
  return (await highlighter).codeToHtml(code, {
    lang: "python",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}
