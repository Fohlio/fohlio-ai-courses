import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "@/contexts/AuthContext";

/**
 * Returns the current auth context value.
 * Must be used within an <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuth must be used within an <AuthProvider>. " +
        "Wrap your component tree with <AuthProvider> in the root layout.",
    );
  }

  return context;
}
