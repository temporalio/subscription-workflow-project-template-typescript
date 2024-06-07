export const TASK_QUEUE_NAME = "subscriptions-task-queue";

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  subscription: {
    trialPeriod: number;
    billingPeriod: number;
    maxBillingPeriods: number;
    initialBillingPeriodCharge: number;
  };
  id: string;
}
