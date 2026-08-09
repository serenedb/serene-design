import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  /** localStorage key. Keep the per-app key when migrating so users keep their choice. */
  storageKey?: string;
  defaultTheme?: Theme;
  /**
   * Cookie name for sharing the choice across subdomains. Unset means no cookie
   * is read or written at all — the default, because a cookie on the parent
   * domain is visible to every app under it, and that is a decision each app
   * makes for itself. serenedb.com and its docs use `serene-theme`.
   */
  cookieName?: string;
  /**
   * Suppress transitions while the theme class is applied, not only while the
   * toggle runs. Marketing pages with entrance animations want this: without
   * it the first paint after a reload animates in the old theme's colours.
   */
  suppressTransitionsOnApply?: boolean;
}

/**
 * The parent domain a cookie should be set on: `.serenedb.com` for any host
 * under it, and nothing at all for localhost or a bare IP, where a domain
 * attribute would make the cookie be dropped. Ported unchanged from
 * serenedb.com, and it must stay identical — the Docusaurus site reads the same
 * cookie with its own copy of this function.
 */
function rootDomain(): string | null {
  if (typeof window === 'undefined') return null;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null;
  }
  const parts = host.split('.');
  if (parts.length > 2) return '.' + parts.slice(-2).join('.');
  if (parts.length === 2) return '.' + host;
  return null;
}

function readCookie(name: string): Theme | null {
  if (typeof document === 'undefined') return null;
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))
    ?.split('=')[1];
  // Validated, unlike the copy this came from: a stale `system` from an older
  // build, or anything else, must not become the theme.
  return value === 'light' || value === 'dark' ? value : null;
}

function writeCookie(name: string, theme: Theme): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  const domain = rootDomain();
  document.cookie =
    `${name}=${theme}; expires=${expires}; path=/; SameSite=Lax` +
    (domain ? `; domain=${domain}` : '');
}

function readInitialTheme(storageKey: string, cookieName: string | undefined, fallback: Theme): Theme {
  // Cookie first: it is the cross-subdomain answer, and localStorage is
  // per-origin, so a visitor arriving from the docs would otherwise land on
  // whatever this origin remembered from last time.
  if (cookieName) {
    const fromCookie = readCookie(cookieName);
    if (fromCookie) return fromCookie;
  }
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* private mode — fall through */
  }
  return fallback;
}

export function ThemeProvider({
  children,
  storageKey = 'serene-theme',
  defaultTheme = 'dark',
  cookieName,
  suppressTransitionsOnApply = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() =>
    readInitialTheme(storageKey, cookieName, defaultTheme),
  );
  const mounted = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    if (suppressTransitionsOnApply) {
      root.classList.add('no-transitions');
    }
    // Both classes, not just `dark`: serenedb.com has always emitted `light`
    // too, and something keying on it must not quietly stop matching.
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      /* private mode etc. — theme just won't persist */
    }
    // The cookie is written on change only. Writing it on mount would let any
    // app under the domain broadcast its own default to every other one.
    if (cookieName && mounted.current) {
      writeCookie(cookieName, theme);
    }
    mounted.current = true;
    if (suppressTransitionsOnApply) {
      const id = requestAnimationFrame(() => root.classList.remove('no-transitions'));
      return () => cancelAnimationFrame(id);
    }
  }, [theme, storageKey, cookieName, suppressTransitionsOnApply]);

  const toggle = useCallback(() => {
    // Suppress every transition for one frame so the whole page flips at once.
    document.documentElement.classList.add('no-transitions');
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-transitions');
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
