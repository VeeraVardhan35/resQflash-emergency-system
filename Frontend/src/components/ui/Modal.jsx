export default function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm relative border border-transparent dark:border-zinc-800">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-200 transition text-base leading-none cursor-pointer"
            type="button"
          >
            x
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
