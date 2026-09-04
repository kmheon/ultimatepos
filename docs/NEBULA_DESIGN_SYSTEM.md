# Nebula Design System

Welcome to the **Nebula Design System**, the unified enterprise UI platform powering Nebula ERP.

## Core Principles
1. **Single Source of Truth**: All UI components, styles, colors, and layout patterns originate from `src/core/ui/`.
2. **Configuration over Custom UI**: New modules and pages are built by composing existing components and data configs rather than writing custom UI code.
3. **Strict Visual Consistency**: All design values (spacing, radius, typography, shadow, color) are tokenized and enforced.

## Architecture Structure
```text
src/core/ui/
    theme/       # Design tokens & theme configuration
    layout/      # AppShell, ModuleLayout, PageLayout, WorkspaceLayout
    navigation/  # NebulaModuleHeader, NebulaWorkspaceTabs, Breadcrumbs
    toolbar/     # PageToolbar, SearchBar, FilterBar, BulkActions, ExportActions
    cards/       # NebulaMetricCard, SummaryCard, ChartCard, TableCard, ActionCard
    tables/      # NebulaTable
    forms/       # NebulaForm, NebulaSection, NebulaField, NebulaWizard, NebulaModal, NebulaDrawer
    feedback/    # EmptyState, Loading, Skeleton, ErrorState
    buttons/     # NebulaButton
    badges/      # NebulaBadge
    dialogs/     # NebulaDialog
    charts/      # NebulaChartContainer
    timeline/    # NebulaTimeline
```
