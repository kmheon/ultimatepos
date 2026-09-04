# Nebula Permanent UI Governance Policy (NEB-UI-GOV-01)

## Overview
Nebula ERP operates under a permanent Enterprise UI Governance policy. This policy ensures that all future modules, pages, features, reports, dialogs, forms, and tables adhere strictly to the centralized Nebula Design System (`src/core/ui/`).

## Non-Negotiable Rules
1. **Never Create Custom UI**: If a component (Table, Card, Header, Toolbar, Form, Dialog, Modal, Drawer, Wizard, Badge, Button, Tabs) exists in `src/core/ui/`, it **MUST** be reused. Creating duplicate or module-specific UI elements is strictly prohibited.
2. **Configuration-Driven Navigation**: All modules must define navigation, workspaces, and permissions through centralized configuration rather than custom JSX.
3. **Centralized Theme Tokens**: All colors, typography, spacing, radius, shadows, and animations must derive exclusively from `src/core/ui/theme/tokens.ts`.
4. **Strict Layout Hierarchy**: Every page must render through the standard shell:
   ```tsx
   <AppShell>
     <ModuleLayout>
       <NebulaModuleHeader />
       <NebulaWorkspaceTabs />
       <PageToolbar />
       <PageLayout />
     </ModuleLayout>
   </AppShell>
   ```

## Mandatory 5-Phase Development Workflow
- **Phase 1**: UI Compliance Audit (inspect target page against Design System).
- **Phase 2**: Discover Existing Components (search repo before building).
- **Phase 3**: Extend Design System (if new generalized pattern is needed).
- **Phase 4**: Build (compose shared components).
- **Phase 5**: Compliance Verification (verify tests, TypeScript, build, linter, and design system adherence).
