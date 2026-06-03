import { PERSONAL_SITE_URL } from '../siteLinks';

export function SiteFooter() {
  return (
    <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-neutral-200 bg-[#fafafa] px-5 py-3 text-xs text-neutral-500 sm:px-6">
      <span>© 2026 Akhil Reddy</span>
      <a
        href={PERSONAL_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate transition hover:text-neutral-800"
      >
        akhil-reddy-13.github.io
      </a>
    </footer>
  );
}
