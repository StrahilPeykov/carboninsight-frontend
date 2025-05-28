import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  as?: "div" | "section" | "article";
}

export default function Card({
  children,
  title,
  className = "",
  as: Component = "div",
}: CardProps) {
  const content = (
    <>
      {title && (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{title}</h3>
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </>
  );

  const baseClasses = `bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`;

  // If title is provided, use semantic heading structure
  if (title && Component === "section") {
    return (
      <section
        className={baseClasses}
        aria-labelledby={`card-title-${title.replace(/\s+/g, "-").toLowerCase()}`}
      >
        {title && (
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h2
              id={`card-title-${title.replace(/\s+/g, "-").toLowerCase()}`}
              className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
            >
              {title}
            </h2>
          </div>
        )}
        <div className="px-4 py-5 sm:p-6">{children}</div>
      </section>
    );
  }

  return <Component className={baseClasses}>{content}</Component>;
}
