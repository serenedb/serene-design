import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

/* The design-system button: sharp corners, hairline border, .3s all.
 *
 * Variant and size are independent, which is what serenedb.com needs — the same
 * `secondary` appears at h-10 in a content block and at h-6.5 in a card footer.
 * Three of these classes exist for the kit's own base layer rather than for any
 * caller: `rounded-none` (radius tokens are 0 here anyway), `no-underline` and
 * `hover:opacity-100`, because the base layer fades every <a> on hover and an
 * anchor rendered as a button must not fade. On a consumer without those base
 * rules they are inert.
 */
const BASE =
  "z-1 cursor-pointer inline-flex items-center justify-center gap-2 rounded-none font-sans " +
  "whitespace-nowrap text-sm no-underline shrink-0 transition-all " +
  "hover:opacity-100 disabled:pointer-events-none disabled:opacity-50 " +
  "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 " +
  'outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ' +
  'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive';

export const buttonVariants = cva(BASE, {
  variants: {
    variant: {
      /* var() rather than bg-btn-primary-bg: that utility needs a
         --color-btn-primary-* mapping in the consumer's @theme, and a consumer
         that imports only the tokens has none — the fill silently vanishes.
         Reading the custom property directly works with tokens alone. */
      default:
        'bg-[var(--btn-primary-bg)] border-[var(--btn-primary-border)] border-[0.5px] ' +
        'hover:bg-thirdly/80 duration-300 text-thirdly-foreground',
      secondary:
        'bg-secondary hover:bg-secondary/70 border-[0.5px] border-border ' +
        'text-secondary-foreground/70 text-xs duration-300 flex justify-center items-center ' +
        'hover:text-secondary-foreground',
      thirdly:
        'bg-border text-secondary-foreground/50 hover:text-secondary-foreground text-xs ' +
        'border-transparent duration-300 flex justify-center items-center',
      destructive:
        'bg-destructive text-white shadow-xs hover:bg-destructive/90 ' +
        'focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
      outline:
        'border border-border bg-primary shadow-xs text-primary-foreground/70 hover:text-primary-foreground',
      link: 'text-xs text-secondary-foreground hover:underline font-normal',
      ghost:
        'border text-white/30 bg-transparent border-white/5 opacity-70 hover:opacity-100 ' +
        'hover:bg-white/10 hover:border-white/0 hover:text-white',
      // border-border is explicit here on purpose: serenedb.com sets a global
      // `* { border-color: var(--border) }` and the kit does not, so a bare
      // `border-[0.5px]` would fall back to currentColor for kit consumers.
      icon:
        'bg-secondary border-[0.5px] border-border text-secondary-foreground/50 ' +
        'hover:text-secondary-foreground text-xs duration-300 flex justify-center items-center',
    },
    size: {
      default: 'h-10 px-4 text-sm has-[>svg]:px-3',
      sm: 'h-6.5 gap-1.5 px-2.5 text-xs has-[>svg]:px-2.5',
      lg: 'h-10 laptop:h-14 px-6 has-[>svg]:px-4 text-md laptop:text-lg',
      link: 'px-0 w-auto',
      icon: 'w-6.5 h-6.5',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Renders the child element instead of a <button>, keeping the classes. */
    asChild?: boolean;
    /** Renders an <a> instead of a <button>. Ignored when asChild is set. */
    href?: string;
    target?: string;
    rel?: string;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  href,
  target,
  rel,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, className }));

  if (asChild) {
    return <Slot data-slot="button" className={classes} {...props} />;
  }

  if (href !== undefined) {
    return (
      <a
        data-slot="button"
        className={classes}
        href={href}
        target={target}
        rel={rel}
        {...(props as React.ComponentProps<'a'>)}
      />
    );
  }

  return <button data-slot="button" className={classes} type={props.type ?? 'button'} {...props} />;
}
