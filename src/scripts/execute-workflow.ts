// @@@SNIPSTART subscription-ts-workflow-execution-starter
import { Connection, WorkflowClient } from "@temporalio/client";
import { SubscriptionWorkflow } from "../workflows";
import { Customer } from "../types";

async function run() {
  const connection = new Connection();
  const client = new WorkflowClient(connection.service, {
    workflowDefaults: { taskQueue: "SubscriptionsTaskQueueTS" },
  });

  for (let i = 0; i < 5; i++) {
    const cust = {
      FirstName: "First Name" + i,
      LastName: "Last Name" + i,
      Email: "someemail" + i,
      Subscription: {
        TrialPeriod: 10000, // 10 seconds
        BillingPeriod: 10000, // 10 seconds
        MaxBillingPeriods: 24,
        initialBillingPeriodCharge: 120,
      },
      Id: "Id-" + i,
    } as Customer;
    try {
      const result = await client.execute(SubscriptionWorkflow, {
        args: [cust],
        workflowId: "SubscriptionsWorkflow" + cust.Id,
        workflowRunTimeout: "10 mins",
      });
      console.log("Workflow result", result);
    } catch (err) {
      console.log("Unable to execute workflow", err);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
// @@@SNIPEND