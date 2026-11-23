/**
 * socle-ui — seul point d'entrée public du design system Socle.
 *
 * Les composants, patterns et gabarits sont exportés ici, et uniquement ici,
 * au fur et à mesure qu'ils sont spécifiés (mode `define`) puis codés.
 * Styles : importer `socle-ui/styles.css` une fois dans l'app.
 */
export const SOCLE_VERSION = "0.2.0";

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
export { Dialog } from "./components/Dialog/Dialog";
export type { DialogProps, DialogSize } from "./components/Dialog/Dialog";
export { useConfirm } from "./components/Dialog/useConfirm";
export type { ConfirmOptions, ConfirmFunction } from "./components/Dialog/useConfirm";
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
export type { DetailPanelComposedProps, DetailPanelDeclarativeProps, DetailHeader, DetailSection, DetailField, SectionSummary } from "./patterns/DetailPanel/DetailPanel";
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
export { ActionBar, arrangeActions } from "./patterns/ActionBar/ActionBar";
export type { Action, ActionZone, ActionBarProps, ArrangedActions } from "./patterns/ActionBar/ActionBar";
export { createNotifications } from "./components/Toast/notifications";
export type { Notifications, NotificationsOptions, NotifyOptions, NotificationRecord, NotificationTone, NotificationAction } from "./components/Toast/notifications";
export { useNotify, useNotifications } from "./provider/SocleProvider";
export { NotificationCenter } from "./patterns/NotificationCenter/NotificationCenter";
export { TextField } from "./components/TextField/TextField";
export type { TextFieldProps } from "./components/TextField/TextField";
export { TextArea } from "./components/TextArea/TextArea";
export type { TextAreaProps } from "./components/TextArea/TextArea";
export { Select } from "./components/Select/Select";
export type { SelectProps, SelectOption, SelectSection } from "./components/Select/Select";
export type { FieldWidth } from "./components/Field/Field";
export { Checkbox, CheckboxGroup } from "./components/Checkbox/Checkbox";
export type { CheckboxProps, CheckboxGroupProps } from "./components/Checkbox/Checkbox";
export { RadioGroup } from "./components/RadioGroup/RadioGroup";
export type { RadioGroupProps, RadioOptionProps } from "./components/RadioGroup/RadioGroup";
export { Switch } from "./components/Switch/Switch";
export type { SwitchProps } from "./components/Switch/Switch";
export { Fieldset } from "./components/Fieldset/Fieldset";
export type { FieldsetProps } from "./components/Fieldset/Fieldset";
export { ComboBox } from "./components/ComboBox/ComboBox";
export type { ComboBoxProps, ComboBoxSingleProps, ComboBoxMultipleProps, ComboBoxItem } from "./components/ComboBox/ComboBox";
export { FormattedValue, useFormatValue, valueSortKey, valueLayout } from "./components/FormattedValue/FormattedValue";
export type { FormattedValueProps, ValueFormat, ValueType, StatusMap } from "./components/FormattedValue/FormattedValue";
export { ListPage } from "./templates/ListPage/ListPage";
export type { ListPageProps, ListPageColumn, ListPageFilter, ListPageSort, ListPageState } from "./templates/ListPage/ListPage";
export { FormPage } from "./templates/FormPage/FormPage";
export type { FormPageProps, FormSection } from "./templates/FormPage/FormPage";
export { useOpenForm } from "./templates/FormDialog/FormDialog";
export type { OpenFormOptions, OpenFormFunction } from "./templates/FormDialog/FormDialog";
export type {
  FormField,
  FormInputField,
  FieldsetFormField,
  TextFormField,
  NumberFormField,
  TextAreaFormField,
  SelectFormField,
  ComboBoxFormField,
  RadioFormField,
  CheckboxFormField,
  CheckboxGroupFormField,
  FormChoice,
  FormCheck,
  FormValue,
  FormValues,
  FormSubmit,
  FormSubmitResult,
} from "./lib/form";
export { SettingsPage } from "./templates/SettingsPage/SettingsPage";
  SettingsPageProps,
  SettingsGroup,
  SettingsCategory,
  SettingsSection,
  Setting,
  SwitchSetting,
  SelectSetting,
  TextSetting,
  ActionSetting,
  ItemSetting,
  InfoSetting,
  SettingTag,
} from "./templates/SettingsPage/SettingsPage";
export { Page, PageSection } from "./templates/Page/Page";
export type { PageProps, PageSectionProps, PageEmpty, PageWidth } from "./templates/Page/Page";
export { DetailPage } from "./templates/DetailPage/DetailPage";
export type { DetailPageProps, DetailPageBack } from "./templates/DetailPage/DetailPage";
export { TreeView } from "./components/TreeView/TreeView";
export type { TreeViewProps, TreeNode, TreeMoveTarget } from "./components/TreeView/TreeView";
export { Terminal } from "./components/Terminal/Terminal";
export type { TerminalProps, TerminalHandle, TerminalConnection, TerminalState } from "./components/Terminal/Terminal";
export type { TerminalEngine, TerminalEngineSource } from "./components/Terminal/terminalEngine";
export { LogViewer } from "./components/LogViewer/LogViewer";
export type { LogViewerProps, LogViewerHandle, LogViewerView, LogLevelFilter, LogLine, LogLevel } from "./components/LogViewer/LogViewer";
export { DiffView, DiffStat } from "./components/DiffView/DiffView";
export type { DiffViewProps, DiffViewMode, DiffStatProps } from "./components/DiffView/DiffView";
