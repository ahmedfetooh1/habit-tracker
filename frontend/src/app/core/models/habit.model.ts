export interface Habit {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminderTime?: string;
  completedDates: string[];
  streak?: number;
  createdAt?: string;
  archivedAt?: string;
}

export interface CreateHabitDto {
  title: string;
  description?: string;
  category?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminderTime?: string;
}
