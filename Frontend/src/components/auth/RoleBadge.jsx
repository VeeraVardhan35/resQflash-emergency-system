export default function RoleBadge({ role }) {
  const colors = {
    ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
    DRIVER: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300",
    HOSPITAL: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    USER: "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[role] || colors.USER}`}>
      {role || "USER"}
    </span>
  );
}
