import { describe, expect, it, vi } from 'vitest';

import {
  executeIdeaRescore,
  reestimateBuildDays,
} from '@/lib/idea/rescore';

describe('reestimateBuildDays', () => {
  it('subtracts 2 days per newly excluded feature from reconstructed baseline', () => {
    // was 16 days with 0 exclusions; user adds 2 features → 12
    expect(
      reestimateBuildDays({
        currentEstimatedBuildDays: 16,
        previousExcluded: [],
        nextExcluded: ['SSO', 'analytics'],
      }),
    ).toBe(12);
  });

  it('restores days when exclusions are removed', () => {
    expect(
      reestimateBuildDays({
        currentEstimatedBuildDays: 12,
        previousExcluded: ['SSO', 'analytics'],
        nextExcluded: [],
      }),
    ).toBe(16);
  });
});

describe('executeIdeaRescore', () => {
  it('T2: updates opportunity + status from current days/scores', async () => {
    const idea = {
      id: 'idea-1',
      status: 'narrowed',
      oneJobScore: 90,
      aiBuildabilityScore: 80,
      firstSalePotential: 75,
      estimatedBuildDays: 12,
      oneJobTemplate: 'For X who needs Y…',
      featuresExcludedToFitDeadline: ['SSO'],
      exclusionReasons: ['exceeds_14_days'],
    };

    const prisma = {
      idea: {
        findUniqueOrThrow: vi.fn().mockResolvedValue(idea),
        update: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({ ...idea, ...data }),
        ),
      },
    };

    const result = await executeIdeaRescore('idea-1', { prisma: prisma as never });

    expect(result.status).toBe('recommended');
    expect(result.exclusionReasons).toEqual([]);
    expect(result.opportunityScore).toBeGreaterThan(0);
    expect(prisma.idea.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'idea-1' },
        data: expect.objectContaining({ status: 'recommended' }),
      }),
    );
  });

  it('T3: narrowed → recommended when days ≤14 and thresholds met', async () => {
    const idea = {
      id: 'idea-narrow',
      status: 'narrowed',
      oneJobScore: 85,
      aiBuildabilityScore: 80,
      firstSalePotential: 72,
      estimatedBuildDays: 16,
      oneJobTemplate: 'Filled one job template',
      featuresExcludedToFitDeadline: [],
      exclusionReasons: ['exceeds_14_days'],
    };

    const prisma = {
      idea: {
        findUniqueOrThrow: vi.fn().mockResolvedValue({
          ...idea,
          // PATCH already applied heuristic days + features
          estimatedBuildDays: 12,
          featuresExcludedToFitDeadline: ['heavy BI', 'custom SSO'],
        }),
        update: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            ...idea,
            estimatedBuildDays: 12,
            featuresExcludedToFitDeadline: ['heavy BI', 'custom SSO'],
            ...data,
          }),
        ),
      },
    };

    const result = await executeIdeaRescore('idea-narrow', {
      prisma: prisma as never,
    });

    expect(result.status).toBe('recommended');
    expect(result.estimatedBuildDays).toBe(12);
  });
});
