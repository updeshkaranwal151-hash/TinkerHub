export enum Category {
  MICROCONTROLLER = 'Microcontroller',
  SENSOR = 'Sensor',
  MOTOR = 'Motor',
  DISPLAY = 'Display',
  POWER_SUPPLY = 'Power Supply',
  GENERAL = 'General Component',
}

export interface IssueRecord {
  id: string;
  studentName: string;
  issuedDate: string;
}

export enum LinkType {
  DATASHEET = 'Datasheet',
  TUTORIAL = 'Tutorial',
  PROJECT = 'Project Idea',
  OTHER = 'Other',
}

export interface ComponentLink {
  type: LinkType;
  url: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  notes: string;
}

export interface Component {
  id:string;
  name: string;
  description: string;
  category: Category;
  totalQuantity: number;
  issuedTo: IssueRecord[];
  imageUrl?: string;
  isAvailable: boolean;
  createdAt?: string; 
  lowStockThreshold?: number;
  links?: ComponentLink[];
  isUnderMaintenance: boolean;
  maintenanceLog: MaintenanceRecord[];
}

export interface RequiredComponent {
  componentId: string;
  componentName: string;
}

export interface Project {
  id: string;
  name: string;
  studentName: string;
  description: string;
  requiredComponents: RequiredComponent[];
  createdAt: string;
}