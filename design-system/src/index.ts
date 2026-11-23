/**
 * socle-ui — seul point d'entrée public du design system Socle.
 *
 * Les composants, patterns et gabarits sont exportés ici, et uniquement ici,
 * au fur et à mesure qu'ils sont spécifiés (mode `define`) puis codés.
 * Styles : importer `socle-ui/styles.css` une fois dans l'app.
 */
export const SOCLE_VERSION = "0.1.0";

export { SocleProvider, useSocle } from "./provider/SocleProvider";
export { frenchMessages } from "./i18n/messages";
export type { SocleMessages } from "./i18n/messages";
export type { SocleProviderProps, Platform, Density, ColorScheme } from "./provider/SocleProvider";

export { Tooltip } from "./components/Tooltip/Tooltip";
export type { TooltipProps } from "./components/Tooltip/Tooltip";
export { IconButton } from "./components/IconButton/IconButton";
export type { IconButtonProps } from "./components/IconButton/IconButton";
export { Menu } from "./components/Menu/Menu";
export type { MenuProps, MenuItemProps, MenuSectionProps, MenuSubmenuProps } from "./components/Menu/Menu";
export { Tabs } from "./components/Tabs/Tabs";
export type { TabsProps, TabItem } from "./components/Tabs/Tabs";
export { Sidebar } from "./patterns/Sidebar/Sidebar";
export type { SidebarProps, SidebarItemProps, SidebarTreeItemProps, SidebarSectionProps, SidebarAccountProps, SidebarAction } from "./patterns/Sidebar/Sidebar";
export { AppShell } from "./patterns/AppShell/AppShell";
export type { AppShellProps, TabbarEntry } from "./patterns/AppShell/AppShell";
export { DetailPanel, PropertyRow } from "./patterns/DetailPanel/DetailPanel";
export type { DetailPanelProps, DetailPanelSectionProps, PropertyRowProps, PropertyAction } from "./patterns/DetailPanel/DetailPanel";
export { Table } from "./components/Table/Table";
export type { TableProps, TableColumn, TableRowAction } from "./components/Table/Table";
export { List } from "./components/List/List";
export type { ListProps, ListItemData, ListGroup } from "./components/List/List";
export { SearchField } from "./components/SearchField/SearchField";
export type { SearchFieldProps, SearchCriteria, SearchSuggestion, SearchTag } from "./components/SearchField/SearchField";
