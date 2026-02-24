import { useState } from "react";
import { api } from "../../api/auth";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import PrimaryButton from "../buttons/PrimaryButton";
import ErrorMsg from "../messages/ErrorMsg";
import SuccessMsg from "../messages/SuccessMsg";
import ModalHeader from "../auth/ModalHeader";
import BackLink from "../auth/BackLink";

export default function ForgotPasswordModal({ onClose, onBack }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }

    setError("");
    setLoading(true);
    const data = await api.post("/forgot-password", { email });
    setLoading(false);

    if (data.success) setSuccess(data.message || "Reset link sent");
    else setError(data.message || "Request failed");
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Reset your password" subtitle="We'll email you a link to reset your password." />
      <div className="px-6 pb-6 flex flex-col gap-4">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <ErrorMsg msg={error} />
          <SuccessMsg msg={success} />
          <Input
            id="fp-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <PrimaryButton type="submit" loading={loading}>Send Reset Link</PrimaryButton>
        </form>
        <BackLink onClick={onBack} />
      </div>
    </Modal>
  );
}
