type ChipProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

export default function Chip({ active, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
        active
          ? "border-accent bg-accent text-on-accent"
          : "border-foreground/20 hover:border-foreground/50"
      }`}
    >
      {children}
    </button>
  );
}
