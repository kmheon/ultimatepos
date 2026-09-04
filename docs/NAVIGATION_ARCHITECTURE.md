# Navigation Architecture

Nebula ERP utilizes a configuration-driven navigation model.
Modules, pages, and workspaces are defined via metadata objects and rendered by the shared navigation engine (`NebulaWorkspaceTabs` and `NebulaModuleHeader`).

## Workspace Priority & Collapse
Workspaces are sorted by priority and automatically adapt to available screen width, showing tooltips for collapsed items on hover.
