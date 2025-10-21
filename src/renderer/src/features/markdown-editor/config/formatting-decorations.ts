import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'

// CSS class to hide markdown syntax
export const hiddenSyntax = Decoration.mark({
  class: 'cm-hidden-syntax',
  attributes: { style: 'opacity: 0; position: absolute; pointer-events: none;' }
})

// Build decorations to hide markdown formatting in read mode
export function buildFormattingDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        const nodeName = node.name

        // Hide heading marks (##, ###, etc.)
        if (nodeName === 'HeaderMark') {
          builder.add(node.from, node.to, hiddenSyntax)
        }
        // Hide emphasis/strong marks (*, **, _, __)
        else if (nodeName === 'EmphasisMark' || nodeName === 'StrongMark') {
          builder.add(node.from, node.to, hiddenSyntax)
        }
        // Hide link syntax but keep link text visible
        else if (nodeName === 'LinkMark' || nodeName === 'URL') {
          builder.add(node.from, node.to, hiddenSyntax)
        }
        // Hide code marks (`, ```)
        else if (nodeName === 'CodeMark' || nodeName === 'CodeInfo') {
          builder.add(node.from, node.to, hiddenSyntax)
        }
        // Hide list marks (-, *, +, 1., etc.)
        else if (nodeName === 'ListMark') {
          builder.add(node.from, node.to, hiddenSyntax)
        }
        // Hide quote marks (>)
        else if (nodeName === 'QuoteMark') {
          builder.add(node.from, node.to, hiddenSyntax)
        }
      }
    })
  }

  return builder.finish()
}

// ViewPlugin to hide markdown formatting
export const hideFormattingPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = buildFormattingDecorations(view)
    }
    update(update: ViewUpdate): void {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildFormattingDecorations(update.view)
      }
    }
  },
  { decorations: (v) => v.decorations }
)
