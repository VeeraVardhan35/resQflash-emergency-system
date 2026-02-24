export default function SecondaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl py-2.5 text-sm font-medium
        text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition cursor-pointer"
    >
      {children}
    </button>
  );
}