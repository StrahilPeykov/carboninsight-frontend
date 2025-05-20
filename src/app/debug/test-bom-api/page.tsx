"use client";

import { bomApi, LineItem } from "@/lib/api/bomApi";
import { useState, useEffect } from "react";

export default function TestBomApiPage() {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // Test values.
  const c_id = 3;
  const p_id = 5;

  useEffect(() => {
    // Returns an array of authenticated users.
    const getLineItems = async (): Promise<LineItem[]> => {
      try {
        const data = await bomApi.getAllLineItems(c_id, p_id);

        return data as LineItem[];
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.log(err.message);
        } else {
          console.log("Something went wrong");
        }
        return [];
      }
    };

    getLineItems()
      .then(data => setLineItems(data))
      .catch(err => console.log(err.message));
  }, [c_id, p_id]);

  return (
    <div className="p-6">
      <div>Display line items.</div>
      <table>
        <thead>
          <tr>
            <th className="py-3 px-6 text-center">Id</th>
            <th className="py-3 px-6 text-center">Quantity</th>
            <th className="py-3 px-6 text-center">Parent Product Id</th>
            <th className="py-3 px-6 text-center">Product Sharing Status</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map(LineItem => (
            <tr
              key={LineItem.id}
              className="border-b border-gray-200 hover:bg-slate-700 transition"
            >
              <td className="py-3 px-6 text-center">{LineItem.id}</td>
              <td className="py-3 px-6 text-center">{LineItem.quantity}</td>
              <td className="py-3 px-6 text-center">{LineItem.parent_product}</td>
              <td className="py-3 px-6 text-center">{LineItem.product_sharing_request_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
