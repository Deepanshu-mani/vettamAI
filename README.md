# Tiptap Paginated Editor

This repository contains a minimal React + Tiptap project that demonstrates a paginated editor with headers, footers, and page breaks.

## Features

*   **Visual Page Boundaries:** The editor displays content within a view that visually separates it into A4-sized pages.
*   **Manual Page Breaks:** Users can insert manual page breaks using `Ctrl+Enter` or the page break button in the toolbar.
*   **Headers and Footers:** The editor supports dynamic headers and footers with page numbers. These are visible in the preview pane and in the final exported/printed document.
*   **Print/Export:** The editor's content can be exported to an HTML file or printed, with headers, footers, and page breaks correctly applied.
*   **Live Preview:** A live preview pane shows a miniaturized view of the final paginated document.

## How it Works

This project tackles the challenge of WYSIWYG pagination in a content-editable environment by making a few key design choices and trade-offs.

### Editor View

The main editor provides a "pageless" feel with visual cues for page separation. Instead of true pagination within the editable area (which is complex and can be slow), the editor is a single, continuous document styled to look like a series of pages.

*   **Visual Page Boundaries:** The editor's background and styling create the illusion of A4 pages stacked vertically. This is a CSS-only effect, which is robust and performant.
*   **Page Breaks:** Manual page breaks are rendered as a clear visual separator. There is no automatic page breaking in the editor view itself to avoid the performance and accuracy issues of measuring content height in real-time.

### Headers and Footers

Headers and footers are not rendered on every page within the main editor view. This is a trade-off to keep the editing experience smooth. The header and footer content is managed through controls at the top of the page, and they are applied in the following places:

*   **Page Preview Pane:** The preview pane on the right shows a live, accurate representation of the paginated document, with headers and footers on each page.
*   **Print and Export:** When the document is printed or exported to HTML, the headers and footers are correctly added to each page.

### Pagination Logic

The pagination logic is applied when the content is previewed, printed, or exported. The editor's HTML content is split into pages based on the manual page break markers (`<div data-type="page-break">`). This is a simple and reliable method for pagination that gives the user full control over the document's layout.

## Constraints and Trade-offs

*   **No "True" WYSIWYG Pagination in Editor:** The main editor does not reflow content across pages in real-time. This is a deliberate choice to avoid the complexity and performance overhead of such a system. The live preview pane serves as the WYSIWYG view.
*   **No Automatic Page Breaks in Editor:** The editor does not automatically insert page breaks as the user types. The user must insert them manually. This gives the user more control and avoids the unreliability of automatic height calculation.
*   **Headers and Footers Not Repeated in Editor:** For performance and simplicity, headers and footers are not repeated on each visual page in the main editor. They are, however, correctly applied in the preview and final output.

## How to Productionize

To make this solution production-ready, you could consider the following improvements:

*   **More Robust Height Calculation:** If automatic page breaks are a firm requirement, you could implement a more sophisticated height calculation mechanism. This might involve rendering content to a hidden `iframe` to get accurate measurements, or using a library specifically designed for this purpose.
*   **Collaborative Editing:** For multi-user support, you would need to integrate a collaborative editing solution like Hocuspocus (which is built for Tiptap).
*   **Componentization:** The main `Editor.tsx` component is quite large. It could be broken down into smaller, more manageable components for the different parts of the UI (e.g., header/footer controls, editor area).
*   **Testing:** The project currently lacks automated tests. Adding unit and integration tests (e.g., with Vitest and React Testing Library) would be crucial for a production environment.
*   **State Management:** For a larger application, you might want to use a more robust state management library (e.g., Redux, Zustand) instead of relying solely on React's `useState`.
