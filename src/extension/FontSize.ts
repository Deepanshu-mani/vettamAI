import { Extension } from "@tiptap/core"

export const FontSize = Extension.create({
  name: "fontSize",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null as string | null,
            parseHTML: (element: HTMLElement) => {
              const value = element.style.fontSize
              return value || null
            },
            renderHTML: (attributes: { fontSize?: string | null }) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().extendMarkRange("textStyle").setMark("textStyle", { fontSize }).run(),

      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .extendMarkRange("textStyle")
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    }
  },
})


