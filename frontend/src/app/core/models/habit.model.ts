export interface HabitLog {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Habit {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  category?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminderTime?: string; // HH:mm
  streak: number;
  completedDates: string[];
  createdAt?: string;
}

export interface CreateHabitDto {
  title: string;
  description?: string;
  category?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminderTime?: string;
}
