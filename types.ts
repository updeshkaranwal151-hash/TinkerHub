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

export interface Attachment {
  id: string;
  name: string;
  type: string; // MIME type
  size: number; // in bytes
  dataUrl: string; // base64
}

export interface Project {
  id: string;
  name: string;
  teamName: string;
  teamMembers: string[];
  description: string;
  features: string;
  requiredComponents: RequiredComponent[];
  createdAt: string;
  projectDate: string;
  projectLogoUrl?: string;
  youtubeUrl?: string;
  attachments: Attachment[];
}

export interface AISuggestions {
  name: string;
  description: string;
  category: Category;
  quantity: number;
  imageUrl?: string;
}