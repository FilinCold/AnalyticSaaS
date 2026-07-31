import { helloJob } from '@/jobs/hello';
import { ideaRescoreJob } from '@/jobs/idea.rescore';
import { pipelineRunJob } from '@/jobs/pipeline.run';
import { scheduleRefreshJob } from '@/jobs/schedule-refresh';

export { helloJob } from '@/jobs/hello';
export {
  ideaRescoreJob,
  enqueueIdeaRescore,
  handleIdeaRescore,
} from '@/jobs/idea.rescore';
export { pipelineRunJob, executePipelineRun, enqueuePipelineRun } from '@/jobs/pipeline.run';
export {
  scheduleRefreshJob,
  enqueueScheduleRefresh,
} from '@/jobs/schedule-refresh';

export const inngestFunctions = [
  helloJob,
  pipelineRunJob,
  scheduleRefreshJob,
  ideaRescoreJob,
];
