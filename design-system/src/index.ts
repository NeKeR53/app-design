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
export { Button } from "./components/Button/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./components/Button/Button";
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
export { StatusBadge, StatusDot } from "./components/StatusBadge/StatusBadge";
export type { StatusBadgeProps, StatusDotProps, StatusTone } from "./components/StatusBadge/StatusBadge";
export { Avatar } from "./components/Avatar/Avatar";
export type { AvatarProps } from "./components/Avatar/Avatar";
export { ProgressBar } from "./components/ProgressBar/ProgressBar";
export type { ProgressBarProps } from "./components/ProgressBar/ProgressBar";
export { Skeleton, SkeletonGroup } from "./components/Skeleton/Skeleton";
export type { SkeletonProps, SkeletonGroupProps } from "./components/Skeleton/Skeleton";
export { EmptyState } from "./components/EmptyState/EmptyState";
export type { EmptyStateProps } from "./components/EmptyState/EmptyState";
export { Link } from "./components/Link/Link";
export type { LinkProps } from "./components/Link/Link";
export { Code } from "./components/Code/Code";
export type { CodeProps } from "./components/Code/Code";
export { Divider } from "./components/Divider/Divider";
export type { DividerProps } from "./components/Divider/Divider";
