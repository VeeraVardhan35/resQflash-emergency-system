export default function Input({ label, id, type = "text", value, onChange, error, rightLabel, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        {label && (
          <label htmlFor={id} className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
            {label}
          </label>
        )}
        {rightLabel}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition
          focus:ring-2
          ${error
            ? "border-red-300 bg-red-50 dark:border-red-500/50 dark:bg-red-950/30 text-gray-900 dark:text-zinc-100"
            : "border-gray-200 bg-gray-50 hover:border-gray-300 text-gray-900 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:text-zinc-100 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-zinc-400"
          }`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}
