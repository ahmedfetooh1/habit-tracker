export interface HabitLog {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Habit {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedDates: string[]; // تواريخ الأيام المكتملة
  createdAt?: string;
}

export interface CreateHabitDto {
  title: string;
  description?: string;
  category?: string;
  frequency?: 'daily' | 'weekly';
}
