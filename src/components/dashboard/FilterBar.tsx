import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption = { value: string; label: string };

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  sortOptions?: SortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  className?: string;
}

/** Search + optional status filter + optional sort. */
export function FilterBar({
  searchPlaceholder = "Search…",
  searchValue,
  onSearchChange,
  statusOptions,
  statusValue,
  onStatusChange,
  sortOptions,
  sortValue,
  onSortChange,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-3", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9 h-10 rounded-lg"
        />
      </div>
      {statusOptions != null && statusOptions.length > 0 && onStatusChange != null && (
        <Select value={statusValue ?? "all"} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[160px] h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {sortOptions != null && sortOptions.length > 0 && onSortChange != null && (
        <Select value={sortValue ?? "newest"} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-[160px] h-10">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
