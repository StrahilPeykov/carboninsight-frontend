import { ReactNode, createElement } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  as?: "div" | "section" | "article";
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

export default function Card({
  children,
  title,
  className = "",
  as: Component = "div",
  headingLevel = 3,
  role,
  ariaLabel,
  ariaLabelledBy,
}: CardProps) {
  const titleId = title ? `card-title-${title.replace(/\s+/g, "-").toLowerCase()}` : undefined;

  const baseClasses = `bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`;

  // Determine appropriate ARIA attributes
  const ariaAttributes = {
    role: role,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy || (title ? titleId : undefined),
  };

  const content = (
    <>
      {title && (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          {createElement(
            `h${headingLevel}`,
            {
              id: titleId,
              className: "text-lg font-medium leading-6 text-gray-900 dark:text-white",
            },
            title
          )}
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </>
  );

  return (
    <Component className={baseClasses} {...ariaAttributes}>
      {content}
    </Component>
  );
}
