import { JobsOptions, Queue, QueueEvents, Worker } from 'bullmq';
import IORedis from 'ioredis';
import config from './config';
import { IJOB_DATA } from './interfaces/job-data.interface';
import hireWorker from './lib/my-worker';

const QUEUE_NAME = 'greeting2';
const connection = new IORedis(config);

const greetingQueue = new Queue(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 10,
  },
});

const queueEvents = new QueueEvents(QUEUE_NAME, {
  connection: new IORedis(config),
});

queueEvents.on('completed', async ({ jobId, returnvalue, prev }, id) => {
  console.log(jobId, returnvalue);
});

const jobsOption: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
};

for (let i = 0; i < 20; i++) {
  const data: IJOB_DATA = {
    userId: i,
  };

  // need scheduler
  greetingQueue.add(
    `Hello World`,
    data,
    i % 5 === 0 ? { delay: 5000, ...jobsOption } : jobsOption
  );
}

const workers: Worker[] = [];
for (let i = 0; i < 3; i++) {
  workers.push(hireWorker(QUEUE_NAME, connection));
}
