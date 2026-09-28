import Link from "next/link";

export default function Footer() {
  const linkClass = "underline underline-offset-4 hover:text-gray-900 dark:hover:text-white";
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between gap-x-10 gap-y-5">
          <p className="max-w-md leading-relaxed">
            Developed by Brainport Industries &amp; TU Eindhoven.
            <br />
            Funded by the European Union.
          </p>
          <nav
            className="flex flex-wrap items-start gap-x-6 gap-y-3"
            aria-label="Footer navigation"
          >
            <Link href="/support" className={linkClass}>
              Support
            </Link>
            <a href="https://brainportindustries.nl" className={linkClass}>
              Brainport Industries
            </a>
            <a href="mailto:s.manders@brainportindustries.nl" className={linkClass}>
              Contact project manager
            </a>
          </nav>
        </div>
        <p className="mt-5 max-w-4xl text-xs leading-relaxed">
          Views and opinions expressed are those of the authors only and do not necessarily reflect
          those of the European Union or Health and Digital Executive Agency (HaDEA).
        </p>
        <div className="mt-5 flex flex-wrap justify-between gap-x-8 gap-y-3 text-xs">
          <p>&copy; {new Date().getFullYear()} Carbon Footprint Calculator.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/accessibility" className={linkClass}>
              Accessibility statement
            </Link>
            <Link href="/privacy" className={linkClass}>
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
