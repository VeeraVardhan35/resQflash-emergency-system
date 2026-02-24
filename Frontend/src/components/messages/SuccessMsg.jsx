export default function SuccessMsg({ msg }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-500/30 rounded-lg px-3 py-2">
      {msg}
    </p>
  );
}
