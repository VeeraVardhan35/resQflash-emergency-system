export default function ModalHeader({ title, subtitle }) {
  return (
    <div className="px-6 pt-6 pb-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}
