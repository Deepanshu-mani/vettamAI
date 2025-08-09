import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PageBreakComponent } from '../components/PageBreak';

export interface PageBreakOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      setPageBreak: (attrs?: { auto?: boolean }) => ReturnType;
    };
  }
}

export const PageBreak = Node.create<PageBreakOptions>({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      auto: {
        default: false,
        parseHTML: element => element.getAttribute('data-auto') === 'true',
        renderHTML: attributes => {
          if (!attributes.auto) return {}
          return { 'data-auto': 'true' }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="page-break"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'page-break',
        class: 'page-break',
        ...(node.attrs?.auto ? { 'data-auto': 'true' } : {}),
      }),
    ];
  },

  addCommands() {
    return {
      setPageBreak:
        (attrs?: { auto?: boolean }) =>
        ({ chain }) =>
          chain().insertContent({ type: this.name, attrs: attrs ?? {} }).run(),
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.setPageBreak(),
      Delete: () => {
        const { state, view } = this.editor
        const sel: any = state.selection
        if (sel?.node && sel.node.type.name === this.name) {
          view.dispatch(state.tr.delete(sel.from, sel.to))
          return true
        }
        return false
      },
      Backspace: () => {
        const { state, view } = this.editor
        const sel: any = state.selection
        if (sel?.node && sel.node.type.name === this.name) {
          view.dispatch(state.tr.delete(sel.from, sel.to))
          return true
        }
        return false
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageBreakComponent);
  },
});
