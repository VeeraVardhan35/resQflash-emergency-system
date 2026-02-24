import { useState } from "react";
import { api } from "../api/auth";
import { useAuth } from "../hooks/useAuth";
import PrimaryButton from "../components/buttons/PrimaryButton";
import SecondaryButton from "../components/buttons/SecondaryButton";
import RoleBadge from "../components/auth/RoleBadge";

export default function Dashboard() {
  const { user, accessToken, logout } = useAuth();
  const [msg, setMsg] = useState("");

  const doRefresh = async () => {
    const data = await api.post("/refresh", {});
    setMsg(data.success ? "Token refreshed" : `Refresh failed: ${data.message || "Unknown error"}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 w-full max-w-sm">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">My Account</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Signed in to ResQFlash</p>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-zinc-100">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">{user?.email}</p>
            </div>
            <RoleBadge role={user?.role} />
          </div>

          <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 p-3">
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1 font-medium">Access Token</p>
            <p className="text-xs font-mono text-gray-600 dark:text-zinc-400 break-all">{accessToken?.slice(0, 60)}...</p>
          </div>

          {msg && <p className="text-xs text-green-600 dark:text-green-400">{msg}</p>}

          <SecondaryButton onClick={doRefresh}>Refresh Token</SecondaryButton>
          <PrimaryButton onClick={logout}>Sign Out</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
