import { Button } from './Button';
import { GithubIcon } from './icons';

const SERENEDB_REPO = 'https://github.com/serenedb/serenedb';

interface GithubButtonProps {
  /** Defaults to the SereneDB engine repo. */
  href?: string;
  label?: string;
}

export function GithubButton({ href = SERENEDB_REPO, label = 'SereneDB on GitHub' }: GithubButtonProps) {
  return (
    <Button
      variant="icon"
      size="icon"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
    >
      <GithubIcon className="size-4" />
    </Button>
  );
}
