import { useState } from "react";
import { api } from "../../api/auth";
import Input from "../../components/ui/Input";
import Divider from "../../components/ui/Divider";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import ErrorMsg from "../../components/messages/ErrorMsg";
import SuccessMsg from "../../components/messages/SuccessMsg";
import GoogleButton from "../../components/auth/GoogleButton";

export default function SignUpForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) e.password = "Need uppercase, lowercase & number";
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await api.post("/register", form, { timeout: 30000 });

      if (data.success) {
        setSuccess(data.message || "Account created");
        return;
      }

      const fieldErrors = {};
      if (data.errors?.length) data.errors.forEach((item) => { fieldErrors[item.field] = item.message; });
      setErrors(fieldErrors);
      setError(data.message || "Sign up failed");
    } catch (err) {
      setError(err?.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <ErrorMsg msg={error} />
      <SuccessMsg msg={success} />
      <Input id="su-name" label="Full Name" value={form.name} onChange={set("name")} error={errors.name} placeholder="John Doe" />
      <Input id="su-email" label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} placeholder="you@example.com" />
      <Input id="su-pass" label="Password" type="password" value={form.password} onChange={set("password")} error={errors.password} placeholder="Min 8 chars" />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Role</label>
        <select
          value={form.role}
          onChange={set("role")}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-zinc-400 transition"
        >
          {["USER", "DRIVER", "HOSPITAL", "ADMIN"].map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
      </div>
      <PrimaryButton type="submit" loading={loading}>Create Account</PrimaryButton>
      <Divider label="Or continue with" />
      <GoogleButton />
    </form>
  );
}
