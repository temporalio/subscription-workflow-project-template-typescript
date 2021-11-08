// @@@SNIPSTART subscription-ts-cancel-subscription-signal
import { Connection, WorkflowClient } from "@temporalio/client";
import { cancelSubscription } from "../workflows";

async function run() {
  const connection = new Connection();
  const client = new WorkflowClient(connection.service, {
    workflowDefaults: { taskQueue: "SubscriptionsTaskQueueTS" },
  });
  for (let i = 0; i < 5; i++) {
    const handle = await client.getHandle("SubscriptionsWorkflowId-" + i);
    await handle.signal(cancelSubscription);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
// @@@SNIPEND