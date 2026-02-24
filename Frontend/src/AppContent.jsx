import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import AuthModal from "./components/modals/AuthModal";
import Dashboard from "./pages/Dashboard";

export default function AppContent() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 flex items-center justify-center transition-colors">
        <p className="text-sm text-gray-400 dark:text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (user) return <Dashboard />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 transition-colors">
      {showAuth ? (
        <AuthModal onClose={() => setShowAuth(false)} />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <button
            onClick={() => setShowAuth(true)}
            className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 dark:hover:bg-zinc-100 transition cursor-pointer"
            type="button"
          >
            Sign in to ResQFlash
          </button>
        </div>
      )}
    </div>
  );
}
