import { useState, useMemo, useEffect, ReactNode } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useScreenSize } from "@/hooks/useScreenSize";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  className?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  filters?: FilterOption[];
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  emptyState?: ReactNode;
  loading?: boolean;
  className?: string;
  mobileCardRender?: (item: T, index: number) => ReactNode;
  showViewToggle?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Tìm kiếm...",
  filters = [],
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  emptyState,
  loading = false,
  className = "",
  mobileCardRender,
  showViewToggle = false,
}: DataTableProps<T>) {
  const { isMobile, isTablet } = useScreenSize();
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultPageSize);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Initialize filter values
  useEffect(() => {
    const initialFilters: Record<string, string> = {};
    filters.forEach(filter => {
      initialFilters[filter.key] = "all";
    });
    setFilterValues(initialFilters);
  }, [filters]);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      const searchableColumns = columns.filter(col => col.searchable !== false);
      result = result.filter(item => {
        return searchableColumns.some(col => {
          const value = item[col.key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply custom filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter(item => {
          const itemValue = item[key];
          return itemValue === value || itemValue?.toString() === value;
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filterValues, sortConfig, columns]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValues, itemsPerPage]);

  const handleSort = (key: string) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === "asc" 
          ? { key, direction: "desc" }
          : null;
      }
      return { key, direction: "asc" };
    });
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilterValues(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Controls */}
      <Card className="shadow-sm border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            {/* Top row: Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* View Toggle - Only show on mobile/tablet */}
              {showViewToggle && (isMobile || isTablet) && (
                <div className="flex items-center gap-1">
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "cards" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("cards")}
                    className="px-3"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Bottom row: Filters and Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* Filters */}
              <div className="flex flex-wrap gap-2 flex-1">
                {filters.map(filter => (
                  <div key={filter.key} className="flex items-center gap-2 min-w-0">
                    <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Select 
                      value={filterValues[filter.key] || "all"} 
                      onValueChange={(value) => handleFilterChange(filter.key, value)}
                    >
                      <SelectTrigger className="w-32 sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {filter.options.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {/* Items per page */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Hiển thị:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                  <SelectTrigger className="w-16 sm:w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map(size => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results info */}
          <div className="mt-3 text-xs sm:text-sm text-muted-foreground">
            Hiển thị {paginatedData.length} trong tổng số {processedData.length} mục
            {searchTerm && (
              <span className="block sm:inline sm:ml-1">
                (tìm kiếm: "{searchTerm}")
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table or Cards */}
      <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="p-0">
          {/* Mobile Card View */}
          {(viewMode === "cards" || (!showViewToggle && isMobile)) && mobileCardRender ? (
            <div className="p-4">
              <div className="grid gap-4">
                {paginatedData.map((item, index) => (
                  <div key={item.id || index}>
                    {mobileCardRender(item, (currentPage - 1) * itemsPerPage + index)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b-2">
                    {columns.map((column) => (
                      <TableHead 
                        key={column.key}
                        className={cn(
                          "font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wide",
                          column.hideOnMobile && "hidden sm:table-cell",
                          column.hideOnTablet && "hidden lg:table-cell",
                          column.sortable && "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600",
                          column.className
                        )}
                        onClick={() => column.sortable && handleSort(column.key)}
                      >
                        <div className="flex items-center gap-2">
                          {column.header}
                          {column.sortable && sortConfig?.key === column.key && (
                            <span className="text-primary">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item, index) => (
                    <TableRow 
                      key={item.id || index} 
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800"
                    >
                      {columns.map((column) => (
                        <TableCell 
                          key={column.key}
                          className={cn(
                            column.hideOnMobile && "hidden sm:table-cell",
                            column.hideOnTablet && "hidden lg:table-cell",
                            column.className
                          )}
                        >
                          {column.render 
                            ? column.render(item, (currentPage - 1) * itemsPerPage + index)
                            : item[column.key]
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Empty state */}
          {processedData.length === 0 && (
            <div className="text-center py-12 sm:py-16 px-4">
              {emptyState || (
                <div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                    <Search className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {data.length === 0 ? "Không có dữ liệu" : "Không tìm thấy kết quả"}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {data.length === 0 
                      ? "Chưa có dữ liệu để hiển thị"
                      : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                    }
                  </p>
                  {data.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        const resetFilters: Record<string, string> = {};
                        filters.forEach(filter => {
                          resetFilters[filter.key] = "all";
                        });
                        setFilterValues(resetFilters);
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {processedData.length > 0 && totalPages > 1 && (
        <Card className="shadow-sm border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Page info */}
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                <span className="block sm:inline">
                  Trang {currentPage} / {totalPages}
                </span>
                <span className="block sm:inline sm:ml-2">
                  ({((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, processedData.length)} của {processedData.length})
                </span>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="hidden sm:flex px-2 sm:px-3"
                >
                  Đầu
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Trước</span>
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
                    const maxVisible = isMobile ? 3 : 5;
                    let pageNum: number;
                    
                    if (totalPages <= maxVisible) {
                      pageNum = i + 1;
                    } else if (currentPage <= Math.ceil(maxVisible / 2)) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - Math.floor(maxVisible / 2)) {
                      pageNum = totalPages - maxVisible + 1 + i;
                    } else {
                      pageNum = currentPage - Math.floor(maxVisible / 2) + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0 text-xs sm:text-sm"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 sm:px-3"
                >
                  <span className="hidden sm:inline mr-1">Sau</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="hidden sm:flex px-2 sm:px-3"
                >
                  Cuối
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}