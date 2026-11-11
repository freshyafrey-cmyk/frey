import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLevel,
  calculateLessonXp,
  getDaysDifference,
  checkStreakStatus,
  calculateDailyGoalProgress,
  getNextSpacedRepetitionInterval,
} from './gamification.ts';

test('calculateLevel returns level 1 for 0 XP', () => {
  const result = calculateLevel(0);
  assert.equal(result.level, 1);
  assert.equal(result.currentXp, 0);
  assert.equal(result.progressPercent, 0);
});

test('calculateLevel scales with XP and computes progress percent', () => {
  const result = calculateLevel(75);
  assert.equal(result.level, 1);
  assert.equal(result.currentXp, 75);
  assert.equal(result.progressPercent, 50);

  const level2 = calculateLevel(150);
  assert.equal(level2.level, 2);
  assert.equal(level2.currentXp, 0);
});

test('calculateLessonXp awards base XP, accuracy bonus, and streak bonus', () => {
  // 100% accuracy with streak
  const perfectScore = calculateLessonXp(20, 1.0, true);
  // 20 + 5 (streak) + 10 (perfect) = 35
  assert.equal(perfectScore, 35);

  // 50% accuracy without streak
  const halfScore = calculateLessonXp(20, 0.5, false);
  // 10 + 0 + 0 = 10
  assert.equal(halfScore, 10);
});

test('getDaysDifference calculates consecutive days correctly', () => {
  assert.equal(getDaysDifference('2026-11-10', '2026-11-11'), 1);
  assert.equal(getDaysDifference('2026-11-08', '2026-11-10'), 2);
  assert.equal(getDaysDifference('2026-11-10', '2026-11-10'), 0);
});

test('checkStreakStatus increments streak on consecutive days', () => {
  const result = checkStreakStatus(5, '2026-11-09', '2026-11-10', 1);
  assert.equal(result.newStreak, 6);
  assert.equal(result.streakFrozen, false);
});

test('checkStreakStatus protects streak with freeze when 1 day skipped', () => {
  const result = checkStreakStatus(5, '2026-11-08', '2026-11-10', 1);
  assert.equal(result.newStreak, 6);
  assert.equal(result.streakFrozen, true);
  assert.equal(result.freezesRemaining, 0);
});

test('checkStreakStatus resets streak when 2+ days skipped without freeze', () => {
  const result = checkStreakStatus(5, '2026-11-05', '2026-11-10', 0);
  assert.equal(result.newStreak, 1);
  assert.equal(result.streakFrozen, false);
});

test('calculateDailyGoalProgress tracks completion', () => {
  const inProgress = calculateDailyGoalProgress(6, 15);
  assert.equal(inProgress.progressPercent, 40);
  assert.equal(inProgress.isCompleted, false);
  assert.equal(inProgress.minutesRemaining, 9);

  const completed = calculateDailyGoalProgress(15, 15);
  assert.equal(completed.progressPercent, 100);
  assert.equal(completed.isCompleted, true);
  assert.equal(completed.minutesRemaining, 0);
});

test('getNextSpacedRepetitionInterval advances or resets interval', () => {
  assert.equal(getNextSpacedRepetitionInterval(1, true), 3);
  assert.equal(getNextSpacedRepetitionInterval(3, true), 7);
  assert.equal(getNextSpacedRepetitionInterval(7, false), 1);
});
