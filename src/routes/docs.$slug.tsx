import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/site-layout";
import { Panel } from "@/components/pink/primitives";
import { docBySlug, docSections } from "@/lib/content";

export const Route = createFileRoute("/docs/$slug")({
  loader: ({ params }) => {
    const doc = docBySlug(params.slug);
    if (!doc) throw notFound();
    return { doc };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Guide not found | PINK docs" }, { name: "robots", content: "noindex" }] };
    }
    const { doc } = loaderData;
    return {
      meta: [
        { title: `${doc.title} | PINK docs` },
        { name: "description", content: doc.summary },
        { property: "og:title", content: `${doc.title} — PINK docs` },
        { property: "og:description", content: doc.summary },
      ],
    };
  },
  notFoundComponent: DocNotFound,
  component: DocPage,
});

function DocNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-pink">Docs</p>
        <h1 className="mt-4 font-display text-3xl font-semibold">That guide doesn't exist.</h1>
        <p className="mt-3 text-fog">It may have been renamed. The index lists everything we have.</p>
        <Link
          to="/docs"
          className="mt-6 inline-block rounded-md bg-pink px-5 py-3 font-medium text-ink hover:bg-white"
        >
          Back to documentation
        </Link>
      </div>
    </SiteLayout>
  );
}

function DocPage() {
  const { doc } = Route.useLoaderData();
  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Guides</p>
          <nav className="mt-4 space-y-1">
            {docSections.map((d) => (
              <Link
                key={d.slug}
                to="/docs/$slug"
                params={{ slug: d.slug }}
                className="block rounded-md px-3 py-2 text-sm text-fog transition-colors hover:bg-panel hover:text-white"
                activeProps={{ className: "bg-panel text-white" }}
              >
                {d.title}
              </Link>
            ))}
          </nav>
        </aside>

        <article className="min-w-0">
          <Link to="/docs" className="font-mono text-xs text-mute hover:text-white">
            ← Documentation
          </Link>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">{doc.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-fog">{doc.summary}</p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">{doc.reading} read</p>

          <div className="mt-10 space-y-8 border-t border-line pt-10">
            {doc.body.map((b) => (
              <section key={b.h}>
                <h2 className="font-display text-xl font-semibold">{b.h}</h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-fog">{b.p}</p>
              </section>
            ))}
          </div>

          <Panel className="mt-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Next</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {docSections
                .filter((d) => d.slug !== doc.slug)
                .slice(0, 3)
                .map((d) => (
                  <Link
                    key={d.slug}
                    to="/docs/$slug"
                    params={{ slug: d.slug }}
                    className="rounded-md border border-line px-3 py-2 text-sm text-fog hover:text-white"
                  >
                    {d.title} →
                  </Link>
                ))}
            </div>
          </Panel>
        </article>
      </div>
    </SiteLayout>
  );
}
