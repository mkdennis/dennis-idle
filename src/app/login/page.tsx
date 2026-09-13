"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "../actions";

function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const next = useSearchParams().get("next") ?? "/";
  return (
    <form action={action} className="panel mx-3.5 mt-24">
      <div className="panel-head justify-center">Life OS</div>
      <div className="panel-body gap-3 p-4">
        <input type="hidden" name="next" value={next} />
        <label className="flex flex-col gap-1 text-xs font-extrabold text-ink-2">
          Password
          <input name="password" type="password" autoFocus required className="card h-11 px-3 text-base font-bold text-ink outline-none focus:ring-2 focus:ring-cyan" />
        </label>
        {state?.error && <div className="text-xs font-extrabold text-red">{state.error}</div>}
        <button className="btn btn-cyan h-11 w-full text-sm" disabled={pending}>{pending ? "…" : "Enter"}</button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
