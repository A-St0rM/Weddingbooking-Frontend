import { MagnifyingGlass, X } from '@phosphor-icons/react';

export function SearchInput({ value, onChange, label, placeholder }: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}) {
  return (
    <div role="search" className="relative">
      <MagnifyingGlass aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" />
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder ?? label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        className="min-h-12 w-full rounded-control border border-control bg-surface pr-12 pl-12 text-base [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Ryd søgning"
          className="absolute inset-y-0 right-1 my-auto grid size-11 cursor-pointer place-items-center rounded-control text-ink-muted hover:text-ink"
        >
          <X className="size-5" />
        </button>
      )}
    </div>
  );
}
