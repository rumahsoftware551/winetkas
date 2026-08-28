"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return (
    <form action={action}>
      {state.error ? <div className="form-error">{state.error}</div> : null}
      <div className="field">
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" autoComplete="email" defaultValue="direktur@ispfinance.local" required />
      </div>
      <div className="field">
        <label className="label" htmlFor="password">Kata sandi</label>
        <input className="input" id="password" name="password" type="password" autoComplete="current-password" defaultValue="ChangeMe-123!" minLength={8} required />
      </div>
      <button className="primary-button" type="submit" disabled={pending}>{pending ? "Memeriksa..." : "Masuk ke ISPfinance"}</button>
    </form>
  );
}
