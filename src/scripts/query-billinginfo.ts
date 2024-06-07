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
  for (let i = 1; i < 6; i++) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Adjust the wait time as needed
    try {
      const billingPeriodNumber =
        await subscriptionWorkflowExecution.query<number>(
          "billingPeriodNumber"
        );
      const billingPeriodChargeAmount =
        await subscriptionWorkflowExecution.query<number>(
          "billingPeriodChargeAmount"
        );

      console.log("Workflow:", "Id", subscriptionWorkflowExecution.workflowId);
      console.log("Billing Results", "Billing Period", billingPeriodNumber);
      console.log(
        "Billing Results",
        "Billing Period Charge",
        billingPeriodChargeAmount
      );
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
    initialBillingPeriodCharge: 0,
  },
  id: "ABC123",
};
// @@@SNIPEND
