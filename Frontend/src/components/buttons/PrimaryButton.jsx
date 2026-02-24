export default function PrimaryButton({ children, loading, type = "button", onClick }) {
  return (
    <button
      type={type}
      disabled={loading}
      onClick={onClick}
      className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-xl text-sm font-semibold
        hover:bg-gray-800 dark:hover:bg-zinc-100 transition disabled:opacity-50 cursor-pointer mt-1"
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}