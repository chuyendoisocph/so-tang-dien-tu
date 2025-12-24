# DataTable Component

Component DataTable tái sử dụng được với đầy đủ tính năng phân trang, tìm kiếm, lọc, sắp xếp và responsive design tối ưu cho desktop, tablet và mobile.

## Tính năng

- ✅ **Phân trang**: Điều hướng qua các trang với pagination controls
- ✅ **Tìm kiếm**: Tìm kiếm toàn văn qua các cột có thể tìm kiếm
- ✅ **Lọc**: Bộ lọc dropdown tùy chỉnh
- ✅ **Sắp xếp**: Sắp xếp theo cột (asc/desc)
- ✅ **Responsive Design**: Tối ưu cho desktop, tablet và mobile
- ✅ **Mobile Card View**: Hiển thị dạng card trên mobile
- ✅ **View Toggle**: Chuyển đổi giữa table và card view
- ✅ **Column Visibility**: Ẩn/hiện cột theo breakpoint
- ✅ **Empty State**: Hiển thị trạng thái trống tùy chỉnh
- ✅ **Loading State**: Hiển thị loading spinner
- ✅ **Customizable**: Render tùy chỉnh cho từng cột

## Responsive Breakpoints

- **Mobile**: < 640px - Hiển thị card view hoặc table rút gọn
- **Tablet**: 640px - 1024px - Table view với một số cột ẩn
- **Desktop**: >= 1024px - Full table view với tất cả cột

## Cách sử dụng

### Import

```tsx
import { DataTable, Column, FilterOption } from "@/components/ui/data-table";
```

### Định nghĩa Columns với Responsive

```tsx
const columns: Column<YourDataType>[] = [
  {
    key: "id",
    header: "ID",
    sortable: true,
    searchable: false,
    hideOnMobile: true, // Ẩn trên mobile
    className: "w-12",
  },
  {
    key: "name",
    header: "Tên",
    render: (item) => (
      <div className="font-semibold text-sm sm:text-base">{item.name}</div>
    ),
    sortable: true,
    searchable: true,
  },
  {
    key: "status",
    header: "Trạng thái",
    render: (item) => (
      <Badge variant={item.status === "active" ? "default" : "secondary"}>
        <span className="hidden sm:inline">
          {item.status === "active" ? "Hoạt động" : "Không hoạt động"}
        </span>
        <span className="sm:hidden">
          {item.status === "active" ? "ON" : "OFF"}
        </span>
      </Badge>
    ),
    sortable: true,
    searchable: false,
    hideOnTablet: true, // Ẩn trên tablet
  },
];
```

### Mobile Card Render

```tsx
const mobileCardRender = (item: YourDataType, index: number) => (
  <Card className="shadow-sm border">
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          {item.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
          <div className="flex items-center justify-between mt-2">
            <Badge variant={item.status === "active" ? "default" : "secondary"}>
              {item.status}
            </Badge>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost">
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
```

### Sử dụng Component với Responsive

```tsx
<DataTable
  data={yourData}
  columns={columns}
  searchPlaceholder="Tìm kiếm..."
  filters={filters}
  defaultPageSize={10}
  pageSizeOptions={[5, 10, 20, 50]}
  emptyState={<CustomEmptyState />}
  loading={isLoading}
  mobileCardRender={mobileCardRender}
  showViewToggle={true} // Hiển thị toggle view trên mobile/tablet
/>
```

## Props

### DataTable Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `data` | `T[]` | - | Dữ liệu để hiển thị |
| `columns` | `Column<T>[]` | - | Định nghĩa các cột |
| `searchPlaceholder` | `string` | "Tìm kiếm..." | Placeholder cho ô tìm kiếm |
| `filters` | `FilterOption[]` | `[]` | Các bộ lọc |
| `defaultPageSize` | `number` | `10` | Số item mặc định mỗi trang |
| `pageSizeOptions` | `number[]` | `[5, 10, 20, 50]` | Các tùy chọn số item mỗi trang |
| `emptyState` | `ReactNode` | - | Component hiển thị khi không có dữ liệu |
| `loading` | `boolean` | `false` | Trạng thái loading |
| `className` | `string` | `""` | CSS class tùy chỉnh |
| `mobileCardRender` | `(item: T, index: number) => ReactNode` | - | Render function cho mobile card view |
| `showViewToggle` | `boolean` | `false` | Hiển thị toggle giữa table và card view |

### Column Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `key` | `string` | - | Key của cột trong data |
| `header` | `string` | - | Tiêu đề cột |
| `render` | `(item: T, index: number) => ReactNode` | - | Hàm render tùy chỉnh |
| `sortable` | `boolean` | `false` | Có thể sắp xếp |
| `searchable` | `boolean` | `true` | Có thể tìm kiếm |
| `hideOnMobile` | `boolean` | `false` | Ẩn cột trên mobile (< 640px) |
| `hideOnTablet` | `boolean` | `false` | Ẩn cột trên tablet (< 1024px) |
| `className` | `string` | - | CSS class cho cột |

## Responsive Design Best Practices

### 1. Column Priority
- **Essential**: Tên, trạng thái, actions - luôn hiển thị
- **Important**: ID, ngày tạo - ẩn trên mobile
- **Optional**: Mô tả, metadata - ẩn trên tablet

### 2. Mobile Card Design
- Sử dụng avatar/icon để nhận diện
- Hiển thị thông tin quan trọng nhất
- Actions nên gọn gàng và dễ touch
- Sử dụng badges cho trạng thái

### 3. Touch-Friendly
- Button size tối thiểu 44px trên mobile
- Spacing đủ lớn giữa các elements
- Hover states chỉ áp dụng trên desktop

### 4. Performance
- Lazy loading cho large datasets
- Virtual scrolling cho danh sách dài
- Debounced search để giảm API calls

## Ví dụ hoàn chỉnh

Xem các file sau để tham khảo:
- `src/components/admin/ProfilesTabWithDataTable.tsx` - Quản lý profiles với responsive design
- `src/components/admin/CommentsTab.tsx` - Quản lý comments
- `src/hooks/useScreenSize.ts` - Hook detect screen size

## Accessibility

- Keyboard navigation support
- ARIA labels cho các controls
- Screen reader friendly
- Focus management
- High contrast support