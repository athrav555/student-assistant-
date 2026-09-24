import ReactMarkdown, { type Components } from "react-markdown";

interface NotesViewProps {
  notes: string[];
}

// Defined once, outside the component, so react-markdown doesn't see a new
// `components` object (and re-render every custom element) on every render.
// Each renderer ignores react-markdown's internal `node` prop rather than
// spreading it onto a real DOM element.
const markdownComponents: Components = {
  h1: ({ node: _node, ...props }) => (
    <h3 className="font-display text-xl font-semibold text-forest" {...props} />
  ),
  h2: ({ node: _node, ...props }) => (
    <h3 className="font-display text-xl font-semibold text-forest" {...props} />
  ),
  h3: ({ node: _node, ...props }) => (
    <h4 className="font-display text-lg font-semibold text-forest" {...props} />
  ),
  p: ({ node: _node, ...props }) => <p className="mt-3 leading-relaxed text-ink" {...props} />,
  ul: ({ node: _node, ...props }) => <ul className="mt-3 list-none space-y-2" {...props} />,
  li: ({ node: _node, children, ...props }) => (
    <li className="flex gap-2 leading-relaxed text-ink" {...props}>
      <span aria-hidden className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
      <span>{children}</span>
    </li>
  ),
  strong: ({ node: _node, ...props }) => <strong className="font-semibold text-ink" {...props} />,
};

export default function NotesView({ notes }: NotesViewProps) {
  if (notes.length === 0) {
    return <p className="text-ink-soft">No notes were generated for this document.</p>;
  }

  return (
    <div className="space-y-8">
      {notes.map((section, i) => (
        <article key={i} className={i > 0 ? "border-t border-line pt-8" : ""}>
          <ReactMarkdown components={markdownComponents}>{section}</ReactMarkdown>
        </article>
      ))}
    </div>
  );
}
