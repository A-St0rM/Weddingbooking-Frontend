import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CaretRight, Plus } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import type { Package } from '@/lib/api/types';
import { formatKroner } from '@/lib/format';
import { packageKindLabels } from '@/lib/labels';
import { usePermissions } from '@/features/auth/permissions';
import { usePackages } from '@/features/packages/api/packages';
import { SurchargeCard } from '@/features/packages/components/SurchargeCard';

function byYear(packages: Package[]) {
  const years = new Map<number, Package[]>();
  for (const pkg of packages) years.set(pkg.year, [...(years.get(pkg.year) ?? []), pkg]);
  return [...years].sort(([a], [b]) => b - a);
}

/** A package's price as a line of text: "1.495 kr. pr. gæst" — the API's numbers, only formatted. */
function priceText(pkg: Package) {
  return pkg.lines
    .map((line) => `${formatKroner(line.unitPrice)} ${line.pricing === 'PerGuest' ? 'pr. gæst' : `× ${line.quantity}`}`)
    .join(' + ');
}

export function PackageListPage() {
  const { manages } = usePermissions();
  const [showInactive, setShowInactive] = useState(false);
  const query = usePackages(showInactive);

  return (
    <>
      <PageHeader
        title="Pakker og priser"
        description="En pakke kopieres ind på bookingen. En ændret pris her rører ikke bookinger, der allerede har den."
        actions={
          manages && (
            <Link to="/pakker/ny" className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 font-medium text-on-primary hover:bg-primary-hover">
              <Plus aria-hidden="true" weight="bold" className="size-4" /> Ny pakke
            </Link>
          )
        }
      />
      <SurchargeCard />

      <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="size-5 accent-primary" />
        Vis udgåede pakker
      </label>

      <div className="mt-3">
        <QueryState query={query}>
          {(packages) =>
            packages.length === 0 ? (
              <EmptyState title="Ingen pakker" />
            ) : (
              <div className="space-y-6">
                {byYear(packages).map(([year, items]) => (
                  <section key={year}>
                    <h2 className="mb-2 text-sm font-semibold text-ink-muted">{year}</h2>
                    <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card">
                      {items.map((pkg) => (
                        <li key={pkg.id}>
                          <Link to={`/pakker/${pkg.id}`} className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-neutral-soft">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium">{pkg.name}</p>
                              <p className="text-sm text-ink-muted tabular">{priceText(pkg)}</p>
                            </div>
                            <Badge tone={pkg.kind === 'Base' ? 'primary' : 'neutral'}>{packageKindLabels[pkg.kind]}</Badge>
                            {!pkg.isActive && <Badge tone="warn">Udgået</Badge>}
                            <CaretRight aria-hidden="true" className="size-4 shrink-0 text-ink-muted" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )
          }
        </QueryState>
      </div>
    </>
  );
}
