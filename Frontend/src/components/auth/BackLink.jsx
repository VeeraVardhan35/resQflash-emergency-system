export default function BackLink({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-gray-500 dark:text-zinc-500 hover:text-black dark:hover:text-zinc-200 transition text-center cursor-pointer"
      type="button"
    >
      {"<- Back to sign in"}
    </button>
  );
}
