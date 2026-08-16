// Minimal Scriban/mustache highlighting for CodeMirror 6.
// Highlights `{{ ... }}` regions (delimiters, keywords, comments, values) without
// pulling in a full grammar. Colors mirror the cheat-sheet under the editor:
// blue for values/braces, purple for control keywords, gray for comments.
import { StreamLanguage, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Prec } from '@codemirror/state';
import { tags as t } from '@lezer/highlight';

const KEYWORDS = /^(for|end|if|else|in|while|func|ret|break|continue|capture|case|when|do|with|wrap|tablerow)\b/;

const scribanParser = StreamLanguage.define<{ inTag: boolean }>({
  startState: () => ({ inTag: false }),
  token(stream, state) {
    if (!state.inTag) {
      if (stream.match(/^\{\{-?/)) {
        state.inTag = true;
        return 'brace';
      }
      // Plain text between tags: advance to the next `{{` (always consuming ≥1 char).
      while (!stream.eol() && !stream.match(/^\{\{/, false)) stream.next();
      return null;
    }
    // Inside a `{{ ... }}` tag.
    if (stream.match(/^-?\}\}/)) {
      state.inTag = false;
      return 'brace';
    }
    if (stream.peek() === '#') {
      while (!stream.eol() && !stream.match(/^-?\}\}/, false)) stream.next();
      return 'comment';
    }
    if (stream.match(KEYWORDS)) return 'keyword';
    if (stream.match(/^"(?:[^"\\]|\\.)*"?/)) return 'string';
    if (stream.match(/^'(?:[^'\\]|\\.)*'?/)) return 'string';
    if (stream.match(/^\d+(?:\.\d+)?/)) return 'number';
    if (stream.match(/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*/)) return 'variable';
    if (stream.match(/^[-+*/%=!<>|&.?:,()[\]]+/)) return 'operator';
    stream.next();
    return null;
  },
  tokenTable: {
    brace: t.brace,
    keyword: t.keyword,
    comment: t.lineComment,
    string: t.string,
    number: t.number,
    variable: t.variableName,
    operator: t.operator,
  },
});

const scribanHighlight = HighlightStyle.define([
  { tag: t.brace, color: '#2563eb', fontWeight: 'bold' }, // {{ }}
  { tag: t.keyword, color: '#9333ea', fontWeight: 'bold' }, // for / if / end
  { tag: t.lineComment, color: '#9ca3af', fontStyle: 'italic' },
  { tag: t.string, color: '#16a34a' },
  { tag: t.number, color: '#c2410c' },
  { tag: t.variableName, color: '#2563eb' }, // var.path
  { tag: t.operator, color: '#d97706' },
]);

// Prec.highest so our colors win over basic-setup's default highlight style.
export const scribanLanguage = [scribanParser, Prec.highest(syntaxHighlighting(scribanHighlight))];
