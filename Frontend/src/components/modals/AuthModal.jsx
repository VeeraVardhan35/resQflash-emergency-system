import { useMemo, useState } from "react";
import Modal from "../ui/Modal";
import SignInForm from "../../pages/Auth/SignInForm";
import SignUpForm from "../../pages/Auth/SignUpForm";
import ModalHeader from "../auth/ModalHeader";
import ForgotPasswordModal from "./ForgotPasswordModal";
import ResetPasswordModal from "./ResetPasswordModal";
import VerifyEmailModal from "./VerifyEmailModal";

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState("signin");

  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  const urlToken = search.get("token");
  const urlResetToken = search.get("resetToken");
  const initialSubPage = urlResetToken ? "reset" : (urlToken ? "verify" : null);
  const [subPage, setSubPage] = useState(initialSubPage);

  if (subPage === "forgot") return <ForgotPasswordModal onClose={onClose} onBack={() => setSubPage(null)} />;
  if (subPage === "reset") return <ResetPasswordModal onClose={onClose} onBack={() => setSubPage(null)} prefillToken={urlResetToken} />;
  if (subPage === "verify") return <VerifyEmailModal onClose={onClose} onBack={() => setSubPage(null)} prefillToken={urlToken} />;

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Sign in to ResQFlash" subtitle="Choose your preferred authentication method" />

      <div className="flex border-b border-gray-200 dark:border-zinc-800 px-6">
        {[{ id: "signin", label: "Sign In" }, { id: "signup", label: "Sign Up" }].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`pb-3 pt-1 mr-6 text-sm font-semibold transition border-b-2 -mb-px cursor-pointer
              ${tab === id
                ? "border-black dark:border-white text-black dark:text-white"
                : "border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"
              }`}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-6 pt-5 pb-6">
        {tab === "signin" ? <SignInForm onForgot={() => setSubPage("forgot")} /> : <SignUpForm />}

        <div className="mt-4 text-center text-xs text-gray-400 dark:text-zinc-500 flex items-center justify-center gap-2 flex-wrap">
          {tab === "signin" ? (
            <>
              <span>Do not have an account?</span>
              <button onClick={() => setTab("signup")} className="text-black dark:text-white font-semibold hover:underline cursor-pointer" type="button">Sign up</button>
              <span>.</span>
              <button onClick={() => setSubPage("verify")} className="text-black dark:text-white font-semibold hover:underline cursor-pointer" type="button">Verify email</button>
            </>
          ) : (
            <>
              <span>Already have an account?</span>
              <button onClick={() => setTab("signin")} className="text-black dark:text-white font-semibold hover:underline cursor-pointer" type="button">Sign in</button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
