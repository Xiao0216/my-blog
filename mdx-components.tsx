import type { MDXComponents } from "mdx/types"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => (
      <h2
        className="mt-16 font-heading text-4xl leading-tight text-foreground"
        {...props}
      />
    ),
    p: (props) => (
      <p className="mt-6 text-lg leading-9 text-foreground/90" {...props} />
    ),
    blockquote: (props) => (
      <blockquote
        className="mt-8 border-l-2 border-primary/60 pl-5 italic text-muted-foreground"
        {...props}
      />
    ),
    a: (props) => (
      <a
        className="text-primary underline-offset-4 hover:underline"
        {...props}
      />
    ),
    ...components,
  }
}
