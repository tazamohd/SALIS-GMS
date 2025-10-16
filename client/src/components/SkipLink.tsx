// Skip link for keyboard navigation (WCAG 2.1 requirement)
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      data-testid="skip-link"
    >
      Skip to main content
    </a>
  );
}
