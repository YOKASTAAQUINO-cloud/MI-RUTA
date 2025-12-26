
export enum TaskCategory {
  IPA = 'Income Producing Activity',
  MAINTENANCE = 'Maintenance',
  PERSONAL = 'Personal',
  ADMIN = 'Admin'
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  reasoning?: string;
  notes?: string; // Notas detalladas añadidas por el usuario
  date: string; // ISO String (YYYY-MM-DD)
  reminderDate?: string; // ISO String (Fecha y hora del recordatorio)
  reminderTriggered?: boolean; // Estado para rastrear si el recordatorio ya fue mostrado
}

export interface FollowUp {
  id: string;
  name: string;
  lastContact: string;
  notes: string;
  status: 'warm' | 'hot' | 'follow-up-needed' | 'closed';
  reminderDate?: string; // ISO String
}

export interface IncomeGoal {
  current: number;
  target: number;
  currency: string;
}

export interface ContentIdea {
  title: string;
  hook: string;
  caption: string;
  platforms: string[];
}

export interface DailyStrategy {
  day: number;
  theme: string;
  tasks: {
    prospecting: string;
    education: string;
    selling: string;
    followup: string;
    interaction: string;
    positive: string;
  };
}
