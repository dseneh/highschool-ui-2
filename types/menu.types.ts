export type MenuType = "accordion" | "list";

export type IconPosition = "left" | "right";

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: string;
  description?: string;
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface MenuConfiguration {
  id: string;
  label: string;
  type: MenuType;
  contextType?: "student" | "staff";
  description: string;
  items?: MenuItem[];
  sections?: MenuSection[];
}

export interface ToggleButtonConfig {
  label: string;
  icon: string;
  iconRotate: string;
  iconPosition: IconPosition;
}

export interface MenuConfigFile {
  $schema?: string;
  menus: {
    main: MenuConfiguration;
    student: MenuConfiguration;
    staff: MenuConfiguration;
  };
  toggleButtons: {
    toMain: ToggleButtonConfig;
    toStudent: ToggleButtonConfig;
    toStaff: ToggleButtonConfig;
  };
  metadata: {
    version: string;
    lastUpdated: string;
    description: string;
  };
}

export type ActiveMenu = "main" | "student" | "staff";

export interface MenuState {
  activeMenu: ActiveMenu;
  isOnDetailPage: boolean;
  contextId?: string;
  contextTitle?: string;
}
