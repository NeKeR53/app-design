/**
 * socle-ui — seul point d'entrée public du design system Socle.
 *
 * Les composants, patterns et gabarits sont exportés ici, et uniquement ici,
 * au fur et à mesure qu'ils sont spécifiés (mode `define`) puis codés.
 * Styles : importer `socle-ui/styles.css` une fois dans l'app.
 */
export const SOCLE_VERSION = "1.9.0";

export { SocleProvider, useSocle } from "./provider/SocleProvider";
export { frenchMessages } from "./i18n/messages";
export type { SocleMessages } from "./i18n/messages";
export type { SocleProviderProps, Platform, Density, ColorScheme } from "./provider/SocleProvider";
export { THEME_TOKENS } from "./provider/theme";
export type { SocleTheme, ThemeToken, ThemeMode, ThemeIcons } from "./provider/theme";
export { ICON_NAMES } from "./icons";
export type { IconName } from "./icons";

export { Tooltip } from "./components/Tooltip/Tooltip";
export type { TooltipProps } from "./components/Tooltip/Tooltip";
export { Button } from "./components/Button/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./components/Button/Button";
export { IconButton } from "./components/IconButton/IconButton";
export type { IconButtonProps } from "./components/IconButton/IconButton";
export { Modal } from "./components/Modal/Modal";
export type { ModalProps, ModalSize } from "./components/Modal/Modal";
export { useConfirm } from "./components/Modal/useConfirm";
export type { ConfirmOptions, ConfirmFunction } from "./components/Modal/useConfirm";
export type { ReturnFocusTarget } from "./components/Modal/focusFallback";
export { DropdownMenu, useContextMenu } from "./components/DropdownMenu/DropdownMenu";
export type { DropdownMenuProps, DropdownMenuItemProps, DropdownMenuSectionProps, DropdownMenuSubmenuProps, MenuPoint, ContextMenuState, ContextMenuTargetProps } from "./components/DropdownMenu/DropdownMenu";
export { Tabs, TabPanel, useTabPanelProps } from "./components/Tabs/Tabs";
export type { TabsProps, TabItem, TabPanelProps } from "./components/Tabs/Tabs";
export { Sidebar, workspaceInitial } from "./patterns/Sidebar/Sidebar"; // workspaceInitial : déprécié en 1.1.0 (D-369)
export type { SidebarProps, SidebarItemProps, SidebarTreeItemProps, SidebarSectionProps, SidebarAccountProps, SidebarAction, SidebarWorkspaceProps, SidebarWorkspaceEntry } from "./patterns/Sidebar/Sidebar";
export { AppShell } from "./patterns/AppShell/AppShell";
export type { AppShellProps, TabbarEntry } from "./patterns/AppShell/AppShell";
export { Drawer, PropertyRow } from "./patterns/Drawer/Drawer";
export type { DrawerProps, DrawerSectionProps, PropertyRowProps, PropertyAction } from "./patterns/Drawer/Drawer";
export type { DrawerComposedProps, DrawerDeclarativeProps, DetailHeader, DetailSection, DetailField, SectionSummary } from "./patterns/Drawer/Drawer";
export { Table } from "./components/Table/Table";
export type { TableProps, TableColumn, TableRowAction } from "./components/Table/Table";
export { List } from "./components/List/List";
export type { ListProps, ListItemData, ListGroup } from "./components/List/List";
export { SearchInput } from "./components/SearchInput/SearchInput";
export type { SearchInputProps, SearchCriteria, SearchSuggestion, SearchTag } from "./components/SearchInput/SearchInput";
export { Badge, BadgeDot } from "./components/Badge/Badge";
export type { BadgeProps, BadgeDotProps, StatusTone } from "./components/Badge/Badge";
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
export { Separator } from "./components/Separator/Separator";
export type { SeparatorProps } from "./components/Separator/Separator";
export { ActionBar, arrangeActions } from "./patterns/ActionBar/ActionBar";
export type { Action, ActionZone, ActionBarProps, ArrangedActions, ActionFit } from "./patterns/ActionBar/ActionBar";
export { createNotifications } from "./components/Toast/notifications";
export type { Notifications, NotificationsOptions, NotifyOptions, NotificationRecord, NotificationTone, NotificationAction } from "./components/Toast/notifications";
export { useNotify, useNotifications } from "./provider/SocleProvider";
export { NotificationCenter } from "./patterns/NotificationCenter/NotificationCenter";
export { TextInput } from "./components/TextInput/TextInput";
export type { TextInputProps } from "./components/TextInput/TextInput";
export { TextArea } from "./components/TextArea/TextArea";
export type { TextAreaProps } from "./components/TextArea/TextArea";
export { Select } from "./components/Select/Select";
export type { SelectProps, SelectOption, SelectSection } from "./components/Select/Select";
export type { FieldWidth } from "./components/Field/Field";
export { Checkbox, CheckboxGroup } from "./components/Checkbox/Checkbox";
export type { CheckboxProps, CheckboxGroupProps } from "./components/Checkbox/Checkbox";
export { RadioButtonGroup } from "./components/RadioButtonGroup/RadioButtonGroup";
export type { RadioButtonGroupProps, RadioOptionProps } from "./components/RadioButtonGroup/RadioButtonGroup";
export { Toggle } from "./components/Toggle/Toggle";
export type { ToggleProps } from "./components/Toggle/Toggle";
export { Fieldset } from "./components/Fieldset/Fieldset";
export type { FieldsetProps } from "./components/Fieldset/Fieldset";
export { ComboBox } from "./components/ComboBox/ComboBox";
export type { ComboBoxProps, ComboBoxSingleProps, ComboBoxMultipleProps, ComboBoxItem } from "./components/ComboBox/ComboBox";
export { FormattedValue, useFormatValue, valueSortKey, valueLayout } from "./components/FormattedValue/FormattedValue";
export type { FormattedValueProps, ValueFormat, ValueType, StatusMap } from "./components/FormattedValue/FormattedValue";
export { ListPage } from "./templates/ListPage/ListPage";
export type { ListPageProps, ListPageColumn, ListPageFilter, ListPageSort, ListPageState } from "./templates/ListPage/ListPage";
export { LoginPage } from "./templates/LoginPage/LoginPage";
export type { LoginPageProps, LoginValues, LoginProvider, LoginResult } from "./templates/LoginPage/LoginPage";
export { FormPage } from "./templates/FormPage/FormPage";
export type { FormPageProps, FormSection } from "./templates/FormPage/FormPage";
export type { FormStep } from "./templates/FormPage/FormPage";
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
export type {
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
export { ChatPage } from "./templates/ChatPage/ChatPage";
export type { ChatPageProps } from "./templates/ChatPage/ChatPage";
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
export { DocumentViewer, ZOOM_STEPS } from "./components/DocumentViewer/DocumentViewer";
export type { DocumentViewerProps } from "./components/DocumentViewer/DocumentViewer";
export { detectFormat } from "./components/DocumentViewer/documentSource";
export type { DocumentData, DocumentFormat } from "./components/DocumentViewer/documentSource";
export type { PdfEngine, PdfDocumentHandle, PdfPageHandle } from "./components/DocumentViewer/pdf";
export { HtmlContent } from "./components/HtmlContent/HtmlContent";
export type { HtmlContentProps } from "./components/HtmlContent/HtmlContent";
export { Accordion } from "./components/Accordion/Accordion";
export type { AccordionProps } from "./components/Accordion/Accordion";
export { InlineEdit } from "./components/InlineEdit/InlineEdit";
export type { InlineEditProps } from "./components/InlineEdit/InlineEdit";
export { ProgressIndicator } from "./components/ProgressIndicator/ProgressIndicator";
export type { ProgressIndicatorProps, StepItem, StepStatus } from "./components/ProgressIndicator/ProgressIndicator";
export { Popover } from "./components/Popover/Popover";
export type { PopoverProps, PopoverWidth, PopoverPlacement } from "./components/Popover/Popover";
export { DatePicker, DateRangePicker } from "./components/DatePicker/DatePicker";
export type { DatePickerProps, DateRangePickerProps, DatePreset, DateRange, IsoDate } from "./components/DatePicker/DatePicker";
export { Alert } from "./components/Alert/Alert";
export type { AlertProps, AlertTone, AlertAction } from "./components/Alert/Alert";
export { NumberField } from "./components/NumberField/NumberField";
export type { NumberFieldProps } from "./components/NumberField/NumberField";

/*
 * Anciens noms, dépréciés en 1.0.0 (D-336) : les composants portent les noms de
 * component.gallery. Ces alias gardent les apps existantes en état de marche pendant
 * une version. Ils seront retirés en 2.0.0. Un alias est le même objet que le
 * nouveau composant : ses parties (`DetailPanel.Section`, `Menu.Item`…) suivent.
 */
import { Accordion } from "./components/Accordion/Accordion";
import type { AccordionProps } from "./components/Accordion/Accordion";
import { Toggle } from "./components/Toggle/Toggle";
import type { ToggleProps } from "./components/Toggle/Toggle";
import { Separator } from "./components/Separator/Separator";
import type { SeparatorProps } from "./components/Separator/Separator";
import { Modal } from "./components/Modal/Modal";
import type { ModalProps, ModalSize } from "./components/Modal/Modal";
import { DropdownMenu } from "./components/DropdownMenu/DropdownMenu";
import type { DropdownMenuProps, DropdownMenuItemProps, DropdownMenuSectionProps, DropdownMenuSubmenuProps } from "./components/DropdownMenu/DropdownMenu";
import { TextInput } from "./components/TextInput/TextInput";
import type { TextInputProps } from "./components/TextInput/TextInput";
import { SearchInput } from "./components/SearchInput/SearchInput";
import type { SearchInputProps } from "./components/SearchInput/SearchInput";
import { ProgressIndicator } from "./components/ProgressIndicator/ProgressIndicator";
import type { ProgressIndicatorProps } from "./components/ProgressIndicator/ProgressIndicator";
import { Badge, BadgeDot } from "./components/Badge/Badge";
import type { BadgeProps, BadgeDotProps } from "./components/Badge/Badge";
import { Drawer } from "./patterns/Drawer/Drawer";
import type { DrawerProps, DrawerSectionProps, DrawerComposedProps, DrawerDeclarativeProps } from "./patterns/Drawer/Drawer";
import { RadioButtonGroup } from "./components/RadioButtonGroup/RadioButtonGroup";
import type { RadioButtonGroupProps } from "./components/RadioButtonGroup/RadioButtonGroup";

/** @deprecated Utiliser Accordion (1.0.0). */
export const Disclosure = Accordion;
/** @deprecated Utiliser AccordionProps (1.0.0). */
export type DisclosureProps = AccordionProps;
/** @deprecated Utiliser Toggle (1.0.0). */
export const Switch = Toggle;
/** @deprecated Utiliser ToggleProps (1.0.0). */
export type SwitchProps = ToggleProps;
/** @deprecated Utiliser Separator (1.0.0). */
export const Divider = Separator;
/** @deprecated Utiliser SeparatorProps (1.0.0). */
export type DividerProps = SeparatorProps;
/** @deprecated Utiliser Modal (1.0.0). */
export const Dialog = Modal;
/** @deprecated Utiliser ModalProps (1.0.0). */
export type DialogProps = ModalProps;
/** @deprecated Utiliser ModalSize (1.0.0). */
export type DialogSize = ModalSize;
/** @deprecated Utiliser DropdownMenu (1.0.0). */
export const Menu = DropdownMenu;
/** @deprecated Utiliser DropdownMenuProps (1.0.0). */
export type MenuProps = DropdownMenuProps;
/** @deprecated Utiliser DropdownMenuItemProps (1.0.0). */
export type MenuItemProps = DropdownMenuItemProps;
/** @deprecated Utiliser DropdownMenuSectionProps (1.0.0). */
export type MenuSectionProps = DropdownMenuSectionProps;
/** @deprecated Utiliser DropdownMenuSubmenuProps (1.0.0). */
export type MenuSubmenuProps = DropdownMenuSubmenuProps;
/** @deprecated Utiliser TextInput (1.0.0). */
export const TextField = TextInput;
/** @deprecated Utiliser TextInputProps (1.0.0). */
export type TextFieldProps = TextInputProps;
/** @deprecated Utiliser SearchInput (1.0.0). */
export const SearchField = SearchInput;
/** @deprecated Utiliser SearchInputProps (1.0.0). */
export type SearchFieldProps = SearchInputProps;
/** @deprecated Utiliser ProgressIndicator (1.0.0). */
export const StepList = ProgressIndicator;
/** @deprecated Utiliser ProgressIndicatorProps (1.0.0). */
export type StepListProps = ProgressIndicatorProps;
/** @deprecated Utiliser Badge (1.0.0). */
export const StatusBadge = Badge;
/** @deprecated Utiliser BadgeProps (1.0.0). */
export type StatusBadgeProps = BadgeProps;
/** @deprecated Utiliser BadgeDot (1.0.0). */
export const StatusDot = BadgeDot;
/** @deprecated Utiliser BadgeDotProps (1.0.0). */
export type StatusDotProps = BadgeDotProps;
/** @deprecated Utiliser Drawer (1.0.0). */
export const DetailPanel = Drawer;
/** @deprecated Utiliser DrawerProps (1.0.0). */
export type DetailPanelProps = DrawerProps;
/** @deprecated Utiliser DrawerSectionProps (1.0.0). */
export type DetailPanelSectionProps = DrawerSectionProps;
/** @deprecated Utiliser DrawerComposedProps (1.0.0). */
export type DetailPanelComposedProps = DrawerComposedProps;
/** @deprecated Utiliser DrawerDeclarativeProps (1.0.0). */
export type DetailPanelDeclarativeProps = DrawerDeclarativeProps;
/** @deprecated Utiliser RadioButtonGroup (1.0.0). */
export const RadioGroup = RadioButtonGroup;
/** @deprecated Utiliser RadioButtonGroupProps (1.0.0). */
export type RadioGroupProps = RadioButtonGroupProps;
/* Tri à trois états, portée de la sélection (D-345, D-347). */
export type { TableSortProps, TableBaseProps } from "./components/Table/Table";
export type { ListPageSelection } from "./templates/ListPage/ListPage";
/* Nouveaux composants P2 et P3 (FileUpload, SegmentedControl, Pagination, Spinner, Card). */
export { FileUpload } from "./components/FileUpload/FileUpload";
export type { FileUploadProps } from "./components/FileUpload/FileUpload";
export { FileList } from "./components/FileUpload/FileList";
export type { FileListProps, FileItem, FileStatus } from "./components/FileUpload/FileList";
export { SegmentedControl } from "./components/SegmentedControl/SegmentedControl";
export type { SegmentedControlProps, SegmentedOption } from "./components/SegmentedControl/SegmentedControl";
export { Pagination, pageEntries } from "./components/Pagination/Pagination";
export type { PaginationProps, PageEntry } from "./components/Pagination/Pagination";
export { Spinner } from "./components/Spinner/Spinner";
export type { SpinnerProps, SpinnerSize } from "./components/Spinner/Spinner";
export { Card } from "./components/Card/Card";
export type { CardProps, CardDefaultProps, CardMetricProps, CardDelta, CardDeltaTone, CardHeadingLevel } from "./components/Card/Card";
/* Nouveaux composants P4 (SplitButton, Slider, ColorPicker ; D-365 à D-367). */
export { SplitButton } from "./components/SplitButton/SplitButton";
export type { SplitButtonProps, SplitButtonItem, SplitButtonVariant } from "./components/SplitButton/SplitButton";
export { Slider } from "./components/Slider/Slider";
export type { SliderProps, SliderValue } from "./components/Slider/Slider";
export { ColorPicker, defaultColors } from "./components/ColorPicker/ColorPicker";
export type { ColorPickerProps, ColorOption } from "./components/ColorPicker/ColorPicker";
/* Nouveaux composants P4 (Tag, CodeField ; D-362, D-363). */
export { Tag, TagGroup } from "./components/Tag/Tag";
export type { TagProps, TagGroupProps } from "./components/Tag/Tag";
export { CodeField } from "./components/CodeField/CodeField";
export type { CodeFieldProps } from "./components/CodeField/CodeField";
/* Jauge d'usage et lignes de limite (D-378). */
export { UsageRing } from "./components/UsageRing/UsageRing";
export type { UsageRingProps, UsageRingAction } from "./components/UsageRing/UsageRing";
export { UsageMeter } from "./components/UsageRing/UsageMeter";
export type { UsageMeterProps } from "./components/UsageRing/UsageMeter";
export type { UsageTone } from "./components/UsageRing/usage";
/* Zone de saisie du chat (D-371 à D-374). */
export { ChatComposer, isLongPaste, clipboardImages } from "./components/ChatComposer/ChatComposer";
export type { ChatComposerProps, ChatComposerHandle, ChatAddMenuItem, ChatSubmitMode } from "./components/ChatComposer/ChatComposer";
export { ChatOptions, ChatOptionButton } from "./components/ChatComposer/ChatOptions";
export type { ChatOptionsProps, ChatOptionButtonProps } from "./components/ChatComposer/ChatOptions";
export { MentionInput, MentionText } from "./components/MentionInput/MentionInput";
export type { MentionInputProps, MentionInputHandle } from "./components/MentionInput/MentionInput";
export { trimMentionReferences } from "./components/MentionInput/mentions";
export type { MentionItem, MentionReference, MentionTrigger } from "./components/MentionInput/mentions";
export { MessageQueue } from "./components/MessageQueue/MessageQueue";
export type { MessageQueueProps, QueuedMessage } from "./components/MessageQueue/MessageQueue";
export { AttachmentChip, AttachmentList } from "./components/AttachmentChip/AttachmentChip";
export type { AttachmentChipProps, AttachmentListProps, AttachmentKind, AttachmentStatus } from "./components/AttachmentChip/AttachmentChip";
export { ImageThumbnail, ImageGallery } from "./components/ImageThumbnail/ImageThumbnail";
export type { ImageThumbnailProps, ImageGalleryProps, ImageGalleryItem, ImageGalleryGroup, ImageSource, ImageShape } from "./components/ImageThumbnail/ImageThumbnail";
/* Relevé de conversation, travail de l'agent, question de l'agent (D-375 à D-377). */
export { ChatTranscript } from "./components/ChatTranscript/ChatTranscript";
export type { ChatTranscriptProps } from "./components/ChatTranscript/ChatTranscript";
export { ChatMessage } from "./components/ChatTranscript/ChatMessage";
export type { ChatMessageProps, ChatMessageRole } from "./components/ChatTranscript/ChatMessage";
export { MessageActions } from "./components/ChatTranscript/MessageActions";
export type { MessageActionsProps } from "./components/ChatTranscript/MessageActions";
export { AgentActivity, ActivityGroup } from "./components/AgentActivity/AgentActivity";
export type { AgentActivityProps, ActivityGroupProps, ActivityItem, ActivityKind, ActivityStatus } from "./components/AgentActivity/AgentActivity";
export { WorkStatus } from "./components/AgentActivity/WorkStatus";
export type { WorkStatusProps, WorkPhase } from "./components/AgentActivity/WorkStatus";
export { WorkSummary } from "./components/AgentActivity/WorkSummary";
export type { WorkSummaryProps } from "./components/AgentActivity/WorkSummary";
export { ChoicePrompt } from "./components/ChoicePrompt/ChoicePrompt";
export type { ChoicePromptProps, ChoiceOption, ChoicePromptAnswer } from "./components/ChoicePrompt/ChoicePrompt";
