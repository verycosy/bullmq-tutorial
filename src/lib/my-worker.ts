import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { IJOB_DATA } from '../interfaces/job-data.interface';

const task = async (job: Job): Promise<string> => {
  const { id, name } = job;
  const data = job.data as IJOB_DATA;

  if (data.userId % 10 === 0) {
    throw new Error('Oops!');
  }

  console.log(`Job #${id} (${name})'s data : ${data.userId}`);

  return 'wow';
};

const completed = (job: Job, returnedvalue: string) => {
  console.log(`Job #${job.id} completed\n`);
};

const progress = (job: Job, progress: number | object) => {};

const failed = (job: Job, err: Error) => {
  console.log(`Job #${job.id} has failed with ${err.message}`);
};

function hireWorker(queueName: string, connection: IORedis.Redis): Worker {
  return new Worker(queueName, task, { connection })
    .on('completed', completed)
    .on('progress', progress)
    .on('failed', failed);
}

export default hireWorker;
