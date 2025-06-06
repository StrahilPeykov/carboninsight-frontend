import { ReactNode } from "react";

type TableRowProps = {
  children: ReactNode;
  onClick?: () => void;
  editMode?: boolean;
  className?: string;
};

export const TableRow = ({
  children,
  onClick,
  editMode = false,
  className = "",
}: TableRowProps) => {
  const baseClasses = "border-b hover:bg-gray-300 dark:hover:bg-gray-600 transition";
  const modeClasses = editMode ? "cursor-pointer opacity-50 hover:opacity-100" : "cursor-default";

  return (
    <tr className={`${baseClasses} ${modeClasses} ${className}`} onClick={onClick}>
      {children}
    </tr>
  );
};
