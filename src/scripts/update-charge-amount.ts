// @@@SNIPSTART subscription-ts-updatechargeamount-signal
import { Connection, WorkflowClient } from "@temporalio/client";

async function run() {
  const connection = new Connection();
  const client = new WorkflowClient(connection.service, {
    workflowDefaults: { taskQueue: "SubscriptionsTaskQueueTS" },
  });
	// Signal all workflows and update charge amount to 300 for next billing period
  for (let i = 0; i < 5; i++) {
    const handle = await client.getHandle("SubscriptionsWorkflowId-" + i);
    await handle.signal("BillingPeriodChargeAmount", 300);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
// @@@SNIPEND