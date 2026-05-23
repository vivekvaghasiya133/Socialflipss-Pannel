"use client";

import React, { useEffect, forwardRef, createContext, useContext } from "react";
import { useRouter, useParams as useNextParams, usePathname, useSearchParams as useNextSearchParams } from "next/navigation";
import NextLink from "next/link";

// 1. Navigate Component
export function Navigate({ to, replace }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, replace, router]);
  return null;
}

// 2. useNavigate Hook
export function useNavigate() {
  const router = useRouter();
  return (to, options) => {
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

// 3. useParams Hook
export function useParams() {
  const params = useNextParams();
  return params || {};
}

// 4. useLocation Hook
export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  return {
    pathname: pathname || "",
    search: searchParams ? "?" + searchParams.toString() : "",
    hash: "",
    state: null,
  };
}

// 5. useSearchParams Hook
export function useSearchParams() {
  const searchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams = (newParams) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (newParams instanceof URLSearchParams || typeof newParams === 'function') {
      console.warn("Functional or URLSearchParams updates are not fully supported, objects preferred.");
    } else {
      for (const [key, val] of Object.entries(newParams)) {
        if (val === undefined || val === null) {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return [searchParams || new URLSearchParams(), setSearchParams];
}

// 6. Link Component
export const Link = forwardRef(({ to, href, children, ...props }, ref) => {
  return (
    <NextLink href={to || href || "#"} ref={ref} {...props}>
      {children}
    </NextLink>
  );
});
Link.displayName = "Link";

// 7. Outlet and Layout Context
const OutletContext = createContext(null);

export function OutletProvider({ children, value }) {
  return (
    <OutletContext.Provider value={value}>
      {children}
    </OutletContext.Provider>
  );
}

export function Outlet() {
  const children = useContext(OutletContext);
  return children || null;
}

// Dummy Router Components to satisfy generic compilation
export function BrowserRouter({ children }) { return <>{children}</>; }
export function Routes({ children }) { return <>{children}</>; }
export function Route() { return null; }
