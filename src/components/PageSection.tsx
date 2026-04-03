import type { ReactNode } from "react";

type PageSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: "glass" | "plain";
  /** Extra classes on the outer wrapper (e.g. card-hover, relative) */
  contentClassName?: string;
};

export function PageSection({
  eyebrow,
  title,
  description,
  children,
  className = "",
  variant = "glass",
  contentClassName = "",
}: PageSectionProps) {
  if (variant === "plain") {
    return (
      <section className={className}>
        {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
        {title ? (
          <h2
            className={
              eyebrow
                ? "mt-2 text-base font-semibold text-slate-900"
                : "text-base font-semibold text-slate-900"
            }
          >
            {title}
          </h2>
        ) : null}
        {description ? (
          <p
            className={
              title || eyebrow
                ? "mt-2 text-sm leading-relaxed text-slate-600"
                : "text-sm leading-relaxed text-slate-600"
            }
          >
            {description}
          </p>
        ) : null}
        {children}
      </section>
    );
  }

  const shell = `glass-card ${contentClassName}`.trim();

  return (
    <section className={className}>
      <div className={shell}>
        {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
        {title ? (
          <h2
            className={
              eyebrow
                ? "mt-2 text-base font-semibold text-slate-900"
                : "text-base font-semibold text-slate-900"
            }
          >
            {title}
          </h2>
        ) : null}
        {description ? (
          <p
            className={
              title || eyebrow
                ? "mt-2 text-sm leading-relaxed text-slate-600"
                : "text-sm leading-relaxed text-slate-600"
            }
          >
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
