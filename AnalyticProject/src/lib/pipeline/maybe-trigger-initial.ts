/**
 * Hook point for F5-05 auto-initial pipeline.
 * Called after a successful manual signal create when research has ≥1 signal.
 * No-op until pipeline jobs land.
 */
export async function maybeTriggerInitialPipeline(
  researchId: string,
): Promise<void> {
  void researchId;
}
