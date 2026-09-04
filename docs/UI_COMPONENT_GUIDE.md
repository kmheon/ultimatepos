# UI Component Guide

All components in Nebula ERP must be imported from `@/core/ui` (or relative path to `src/core/ui`).

## 1. Layouts & Pages
- `<NebulaPage>`: **Primary required wrapper** for every page in Nebula ERP. Automatically renders AppShell, ModuleHeader, WorkspaceTabs, PageToolbar, Theme Provider, and responsive layout.
- `<AppShell>`: Top-level shell with sidebar and navbar support.
- `<ModuleLayout>`: Standardized container for module views (header + workspace tabs + toolbar + content).
- `<PageLayout>`: Consistent page canvas with optional title, description, and actions.
- `<WorkspaceLayout>`: Split layout with workspace sidebar and content area.

## 2. Navigation
- `<NebulaModuleHeader>`: Standard header with icon, title, badge, description, and actions.
- `<NebulaWorkspaceTabs>`: Responsive contextual workspace tab bar with priority collapse and tooltips.
- `<Breadcrumbs>`: Hierarchical navigation trail.

## 3. Cards & Metrics
- `<NebulaMetricCard>`: KPI metric display with trend indicator and icon.
- `<SummaryCard>`: Container card for grouped information.
- `<ChartCard>`: Container for analytics charts.
- `<TableCard>`: Card housing data tables.
- `<ActionCard>`: Interactive navigation card.

## 4. Tables
- `<NebulaTable>`: High-performance data table supporting sorting, multi-selection, pagination, and custom accessors.

## 5. Forms & Modals
- `<NebulaForm>` / `<NebulaSection>` / `<NebulaField>`: Structured form layout with validation and hints.
- `<NebulaWizard>`: Multi-step process wizard.
- `<NebulaModal>` / `<NebulaDrawer>` / `<NebulaDialog>`: Overlay dialogs and drawers.

## 6. Feedback & States
- `<EmptyState>`, `<Loading>`, `<Skeleton>`, `<ErrorState>`.
