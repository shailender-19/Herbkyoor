import { Container } from "@/components/ui/container";
import { PageHeader } from "./page-header";

export interface LegalSection {
  heading: string;
  body: string[];
}

/** Renders a legal/policy document from structured sections. */
export function LegalLayout({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title} />
      <Container className="py-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-forest-700/50">Last updated: {updated}</p>
          <p className="mt-4 leading-relaxed text-forest-700/80">{intro}</p>

          <div className="mt-10 space-y-9">
            {sections.map((section, i) => (
              <section key={section.heading}>
                <h2 className="text-xl font-bold text-forest-800">
                  {i + 1}. {section.heading}
                </h2>
                {section.body.map((para, j) => (
                  <p
                    key={j}
                    className="mt-3 leading-relaxed text-forest-700/75"
                  >
                    {para}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
