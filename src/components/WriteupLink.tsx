import { WRITEUP_URL } from '../siteLinks';

interface WriteupLinkProps {
  className?: string;
  variant?: 'inline' | 'footer';
}

export function WriteupLink({ className = '', variant = 'inline' }: WriteupLinkProps) {
  if (variant === 'footer') {
    return (
      <p
        className={`border-t border-neutral-200 pt-8 text-center text-sm text-neutral-500 ${className}`}
      >
        <a
          href={WRITEUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-900"
        >
          Read the full CS109 write-up →
        </a>
      </p>
    );
  }

  return (
    <p className={`text-sm text-neutral-500 ${className}`}>
      <a
        href={WRITEUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-600 underline decoration-neutral-300 underline-offset-2 transition hover:text-neutral-900"
      >
        full write-up
      </a>
    </p>
  );
}
