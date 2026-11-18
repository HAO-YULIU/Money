import type { Group } from './資料型別';

/** A member can be removed only if no expense (incl. repayments) references them. */
export function canRemoveMember(g: Group, memberId: string): boolean {
  return !g.expenses.some((e) => {
    if (e.payerId === memberId) return true;
    return e.split.mode === 'equal'
      ? e.split.participantIds.includes(memberId)
      : memberId in e.split.amounts;
  });
}

/** Split "小明, 小華 小美" into unique trimmed names. */
export function parseNames(input: string): string[] {
  return input.split(/[,，、\s]+/).map((s) => s.trim()).filter(Boolean);
}
