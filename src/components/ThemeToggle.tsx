import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';
import { MoonIcon, SunIcon } from './icons';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button
      variant="icon"
      size="icon"
      onClick={toggle}
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {theme === 'dark' ? <MoonIcon className="size-3.5" /> : <SunIcon className="size-3.5" />}
    </Button>
  );
}
