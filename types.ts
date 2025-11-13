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

export enum ProjectStatus {
  PLANNED = 'Planned',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
}

export enum ProjectPriority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    URGENT = 'Urgent',
}

export interface RequiredComponent {
  componentId: string;
  name: string;
  quantity: number;
}

export enum AttachmentType {
  IMAGE = 'Image',
  VIDEO = 'Video',
  AUDIO = 'Audio',
  PDF = 'PDF',
  FILE = 'File',
  LINK = 'Link',
}

export interface Attachment {
  id: string;
  name: string;
  type: AttachmentType;
  url: string; // For links or base64 data URLs
  createdAt: string;
}

export interface ProjectTask {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  teamMembers: string[];
  status: ProjectStatus;
  priority: ProjectPriority;
  tags: string[];
  requiredComponents: RequiredComponent[];
  attachments: Attachment[];
  tasks: ProjectTask[];
  notes: string;
  createdAt: string;
  coverImageUrl?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  projectLead?: string;
  visibility: 'Public' | 'Private';
}

export interface AccessLogRecord {
  id: string;
  timestamp: string;
  userAgent: string;
}