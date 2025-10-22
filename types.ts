
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

export interface Component {
  id: string;
  name: string;
  description: string;
  category: Category;
  totalQuantity: number;
  issuedTo: IssueRecord[];
  imageUrl?: string;
  isAvailable: boolean;
}
