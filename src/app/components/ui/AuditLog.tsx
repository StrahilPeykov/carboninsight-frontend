import React, { useEffect, useState } from "react";
import AccessibleTable from "./AccessibleTable";
import Card from "./Card";
import { AuditLogActionDefinition, LogItem } from "@/lib/api/auditLogApi";
import { TableRow } from "./tableRow";
import { MobileTableCard } from "./MobileTableCard";

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

    const toggleExpanded = (id: number) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    const filteredLogs = selectedAction !== null
        ? logItems.filter((log) => log.action === selectedAction)
        : logItems;

    return (
        <Card>
            <div className="flex">
                <h2 className="text-xl font-semibold mb-4">Audit Log</h2>

                <div className="mb-4 ml-auto">
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

            {filteredLogs.length > 0 ? (
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
                        {filteredLogs.map((log) => (
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
                    {filteredLogs.map((log) => (
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
                </>
            ) : (
                <p className="">No audit logs available.</p>
            )}
        </Card>
    )
}
