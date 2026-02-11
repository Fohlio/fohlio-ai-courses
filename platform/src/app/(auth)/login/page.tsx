"use client";

import { type FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [githubNickname, setGithubNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!githubNickname.trim()) {
      setError("GitHub nickname is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(githubNickname.trim(), password);
      const redirectTo = searchParams.get("redirect") || "/lessons";
      router.push(redirectTo);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1
          className="text-2xl font-bold text-gray-900"
          data-testid="login-heading"
        >
          Sign In
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back to Fohlio Tech Course
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div
            className="rounded-lg bg-danger-light px-4 py-3 text-sm text-danger"
            role="alert"
            data-testid="login-error"
          >
            {error}
          </div>
        )}

        <Input
          label="GitHub Nickname"
          type="text"
          placeholder="e.g. octocat"
          value={githubNickname}
          onChange={(e) => setGithubNickname(e.target.value)}
          autoComplete="username"
          data-testid="login-nickname-input"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          data-testid="login-password-input"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="mt-2 w-full"
          data-testid="login-submit-button"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-brand hover:underline"
          data-testid="login-register-link"
        >
          Register
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
