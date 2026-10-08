import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '../lib/cn';
import { ChevronDownIcon } from '../components/icons';
import type { PlatformService } from './services';
import { PLATFORM_SERVICES } from './services';

/** Lets the host app render links its own way (react-router <Link>, <a>, …). */
export type LinkRenderer = (props: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  role?: string;
  tabIndex?: number;
  'aria-current'?: 'page' | undefined;
  ref?: Ref<HTMLAnchorElement>;
}) => ReactElement;

const defaultLink: LinkRenderer = ({ href, children, ...rest }) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

interface ServiceSwitcherProps {
  /** id of the service currently open; marked as current in the list. */
  currentId?: string;
  services?: PlatformService[];
  /** Inside the playground pass `true` to link by SPA path instead of absolute URL. */
  internal?: boolean;
  renderLink?: LinkRenderer;
}

export function ServiceSwitcher({
  currentId,
  services = PLATFORM_SERVICES,
  internal = false,
  renderLink = defaultLink,
}: ServiceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuId = useId();

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  // Click outside and Escape close the menu; Escape also returns focus.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) itemRefs.current[active]?.focus();
  }, [open, active]);

  const openAt = (index: number) => {
    setActive(index);
    setOpen(true);
  };

  const onTriggerKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openAt(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openAt(services.length - 1);
    }
  };

  const onMenuKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % services.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + services.length) % services.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(services.length - 1);
    } else if (e.key === 'Tab') {
      close(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close(false) : openAt(0))}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label="Switch service"
        className={cn(
          'flex h-[22px] w-[22px] items-center justify-center rounded-none',
          'text-secondary-foreground/60 transition-all duration-200',
          'hover:bg-secondary hover:text-secondary-foreground',
          open && 'bg-secondary text-secondary-foreground',
        )}
      >
        <ChevronDownIcon />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="SereneDB services"
          onKeyDown={onMenuKeyDown}
          className={cn(
            'absolute left-0 top-full z-50 mt-2 w-[320px] max-w-[calc(100vw-32px)]',
            'border-[0.5px] border-border bg-card p-1',
            'animate-serene-pop',
          )}
        >
          {services.map((s, i) => {
            const isCurrent = s.id === currentId;

            // A service that is announced but not deployed yet is listed and
            // dimmed, never linked: a switcher that navigates to a 404 is worse
            // than one that admits the service is not there.
            if (s.status === 'soon') {
              return (
                <div
                  key={s.id}
                  role="menuitem"
                  aria-disabled="true"
                  className="flex items-start justify-between gap-2 px-3 py-2 opacity-45"
                >
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{s.name}</span>
                    <span className="mt-0.5 block text-xs text-secondary-foreground">
                      {s.tagline}
                    </span>
                  </span>
                  <span className="mt-0.5 shrink-0 border-[0.5px] border-border px-1 py-px font-mono text-[10px] uppercase tracking-[0.08em] text-secondary-foreground">
                    soon
                  </span>
                </div>
              );
            }

            return (
              <div key={s.id}>
                {renderLink({
                  href: internal ? s.path : s.url,
                  role: 'menuitem',
                  tabIndex: i === active ? 0 : -1,
                  'aria-current': isCurrent ? 'page' : undefined,
                  onClick: () => close(false),
                  ref: (el: HTMLAnchorElement | null) => {
                    itemRefs.current[i] = el;
                  },
                  className: cn(
                    'block px-3 py-2 no-underline transition-colors duration-150',
                    'hover:opacity-100 hover:bg-muted focus:outline-none focus-visible:bg-muted',
                    isCurrent && 'bg-muted',
                  ),
                  children: (
                    <>
                      <span
                        className={cn(
                          'block text-sm font-semibold',
                          isCurrent ? 'text-thirdly' : 'text-foreground',
                        )}
                      >
                        {s.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-secondary-foreground">
                        {s.tagline}
                      </span>
                    </>
                  ),
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
