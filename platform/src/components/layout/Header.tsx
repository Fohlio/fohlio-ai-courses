"use client";

/** Inline SVG icon: Menu (hamburger) */
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function Header() {
  return (
    <header
      data-testid="mobile-header"
      className="flex h-14 items-center border-b border-gray-200 bg-white px-4 md:hidden"
    >
      <button
        data-testid="mobile-menu-toggle"
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <span className="flex-1 text-center text-base font-semibold text-gray-900">
        Fohlio Tech Course
      </span>

      {/* Spacer to balance the hamburger button on the left */}
      <div className="w-9" aria-hidden="true" />
    </header>
  );
}

export { Header };
