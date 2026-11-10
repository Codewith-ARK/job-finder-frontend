export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  meta,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className="enter border-b border-slate-200 pb-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          {eyebrow && (
            <div className="mb-3 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-lime ring-4 ring-lime/25"
              />
              <p className="eyebrow">{eyebrow}</p>
            </div>
          )}
          <h1 className="display-title text-[36px] leading-[1.03] text-ink sm:text-[44px]">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {meta && <div className="mt-5">{meta}</div>}
    </div>
  );
}
