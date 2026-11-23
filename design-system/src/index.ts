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
