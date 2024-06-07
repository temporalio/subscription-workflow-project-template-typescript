// @@@SNIPSTART subscription-ts-querybillinginfo-query
import { Connection, Client } from "@temporalio/client";
import { subscriptionWorkflow } from "../workflows";
import { TASK_QUEUE_NAME, Customer } from "../shared";

async function run() {
  const connection = await Connection.connect({ address: "localhost:7233" });
  const client = new Client({
    connection,
  });

  const subscriptionWorkflowExecution = await client.workflow.start(
    subscriptionWorkflow,
    {
      args: [customer],
      taskQueue: TASK_QUEUE_NAME,
      workflowId: `subscription-${customer.id}`,
    }
  );

  // Wait for some time before querying to allow the workflow to progress
  for (let i = 1; i <= 5; i++) {
    // Loop for 5 billing periods
    await new Promise((resolve) => setTimeout(resolve, 2500)); // Adjust the wait time to match billing period plus buffer
    try {
      const billingPeriodNumber =
        await subscriptionWorkflowExecution.query<number>(
          "billingPeriodNumber"
        );
      const totalChargedAmount =
        await subscriptionWorkflowExecution.query<number>("totalChargedAmount");

      console.log("Workflow Id", subscriptionWorkflowExecution.workflowId);
      console.log("Billing Period", billingPeriodNumber);
      console.log("Total Charged Amount", totalChargedAmount);
    } catch (err) {
      console.error(
        `Error querying workflow with ID ${subscriptionWorkflowExecution.workflowId}:`,
        err
      );
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

const customer: Customer = {
  firstName: "Grant",
  lastName: "Fleming",
  email: "email-1@customer.com",
  subscription: {
    trialPeriod: 2000, // 2 seconds
    billingPeriod: 2000, // 2 seconds
    maxBillingPeriods: 12,
    initialBillingPeriodCharge: 100,
  },
  id: "ABC123",
};
// @@@SNIPEND
