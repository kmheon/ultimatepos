# Layout Architecture

Every page in Nebula ERP must render through the centralized `<NebulaPage>` component, which enforces the Nebula Design System layout hierarchy automatically:

```tsx
<NebulaPage
  moduleName="Service Management"
  icon={Wrench}
  title="Service Requests"
  description="Manage customer service requests and technician assignments."
  workspaces={workspaces}
  activeWorkspace={activeWorkspace}
  onWorkspaceChange={setActiveWorkspace}
  searchValue={search}
  onSearchChange={setSearch}
  searchPlaceholder="Search requests..."
  filters={filters}
  activeFilter={activeFilter}
  onFilterChange={setActiveFilter}
>
  {/* Page-specific content & components */}
</NebulaPage>
```

## Rules
- No page may implement its own layout shell, custom module header, or toolbar.
- All pages must use `<NebulaPage>` as the top-level container.
- All padding, spacing, and scrolling containers are managed centrally by the design system.
