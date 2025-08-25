import {
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap
} from '@codemirror/view'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import {
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldKeymap
} from '@codemirror/language'
import { history, defaultKeymap, historyKeymap, standardKeymap } from '@codemirror/commands'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap
} from '@codemirror/autocomplete'
import { lintKeymap } from '@codemirror/lint'

export const config = [
  history(), //  CTRL Z
  keymap.of([
    ...standardKeymap, // This includes basic copy/paste shortcuts
    ...historyKeymap //  CTRL Z
  ])
]
