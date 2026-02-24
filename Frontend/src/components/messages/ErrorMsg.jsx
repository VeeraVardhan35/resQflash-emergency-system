export default function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 rounded-lg px-3 py-2">
      {msg}
    </p>
  );
}
