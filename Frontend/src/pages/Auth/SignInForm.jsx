import { useState } from "react";
import { api } from "../../api/auth";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/ui/Input";
import Divider from "../../components/ui/Divider";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import ErrorMsg from "../../components/messages/ErrorMsg";
import GoogleButton from "../../components/auth/GoogleButton";

export default function SignInForm({ onForgot }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.email) nextErrors.email = "Email is required";
    if (!form.password) nextErrors.password = "Password is required";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setError("");
    setLoading(true);

    try {
      const data = await api.post("/login", form);
      if (data.success) login(data.user, data.accessToken);
      else setError(data.message || "Sign in failed");
    } catch (err) {
      setError(err?.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <ErrorMsg msg={error} />
      <Input
        id="si-email"
        label="Email"
        type="email"
        value={form.email}
        onChange={set("email")}
        error={errors.email}
        placeholder="you@example.com"
      />
      <Input
        id="si-pass"
        label="Password"
        type="password"
        value={form.password}
        onChange={set("password")}
        error={errors.password}
        rightLabel={(
          <button
            type="button"
            onClick={onForgot}
            className="text-xs text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-100 transition cursor-pointer"
          >
            Forgot password?
          </button>
        )}
      />
      <PrimaryButton type="submit" loading={loading}>Sign In</PrimaryButton>
      <Divider label="Or continue with" />
      <GoogleButton />
    </form>
  );
}
