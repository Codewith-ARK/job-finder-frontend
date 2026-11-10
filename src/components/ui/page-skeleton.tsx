export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden="true">
      <div className="space-y-3 border-b border-slate-200 pb-7">
        <div className="h-2.5 w-28 rounded-full bg-slate-200" />
        <div className="h-10 w-72 max-w-full rounded-lg bg-slate-200" />
        <div className="h-4 w-96 max-w-full rounded bg-slate-100" />
      </div>
      <div className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="space-y-4 bg-surface p-5">
            <div className="h-2.5 w-24 rounded-full bg-slate-200" />
            <div className="h-8 w-16 rounded bg-slate-200" />
            <div className="h-3 w-32 rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="panel h-80 p-6">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="mt-4 h-3 w-64 max-w-full rounded bg-slate-100" />
          <div className="mt-8 space-y-4">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-14 rounded-lg bg-slate-100" />
            ))}
          </div>
        </div>
        <div className="panel h-80 p-6">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="mt-6 space-y-5">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-3 w-full rounded bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
