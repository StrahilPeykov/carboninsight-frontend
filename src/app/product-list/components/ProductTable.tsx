import { Trash, Edit, Sparkles, FileDown, Info, Boxes } from "lucide-react";
import Link from "next/link";
import Button from "@/app/components/ui/Button";
import { TableRow } from "@/app/components/ui/tableRow";
import { Product } from "@/lib/api/productApi";

interface ProductTableProps {
  products: Product[];
  paginatedProducts: Product[];
  dataLoading: boolean;
  error: string | null;
  currentPage: number;
  rowsPerPage: number;
  isDeleting: boolean;
  searchQuery: string;
  // Event handlers
  onProductClick: (id: string) => void;
  onExportClick: (product: Product, e: React.MouseEvent) => void;
  onAIButtonClick: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export default function ProductTable({
  products,
  paginatedProducts,
  dataLoading,
  error,
  currentPage,
  rowsPerPage,
  isDeleting,
  searchQuery,
  onProductClick,
  onExportClick,
  onAIButtonClick,
  onEdit,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
}: ProductTableProps) {
  return (
    <>
      {dataLoading ? (
        <div className="flex justify-center items-center py-8" role="status" aria-live="polite">
          <div
            className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400"
            aria-hidden="true"
          ></div>
          <span className="ml-3">Loading products...</span>
        </div>
      ) : error ? (
        <p className="text-red-500" role="alert">
          {error}
        </p>
      ) : (
        <>
          {/* Desktop and tablet table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full table-auto text-base" role="table">
              <caption className="sr-only">
                Product list showing {paginatedProducts.length} of {products.length} products
              </caption>
              <thead>
                <tr className="text-left border-b">
                  <th scope="col" className="p-2">
                    Manufacturer
                  </th>
                  <th scope="col" className="p-2">
                    Product name
                  </th>
                  <th scope="col" className="p-2">
                    <abbr title="Stock Keeping Unit">SKU</abbr>
                  </th>
                  <th scope="col" className="p-2">
                    <abbr title="Product Carbon Footprint">PCF</abbr>
                  </th>
                  <th scope="col" className="p-2 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="text-base">
                {paginatedProducts.map(product => (
                  <TableRow
                    key={product.id}
                    onClick={() => onProductClick(product.id)}
                  >
                    <td className="p-2">{product.manufacturer_name}</td>
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">{product.sku}</td>
                    <td className="p-2 flex items-center gap-1">
                      {product.emission_total} kg
                      <Info className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    </td>
                    <td className="p-2">
                      <div className="flex items-center justify-end gap-2">
                        {/* Export */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-xs hover:cursor-pointer"
                          onClick={e => onExportClick(product, e)}
                          aria-label={`Export data for ${product.name}`}
                        >
                          <FileDown className="w-3 h-3" aria-hidden="true" />
                          <span>Export</span>
                        </Button>

                        {/* Ask AI */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="group flex items-center gap-1 text-xs hover:bg-gradient-to-r from-purple-500 to-blue-500 hover:text-white hover:cursor-pointer"
                          onClick={e => {
                            e.stopPropagation();
                            onAIButtonClick(product.id);
                          }}
                          aria-label={`Get AI recommendations for ${product.name}`}
                        >
                          <Sparkles
                            className="w-3 h-3 text-purple-500 group-hover:text-white"
                            aria-hidden="true"
                          />
                          Ask AI
                        </Button>

                        {/* Edit */}
                        <Button
                          size="sm"
                          className="flex items-center gap-1 text-xs !bg-blue-500 !border-blue-500 !text-white hover:cursor-pointer"
                          onClick={e => {
                            e.stopPropagation();
                            onEdit(product.id);
                          }}
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit className="w-4 h-4" aria-hidden="true" />
                        </Button>

                        {/* Delete */}
                        <Button
                          size="sm"
                          className="flex items-center gap-1 text-xs !bg-red-500 !border-red-500 !text-white hover:cursor-pointer"
                          onClick={e => {
                            e.stopPropagation();
                            onDelete(product.id);
                          }}
                          disabled={isDeleting}
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </TableRow>
                ))}

                {/* Empty state */}
                {paginatedProducts.length === 0 && !dataLoading && (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      {searchQuery.length > 0 && searchQuery.length < 4 ? (
                        <div className="text-gray-500">
                          Please enter at least 4 characters to search.
                        </div>
                      ) : searchQuery.length >= 4 ? (
                        <div className="text-gray-500">
                          No products found matching "{searchQuery}".
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Boxes className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                          <div className="text-gray-500">
                            <p className="text-lg font-medium">No products yet</p>
                            <p className="text-sm mt-1">
                              Start by adding your first product to calculate its carbon footprint.
                            </p>
                          </div>
                          <Link href="/product-list/product">
                            <Button className="mt-4">Add Your First Product</Button>
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phone only stacked list */}
          <div className="sm:hidden space-y-4">
            {paginatedProducts.map(product => (
              <div
                key={product.id}
                className="border rounded-md p-4 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => onProductClick(product.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onProductClick(product.id);
                  }
                }}
                aria-label={`View details for ${product.name}`}
              >
                <div className="mb-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {product.name}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p>Manufacturer: {product.manufacturer_name}</p>
                  <p><abbr title="Stock Keeping Unit">SKU</abbr>: {product.sku}</p>
                  <p>Method: {product.pcf_calculation_method}</p>
                  <p className="flex items-center gap-1">
                    <abbr title="Product Carbon Footprint">PCF</abbr>: {product.emission_total}
                    <Info className="w-3 h-3 text-gray-400" aria-hidden="true" />
                  </p>
                </div>
                <div className="flex justify-end">
                  <div className="grid grid-cols-2 [@media(min-width:480px)]:grid-cols-4 gap-2 mt-3">
                    {/* Export */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="group flex items-center gap-1 text-xs transition-colors
                                                            motion-safe:hover:animate-hue
                                                            motion-safe:active:animate-hue-fast hover:cursor-pointer"
                      onClick={e => onExportClick(product, e)}
                      aria-label={`Export data for ${product.name}`}
                    >
                      <FileDown className="w-3 h-3" aria-hidden="true" />
                      <span>Export</span>
                    </Button>

                    {/* Ask AI */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="group flex items-center gap-1 text-xs transition-colors
                                                            motion-safe:hover:animate-hue
                                                            motion-safe:active:animate-hue-fast hover:cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        onAIButtonClick(product.id);
                      }}
                      aria-label={`Get AI recommendations for ${product.name}`}
                    >
                      <Sparkles className="w-3 h-3 text-purple-500" aria-hidden="true" />
                      <span>Ask&nbsp;AI</span>
                    </Button>

                    {/* Edit */}
                    <Button
                      size="sm"
                      className="flex items-center gap-1 text-xs !bg-blue-500 !border-blue-500 !text-white hover:cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(product.id);
                      }}
                      aria-label={`Edit ${product.name}`}
                    >
                      <Edit className="w-4 h-4 text-white" />
                    </Button>

                    {/* Delete */}
                    <Button
                      size="sm"
                      className="flex items-center gap-1 text-xs !bg-red-500 !border-red-500 !text-white hover:cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(product.id);
                      }}
                      disabled={isDeleting}
                      aria-label={`Delete ${product.name}`}
                    >
                      <Trash className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile empty-state */}
            {paginatedProducts.length === 0 && !dataLoading && (
              <div className="text-center py-8">
                {searchQuery.length > 0 && searchQuery.length < 4 ? (
                  <p className="text-gray-500">Please enter at least 4 characters to search.</p>
                ) : searchQuery.length >= 4 ? (
                  <p className="text-gray-500">No products found matching "{searchQuery}".</p>
                ) : (
                  <div className="space-y-4">
                    <Boxes className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                    <div className="text-gray-500">
                      <p className="text-lg font-medium">No products yet</p>
                      <p className="text-sm mt-1">
                        Start by adding your first product to calculate its carbon footprint.
                      </p>
                    </div>
                    <Link href="/product-list/product">
                      <Button className="mt-4">Add Your First Product</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {products.length > 0 && (
            <nav
              className="flex justify-between items-center mt-4"
              aria-label="Product list pagination"
            >
              <div className="flex items-center gap-2">
                <Button
                  className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Go to previous page"
                >
                  Previous
                </Button>
                <span className="text-sm" aria-current="page" aria-live="polite">
                  Page {currentPage} of {Math.ceil(products.length / rowsPerPage)}
                </span>
                <Button
                  className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage * rowsPerPage >= products.length}
                  aria-label="Go to next page"
                >
                  Next
                </Button>
              </div>
              <div>
                <label htmlFor="rows-per-page" className="text-sm">
                  Rows per page:
                </label>
                <select
                  id="rows-per-page"
                  className="border rounded px-2 py-1 text-sm ml-2 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={rowsPerPage}
                  onChange={e => {
                    const newValue = Number(e.target.value);
                    onRowsPerPageChange(newValue);
                    onPageChange(1);
                  }}
                  aria-label="Select number of rows per page"
                >
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </nav>
          )}
        </>
      )}
    </>
  );
}
