import React, { useEffect, useState } from "react";
import AccessibleTable from "./AccessibleTable";
import Card from "./Card";
import { AuditLogActionDefinition, LogItem } from "@/lib/api/auditLogApi";
import { TableRow } from "./tableRow";
import { MobileTableCard } from "./MobileTableCard";
import Button from "./Button";

interface AuditLogProps {
    caption: string;
    logItems: LogItem[];
}

export default function AuditLog({
    caption,
    logItems,
}: AuditLogProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [selectedAction, setSelectedAction] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Number of rows per page

    const toggleExpanded = (id: number) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    const filteredLogs = selectedAction !== null
        ? logItems.filter((log) => log.action === selectedAction)
        : logItems;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedAction]);

    return (
        <Card>
            <div className="flex">
                <h2 className="text-xl font-semibold mb-4">Audit Log</h2>

                <div className="mb-4 ml-auto">
                    <label className="mr-2 font-medium text-sm text-gray-700 dark:text-gray-300">
                        Filter action:
                    </label>
                    <select
                        value={selectedAction !== null ? selectedAction : "all"}
                        onChange={(e) =>
                            setSelectedAction(e.target.value === "all" ? null : Number(e.target.value))
                        }
                        className="border px-3 py-2 rounded-md bg-white text-black dark:bg-gray-800 dark:text-white"
                    >
                        <option value="all">All</option>
                        {Object.entries(AuditLogActionDefinition).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {paginatedLogs.length > 0 ? (
                <>
                {/* Desktop view */}
                <AccessibleTable caption={caption} className="hidden md:block">
                    <thead className="border-b font-bold text-l w-full">
                        <tr>
                            <td className="py-3 px-6 text-left">Time</td>
                            <td className="py-3 px-6 text-left">User</td>
                            <td className="py-3 px-6 text-left">Action</td>
                            <td className="py-3 px-6 text-left">Changes</td>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {paginatedLogs.map((log) => (
                            <TableRow key={log.id} onClick={() => toggleExpanded(log.id)} className="cursor-pointer">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className={"py-3 px-6 text-left"}>{log.actor_username}</td>
                                <td className="py-3 px-6 text-left">{AuditLogActionDefinition[log.action]}</td>
                                <td 
                                    className={`py-3 px-6 text-left break-words w-full ${expandedId !== log.id ? "truncate max-w-[1px]" : "max-w-[1px]"}`}
                                >
                                    {log.changes}
                                </td>
                            </TableRow>
                        ))}
                    </tbody>
                </AccessibleTable>

                {/* Mobile view */}
                <div className="md:hidden">
                    {paginatedLogs.map((log) => (
                        <MobileTableCard
                            title = {new Date(log.timestamp).toLocaleString()}
                            fields = {[
                                { label: "User", value: log.actor_username },
                                { label: "Action", value: AuditLogActionDefinition[log.action] },
                                { label: "Changes", value: log.changes },
                            ]}
                        />
                    ))}
                </div>

                <nav className="flex justify-between items-center mt-4" aria-label="Pagination">
                    <div className="flex items-center gap-2">
                        <Button
                            className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm" aria-current="page">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={currentPage * itemsPerPage >= filteredLogs.length}
                        >
                            Next
                        </Button>
                    </div>
                </nav>
                </>
            ) : (
                <p className="">No audit logs available.</p>
            )}
        </Card>
    )
}
