import React, { createContext, useContext } from "react";
import type { SubadminScope } from "../hooks/useSubadminScope";

const SubadminScopeContext = createContext<SubadminScope | null>(null);

export function SubadminScopeProvider({
  children,
  scope,
}: {
  children: React.ReactNode;
  scope: SubadminScope;
}) {
  return (
    <SubadminScopeContext.Provider value={scope}>
      {children}
    </SubadminScopeContext.Provider>
  );
}

export function useScope(): SubadminScope {
  const ctx = useContext(SubadminScopeContext);
  if (!ctx) throw new Error("useScope debe usarse dentro de SubadminScopeProvider");
  return ctx;
}
