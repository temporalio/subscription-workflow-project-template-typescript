// @@@SNIPSTART subscription-ts-updatechargeamount-signal
import { Connection, Client } from "@temporalio/client";
import { subscriptionWorkflow, updateBillingChargeAmount } from "../workflows";
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
  const handle = await client.workflow.getHandle(`subscription-${customer.id}`);

  // Signal workflow and update charge amount to 300 for next billing period
  try {
    await handle.signal(updateBillingChargeAmount, 300);
    console.log(
      `subscription-${customer.id} updating BillingPeriodChargeAmount to 300`
    );
  } catch (err) {
    console.error("Cant signal workflow", err);
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
