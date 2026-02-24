import { useState } from "react";
import { api } from "../../api/auth";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import PrimaryButton from "../buttons/PrimaryButton";
import ErrorMsg from "../messages/ErrorMsg";
import SuccessMsg from "../messages/SuccessMsg";
import ModalHeader from "../auth/ModalHeader";
import BackLink from "../auth/BackLink";

export default function ResetPasswordModal({ onClose, onBack, prefillToken }) {
  const [form, setForm] = useState({ token: prefillToken || "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.token || !form.password) {
      setError("All fields required");
      return;
    }

    setError("");
    setLoading(true);
    const data = await api.post("/reset-password", form);
    setLoading(false);

    if (data.success) {
      setSuccess(data.message || "Password reset complete");
      setTimeout(onBack, 2000);
      return;
    }

    setError(data.message || "Reset failed");
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Set new password" subtitle="Enter the token from your email and choose a new password." />
      <div className="px-6 pb-6 flex flex-col gap-4">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <ErrorMsg msg={error} />
          <SuccessMsg msg={success} />
          {!prefillToken && (
            <Input
              id="rp-token"
              label="Reset Token"
              value={form.token}
              onChange={set("token")}
              placeholder="Paste token from email"
            />
          )}
          <Input
            id="rp-pass"
            label="New Password"
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder="Min 8 chars"
          />
          <PrimaryButton type="submit" loading={loading}>Reset Password</PrimaryButton>
        </form>
        <BackLink onClick={onBack} />
      </div>
    </Modal>
  );
}
