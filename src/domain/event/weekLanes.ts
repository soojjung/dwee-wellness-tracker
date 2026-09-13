import type { EventLog } from '@/types/eventLog';
import { MAX_BADGES_PER_DAY } from './badges';

export interface WeekCellLike {
  date: string;
  inCurrentMonth: boolean;
}

/**
 * One continuous bar inside a single calendar row. `startCol`/`endCol` are
 * inclusive column indices into the row's cells. `continuesBefore`/`After`
 * tell the renderer to leave that edge square because the event carries on
 * into a neighbouring row (or an out-of-month cell that isn't drawn).
 */
export interface WeekSegment {
  event: EventLog;
  lane: number;
  startCol: number;
  endCol: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

function compareForLanes(a: EventLog, b: EventLog): number {
  if (a.startDate !== b.startDate) return a.startDate < b.startDate ? -1 : 1;
  // Longer events first so they claim the top lane and shorter ones tuck under.
  if (a.endDate !== b.endDate) return a.endDate > b.endDate ? -1 : 1;
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
  return a.id < b.id ? -1 : 1;
}

/**
 * Lay out the events that touch one calendar row (7 cells) as continuous
 * horizontal bars. Each event gets the lowest lane that is free across every
 * column it covers, so a multi-day event stays on one line instead of
 * breaking into per-day chips. Only in-month cells are drawn; events whose
 * visible span is empty or whose lane exceeds `maxLanes` are omitted.
 */
export function layoutWeekSegments(
  events: readonly EventLog[],
  cells: readonly WeekCellLike[],
  maxLanes = MAX_BADGES_PER_DAY,
): WeekSegment[] {
  if (cells.length === 0) return [];
  const rowStart = cells[0]!.date;
  const rowEnd = cells[cells.length - 1]!.date;

  const candidates = events
    .filter((e) => e.startDate <= rowEnd && e.endDate >= rowStart)
    .sort(compareForLanes);

  const occupied: boolean[][] = [];
  const segments: WeekSegment[] = [];

  for (const event of candidates) {
    let startCol = -1;
    let endCol = -1;
    for (let col = 0; col < cells.length; col += 1) {
      const cell = cells[col]!;
      const covered =
        cell.inCurrentMonth && cell.date >= event.startDate && cell.date <= event.endDate;
      if (!covered) continue;
      if (startCol === -1) startCol = col;
      endCol = col;
    }
    if (startCol === -1) continue;

    let lane = 0;
    while (lane < maxLanes && occupied[lane]?.slice(startCol, endCol + 1).some(Boolean)) {
      lane += 1;
    }
    if (lane >= maxLanes) continue;

    const row = (occupied[lane] ??= new Array<boolean>(cells.length).fill(false));
    for (let col = startCol; col <= endCol; col += 1) row[col] = true;

    segments.push({
      event,
      lane,
      startCol,
      endCol,
      continuesBefore: event.startDate < cells[startCol]!.date,
      continuesAfter: event.endDate > cells[endCol]!.date,
    });
  }

  return segments;
}
