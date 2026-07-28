---
name: vuetify-layout
description: "Vuetify 4 layout and navigation for the Vue SSR Starter Kit: the application shell, the 12-column grid, the top bar, the side navigation drawer, context menus, tab navigation, breadcrumbs, and responsive navigation. Trigger on: building the page shell, grid layout, app bar, navigation drawer, menus, tabs, breadcrumbs, or responsive navigation. Don't use for: which-component decision tree and useDisplay breakpoint basics (→ vuetify-overview), cards/dialogs/alerts (→ vuetify-components), forms (→ vuetify-forms), data tables (→ vuetify-data), theming (→ vuetify-theming), SCSS layout mixins (→ design-scss)."
---

# Navigation Components

## Component selection

| Need                     | Component                            | Notes                                    |
| --------------------------- | --------------------------------------- | -------------------------------------------- |
| 12-column grid              | `v-container` + `v-row` + `v-col`       | responsive `cols`/`sm`/`md`/`lg` props          |
| Top bar                     | `v-app-bar`                              | flat, density comfortable                        |
| Side navigation             | `v-navigation-drawer`                     | temporary on mobile, rail on desktop               |
| Context menu / dropdown     | `v-menu`                                   | activator slot pattern                               |
| Tabbed content              | `v-tabs` + `v-tabs-window`                  | with v-tab items                                       |
| Hierarchical path           | `v-breadcrumbs`                              | —                                                          |
| Mobile bottom navigation    | `v-bottom-navigation`                         | shown only when `mobile` (useDisplay)                        |

## Hard rules

- **Branch navigation on `useDisplay`'s `mobile`**, never a hardcoded pixel breakpoint — `:temporary="mobile"` / `:rail="!mobile"` on the drawer, `v-if="mobile"` to switch between drawer and tabs. See `vuetify-overview` for `useDisplay` basics.
- **Reuse one `navItems` array** (icon/title/to) across `v-list`, `v-tabs`, and `v-bottom-navigation` instead of duplicating the navigation structure per component.
- **`v-col` always lives inside a `v-row` inside a `v-container`** — never place a bare `v-col` without its row/container ancestors.

## Reference files

| Need                                              | File                                       |
| ---------------------------------------------------- | --------------------------------------------- |
| Grid layout, `v-app-bar`, `v-navigation-drawer`       | `references/app-shell.md`                       |
| `v-menu`, `v-tabs`/`v-tabs-window`, `v-breadcrumbs`     | `references/menus-tabs-breadcrumbs.md`            |
| Responsive navigation patterns (mobile vs desktop)      | `references/responsive-navigation.md`               |
