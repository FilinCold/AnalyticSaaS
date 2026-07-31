import { helloJob } from '@/jobs/hello';
import { pipelineRunJob } from '@/jobs/pipeline.run';

export { helloJob } from '@/jobs/hello';
export { pipelineRunJob, executePipelineRun, enqueuePipelineRun } from '@/jobs/pipeline.run';

export const inngestFunctions = [helloJob, pipelineRunJob];
