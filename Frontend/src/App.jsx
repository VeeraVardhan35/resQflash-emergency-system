import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import ThemeToggle from "./components/ThemeToggle";
import AppContent from "./AppContent";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeToggle />
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}