export enum TaskStatus {
    Todo = 'todo',
    InProgress = 'inprogress',
    Done = 'done',
}

export interface VehicleTypeMaster {
    id: string;
    name: string;
}

export enum DriverOption {
    SelfDrive = 'Self-drive',
    WithManpower = 'With Manpower',
}

export enum AttachmentType {
    File = 'file',
    Link = 'link',
}

export enum EmployeeStatus {
    Active = 'active',
    Inactive = 'inactive',
}

export type UserRole = 'admin' | 'user';

export interface Attachment {
    id: string;
    type: AttachmentType;
    name: string; // Used for file name and link title
    url?: string; // Only for links
}

export interface Employee {
    id:string;
    name: string;
    avatar: string;
    employeeCode: string;
    jobTitle: string;
    status: EmployeeStatus;
}

export interface AssignmentHistoryEntry {
    assignedTo: string; // Employee ID
    assignedDate: Date;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    status: TaskStatus;
    assignedTo?: string; // Employee ID
    assignedDate?: Date;
    completionDate?: Date;
    assignmentHistory?: AssignmentHistoryEntry[];
}

export interface Vehicle {
    id: string;
    make: string;
    model: string;
    modelYear: number;
    qty: number;
    vehicleTypeId: string;
    driverOption: DriverOption;
    leasePeriod?: number; // in months
}

export interface Tender {
    id: string;
    title: string;
    client: string;
    startDate: Date;
    endDate: Date;
    tasks: Task[];
    vehicles?: Vehicle[];
    attachments?: Attachment[];
    remarks?: string;
    completionDate?: Date;
}

export interface PerformanceStats {
    employee: Employee;
    totalCompleted: number;
    completedOnTime: number;
    completedLate: number;
    onTimeRate: number; // Percentage
    totalTimeAssigned: number; // in days
    totalTimeTaken: number; // in days
}