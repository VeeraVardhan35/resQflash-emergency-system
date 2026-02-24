export default function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
      <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium tracking-wide uppercase">{label}</span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
    </div>
  );
}
