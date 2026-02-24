import { useState } from "react";
import { api } from "../../api/auth";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import PrimaryButton from "../buttons/PrimaryButton";
import ErrorMsg from "../messages/ErrorMsg";
import SuccessMsg from "../messages/SuccessMsg";
import ModalHeader from "../auth/ModalHeader";
import BackLink from "../auth/BackLink";

export default function VerifyEmailModal({ onClose, onBack, prefillToken }) {
  const [token, setToken] = useState(prefillToken || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = async (value) => {
    if (!value) {
      setError("Verification token is required");
      return;
    }

    setLoading(true);
    const data = await api.get(`/verify-email?token=${value}`);
    setLoading(false);

    if (data.success) {
      setSuccess(data.message || "Email verified");
      setTimeout(onBack, 2000);
      return;
    }

    setError(data.message || "Verification failed");
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Verify your email" subtitle="Paste the token from your verification email." />
      <div className="px-6 pb-6 flex flex-col gap-4">
        {loading && <p className="text-sm text-gray-400 dark:text-zinc-500 text-center">Verifying...</p>}
        <div className="flex flex-col gap-3">
          <ErrorMsg msg={error} />
          <SuccessMsg msg={success} />
          <Input
            id="ve-token"
            label="Verification Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste token here"
          />
          <PrimaryButton onClick={() => verify(token)} loading={loading}>Verify Email</PrimaryButton>
        </div>
        <BackLink onClick={onBack} />
      </div>
    </Modal>
  );
}
