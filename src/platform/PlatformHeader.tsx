import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { GithubButton } from '../components/GithubButton';
import { ThemeToggle } from '../components/ThemeToggle';
import { SereneLogo } from '../components/icons';
import { ServiceSwitcher, type LinkRenderer } from './ServiceSwitcher';
import { findService, type PlatformService } from './services';

interface PlatformHeaderProps {
  /** id from the service registry; drives the title, the switcher and the source link. */
  serviceId: string;
  /** Escape hatch for a service that is not in the shared registry yet. */
  service?: PlatformService;
  services?: PlatformService[];
  /** Content between the title and the icon buttons (live counters, filters…). */
  right?: ReactNode;
  /** Where the logo points. Defaults to the service's own root. */
  homeHref?: string;
  onHomeClick?: () => void;
  /** True when rendered inside the playground SPA: links use paths, not absolute URLs. */
  internal?: boolean;
  renderLink?: LinkRenderer;
  /** Overrides the GitHub button target; defaults to the service's source directory. */
  sourceHref?: string;
  className?: string;
}

const defaultLink: LinkRenderer = ({ href, children, ...rest }) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

/**
 * The platform header: `[logo] SereneDB / <service> ⌄` on the left, a service
 * switcher behind the chevron, and GitHub + theme controls on the right.
 * Every SereneDB front end renders this, so the naming stays identical.
 */
export function PlatformHeader({
  serviceId,
  service,
  services,
  right,
  homeHref,
  onHomeClick,
  internal = false,
  renderLink = defaultLink,
  sourceHref,
  className,
}: PlatformHeaderProps) {
  const current = service ?? findService(serviceId);
  const name = current?.name ?? serviceId;
  const home = homeHref ?? (internal ? (current?.path ?? '/') : (current?.url ?? '/'));

  return (
    <div className={cn('box-border w-full border-b-[0.5px] border-border', className)}>
      {/* Tighter gutters and gaps on phones: the switcher chevron is 22px the
          header did not have before, and at 375px that was enough to push the
          whole document into horizontal scroll. */}
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          {renderLink({
            href: home,
            onClick: onHomeClick,
            className: 'flex items-center gap-2.5 hover:opacity-100',
            children: (
              <>
                <SereneLogo size={22} />
                <span className="whitespace-nowrap text-[15px] font-extrabold tracking-[-0.01em]">
                  SereneDB <span className="font-normal text-secondary-foreground">/</span>{' '}
                  <span className="text-thirdly">{name}</span>
                </span>
              </>
            ),
          })}
          <ServiceSwitcher
            currentId={current?.id ?? serviceId}
            services={services}
            internal={internal}
            renderLink={renderLink}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3.5">
          {right}
          <div className="flex items-center gap-2">
            <GithubButton
              href={sourceHref ?? current?.source}
              label={current ? `${current.name} source on GitHub` : 'SereneDB on GitHub'}
            />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
