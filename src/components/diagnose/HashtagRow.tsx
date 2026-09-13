export function HashtagRow({ items }: { items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center rounded-full border border-brand-gray300 px-2.5 py-1.5 text-xs font-medium leading-normal text-brand-gray800"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
