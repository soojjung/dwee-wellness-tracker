import type { EventLog } from '@/types';

export interface NewEventInput {
  startDate: string;
  endDate: string;
  title: string;
  memo: string;
  categoryId: string;
  hasPeriodMark?: boolean;
  linkedPeriodId?: string;
}

export interface EventRepository {
  list(): Promise<EventLog[]>;
  add(input: NewEventInput): Promise<EventLog>;
  update(
    id: string,
    patch: Partial<Omit<EventLog, 'id' | 'createdAt'>>,
  ): Promise<EventLog | null>;
  remove(id: string): Promise<void>;
}
