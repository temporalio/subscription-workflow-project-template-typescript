// @@@SNIPSTART subscription-ts-workflow-execution-starter
import { Connection, Client } from "@temporalio/client";
import { subscriptionWorkflow } from "../workflows";
import { Customer, TASK_QUEUE_NAME } from "../shared";

async function run() {
  const connection = await Connection.connect({ address: "localhost:7233" });
  const client = new Client({
    connection,
  });

  const custArray: Customer[] = [1, 2, 3, 4, 5].map((i) => ({
    firstName: "First Name" + i,
    lastName: "Last Name" + i,
    email: "email-" + i + "@customer.com",
    subscription: {
      trialPeriod: 3000 + i * 1000, // 3 seconds
      billingPeriod: 3000 + i, // 3 seconds
      maxBillingPeriods: 3,
      initialBillingPeriodCharge: 120 + i * 10,
    },
    id: "Id-" + i,
  }));
  const resultArr = await Promise.all(
    custArray.map((cust) =>
      client.workflow
        .start(subscriptionWorkflow, {
          args: [cust],
          taskQueue: TASK_QUEUE_NAME,
          workflowId: "SubscriptionsWorkflow" + cust.id,
          workflowRunTimeout: "10 mins",
        })
        .then((execution) => execution.result())
        .catch((err) => console.error("Unable to execute workflow", err))
    )
  );
  resultArr.forEach((result) => {
    console.log("Workflow result", result);
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
// @@@SNIPEND
