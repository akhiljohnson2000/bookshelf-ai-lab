interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-xl">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by title, author, or genre…"
        aria-label="Search books"
        className="w-full rounded-full border border-cream-dark bg-white px-5 py-3 text-brown-dark shadow-sm outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/30"
      />
    </div>
  );
}
