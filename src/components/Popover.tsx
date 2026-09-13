import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../lib/cn';

/* The design-system popover: shadcn's, on Radix, with the kit's own surface.
 *
 * Two things it brings that a hand-rolled panel does not, and both are the
 * reason this is a dependency rather than thirty lines:
 *
 *  - It positions before it paints. Radix measures the trigger and the content
 *    in a layout effect and only then renders the panel at its place, so the
 *    panel never appears anywhere else first. A popover placed from a `toggle`
 *    event cannot promise that — the event is queued, so the browser is free to
 *    paint the unplaced panel and jump it a frame later, which is exactly the
 *    flash that put this component here.
 *  - It collision-detects. `sideOffset`, flipping to the other side and
 *    shifting along the trigger to stay in the viewport are all Radix's.
 *
 * It portals to the body, which is what gets it out of a scrolling ancestor —
 * an `overflow-x: auto` container computes `overflow-y` to `auto` too and would
 * clip a panel positioned inside it.
 *
 * The surface is the kit's: square (every radius token here is 0), a hairline
 * border, `--popover` for the ground. The animation classes are shadcn's and
 * are inert without `tw-animate-css`; they are kept so a consumer that has it
 * gets the same motion as the rest of shadcn.
 */

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground z-50 w-72 rounded-none border-[0.5px] border-border p-4 outline-hidden',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

/** Position against something other than the trigger. */
function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
