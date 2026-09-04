# Nebula Design System & Enforced Page Architecture

Welcome to the **Nebula Design System** architecture guide. From this point onward, every page and module in the application **MUST** be built using the standardized `<NebulaPage>` component.

## Core Objective
To ensure 100% consistency in visual hierarchy, spacing, responsive layout, navigation tabs, toolbars, and app shell integration across all modules.

---

## The Standard Page Pattern

Every new page or module view must start with and render through `<NebulaPage>`.

```tsx
import React from 'react';
import { Wrench } from 'lucide-react';
import { NebulaPage } from '../../core/ui';

export const MyNewModuleView: React.FC = () => {
  return (
    <NebulaPage
      icon={Wrench}
      title="Service Management"
      description="Manage customer service requests, work orders, and field technicians."
      badge="Active"
      workspaces={[
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'requests', label: 'Requests', icon: ClipboardList, badge: '5' },
        { id: 'work_orders', label: 'Work Orders', icon: Wrench },
      ]}
      activeWorkspace={activeSubTab}
      onWorkspaceChange={(id) => setActiveSubTab(id)}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search requests, assets, or work orders..."
      actions={
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
          New Record
        </button>
      }
    >
      {/* Page Content Goes Here */}
    </NebulaPage>
  );
};
```

---

## Required Props for `<NebulaPage>`

| Prop Name | Type | Description |
| :--- | :--- | :--- |
| `icon` | `LucideIcon` | The icon displayed in the module header. |
| `title` | `string` | Primary heading for the module/page. |
| `description` | `string` | Explanatory subtitle or description. |
| `badge` | `string` (optional) | Status badge next to the title. |
| `actions` | `React.ReactNode` (optional) | Primary action buttons in the header. |
| `workspaces` | `NebulaWorkspaceItem[]` (optional) | Workspace/sub-navigation tabs configuration. |
| `activeWorkspace` | `string` (optional) | Currently active workspace ID. |
| `onWorkspaceChange` | `(id: string) => void` (optional) | Handler when switching workspace tabs. |
| `searchValue` | `string` (optional) | Search input value for the standardized toolbar. |
| `onSearchChange` | `(val: string) => void` (optional) | Search query change handler. |
| `searchPlaceholder` | `string` (optional) | Placeholder text for search input. |
| `filters` | `FilterOption[]` (optional) | Filter dropdown options. |
| `activeFilter` | `string` (optional) | Currently selected filter ID. |
| `onFilterChange` | `(id: string) => void` (optional) | Filter change handler. |
| `onExportCSV` | `() => void` (optional) | Built-in CSV export handler. |
| `onExportPDF` | `() => void` (optional) | Built-in PDF export handler. |
| `children` | `React.ReactNode` | The main view contents. |

---

## Architectural Rules
1. **No Manual Layouts**: Never create custom header banners, wrapper divs with inconsistent paddings (`p-6` vs `p-8`), or custom toolbars. Always use `<NebulaPage>`.
2. **Standard Spacing**: All spacing and scrolling are handled automatically by `PageLayout` inside `<NebulaPage>`.
3. **Enforced Consistency**: Shared layout components (`ModuleLayout`, `PageLayout`, `NebulaModuleHeader`, `NebulaWorkspaceTabs`, `PageToolbar`) are the only supported approach.
