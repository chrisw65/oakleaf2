import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job, JobOptions } from 'bull';
import { QueueName } from './queue.module';

export interface JobData {
  [key: string]: any;
}

export interface QueueJobOptions extends JobOptions {
  priority?: number;
  delay?: number;
  repeat?: {
    cron?: string;
    every?: number;
    limit?: number;
  };
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QueueName.EMAIL) private emailQueue: Queue,
    @InjectQueue(QueueName.DATA_PROCESSING) private dataProcessingQueue: Queue,
    @InjectQueue(QueueName.WEBHOOK) private webhookQueue: Queue,
    @InjectQueue(QueueName.NOTIFICATION) private notificationQueue: Queue,
    @InjectQueue(QueueName.ANALYTICS) private analyticsQueue: Queue,
    @InjectQueue(QueueName.REPORT) private reportQueue: Queue,
  ) {}

  /**
   * Add email job to queue
   */
  async addEmailJob(
    jobName: string,
    data: JobData,
    options?: QueueJobOptions,
  ): Promise<Job> {
    return this.emailQueue.add(jobName, data, options);
  }

  /**
   * Add data processing job
   */
  async addDataProcessingJob(
    jobName: string,
    data: JobData,
    options?: QueueJobOptions,
  ): Promise<Job> {
    return this.dataProcessingQueue.add(jobName, data, options);
  }

  /**
   * Add webhook job
   */
  async addWebhookJob(
    jobName: string,
    data: JobData,
    options?: QueueJobOptions,
  ): Promise<Job> {
    return this.webhookQueue.add(jobName, data, options);
  }

  /**
   * Add notification job
   */
  async addNotificationJob(
    jobName: string,
    data: JobData,
    options?: QueueJobOptions,
  ): Promise<Job> {
    return this.notificationQueue.add(jobName, data, options);
  }

  /**
   * Add analytics job
   */
  async addAnalyticsJob(
    jobName: string,
    data: JobData,
    options?: QueueJobOptions,
  ): Promise<Job> {
    return this.analyticsQueue.add(jobName, data, options);
  }

  /**
   * Add report generation job
   */
  async addReportJob(
    jobName: string,
    data: JobData,
    options?: QueueJobOptions,
  ): Promise<Job> {
    return this.reportQueue.add(jobName, data, options);
  }

  /**
   * Get queue by name
   */
  private getQueue(queueName: QueueName): Queue {
    switch (queueName) {
      case QueueName.EMAIL:
        return this.emailQueue;
      case QueueName.DATA_PROCESSING:
        return this.dataProcessingQueue;
      case QueueName.WEBHOOK:
        return this.webhookQueue;
      case QueueName.NOTIFICATION:
        return this.notificationQueue;
      case QueueName.ANALYTICS:
        return this.analyticsQueue;
      case QueueName.REPORT:
        return this.reportQueue;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }

  /**
   * Get job by ID
   */
  async getJob(queueName: QueueName, jobId: string): Promise<Job | null> {
    const queue = this.getQueue(queueName);
    return queue.getJob(jobId);
  }

  /**
   * Get all jobs in queue
   */
  async getJobs(
    queueName: QueueName,
    types: Array<'completed' | 'waiting' | 'active' | 'delayed' | 'failed'>,
  ): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    return queue.getJobs(types);
  }

  /**
   * Get queue stats
   */
  async getQueueStats(queueName: QueueName) {
    const queue = this.getQueue(queueName);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
  }

  /**
   * Clear queue (remove all jobs)
   */
  async clearQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.empty();
  }

  /**
   * Remove job from queue
   */
  async removeJob(queueName: QueueName, jobId: string): Promise<void> {
    const job = await this.getJob(queueName, jobId);
    if (job) {
      await job.remove();
    }
  }

  /**
   * Retry failed job
   */
  async retryJob(queueName: QueueName, jobId: string): Promise<void> {
    const job = await this.getJob(queueName, jobId);
    if (job) {
      await job.retry();
    }
  }

  /**
   * Get failed jobs
   */
  async getFailedJobs(queueName: QueueName): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    return queue.getFailed();
  }

  /**
   * Clean old jobs
   */
  async cleanQueue(
    queueName: QueueName,
    grace: number = 5000,
    status?: 'completed' | 'wait' | 'active' | 'delayed' | 'failed',
  ): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.clean(grace, status);
  }

  /**
   * Schedule recurring job
   */
  async scheduleJob(
    queueName: QueueName,
    jobName: string,
    data: JobData,
    cronExpression: string,
  ): Promise<Job> {
    const queue = this.getQueue(queueName);
    return queue.add(jobName, data, {
      repeat: {
        cron: cronExpression,
      },
    });
  }

  /**
   * Remove repeatable job
   */
  async removeRepeatableJob(
    queueName: QueueName,
    jobName: string,
    repeatOpts: any,
  ): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.removeRepeatable(jobName, repeatOpts);
  }

  /**
   * Get all repeatable jobs
   */
  async getRepeatableJobs(queueName: QueueName): Promise<any[]> {
    const queue = this.getQueue(queueName);
    return queue.getRepeatableJobs();
  }

  /**
   * Bulk add jobs
   */
  async bulkAddJobs(
    queueName: QueueName,
    jobs: Array<{ name: string; data: JobData; opts?: QueueJobOptions }>,
  ): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    return queue.addBulk(jobs);
  }

  /**
   * Get queue health status
   */
  async getQueueHealth(queueName: QueueName): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    stats: any;
  }> {
    const stats = await this.getQueueStats(queueName);

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Consider unhealthy if too many failed jobs
    if (stats.failed > 100) {
      status = 'unhealthy';
    } else if (stats.failed > 50) {
      status = 'degraded';
    }

    // Consider unhealthy if queue is backed up
    if (stats.waiting > 1000) {
      status = 'unhealthy';
    } else if (stats.waiting > 500) {
      status = 'degraded';
    }

    return {
      status,
      stats,
    };
  }

  /**
   * Get all queues health
   */
  async getAllQueuesHealth(): Promise<Record<string, any>> {
    const queueNames = Object.values(QueueName);
    const healthChecks = await Promise.all(
      queueNames.map(async (name) => ({
        name,
        health: await this.getQueueHealth(name as QueueName),
      })),
    );

    return healthChecks.reduce((acc, { name, health }) => {
      acc[name] = health;
      return acc;
    }, {});
  }
}
