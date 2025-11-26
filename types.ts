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

// --- Project Hub Types ---
export enum ProjectStatus {
  PENDING = 'Pending Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
}

export enum ProjectType {
    HARDWARE = 'Hardware',
    SOFTWARE = 'Software',
    HYBRID = 'Hardware & Software',
}

export interface RequiredComponent {
    componentId: string;
    componentName: string;
    quantity: number;
}

export interface Project {
  id: string;
  submitterStudentName: string; // The student who submitted it
  projectName: string;
  projectType: ProjectType;
  teamName: string;
  teamEmail: string;
  teamMembers: string; // Storing as a comma-separated string from textarea
  mobileNumber?: string;
  features: string;
  description: string;
  prototypeDrawingUrl?: string; // Base64 data URL
  requiredComponents: RequiredComponent[];
  status: ProjectStatus;
  submittedAt: string;
  adminFeedback?: string; // For rejection reasons
  
  // Advanced fields
  timeline?: string;
  budget?: string;
  techStack?: string;
}