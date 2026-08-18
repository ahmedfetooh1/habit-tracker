export interface Habit {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  category?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  reminderTime?: string;
  streak: number;
  completedDates: string[];
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
