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
  quantity: number;
}

export enum LinkType {
  DATASHEET = 'Datasheet',
  TUTORIAL = 'Tutorial',
  PROJECT = 'Project',
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

export interface AISuggestions {
  name: string;
  description: string;
  category: Category;
}

export interface AccessLogRecord {
  id: string;
  timestamp: string;
  userAgent: string;
}