import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import {
  type Highlighter,
  type RegexEngine,
  createHighlighter,
} from "shiki/bundle/web";

let jsEngine: RegexEngine | null = null;
let highlighter: Promise<Highlighter> | null = null;

// Settings for UI components
const Themes = {
  light: "github-light",
  dark: "github-dark",
};


const getJsEngine = (): RegexEngine => {
  jsEngine ??= createJavaScriptRegexEngine();
  return jsEngine;
};

const highlight = async (): Promise<Highlighter> => {
    highlighter ??= createHighlighter({
      langs: ["ts", "tsx"],
      themes: ["github-light", "github-dark"],
      engine: getJsEngine(),
    });
    return highlighter;
  };
export { highlight, Themes };
