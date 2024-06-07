import { TestWorkflowEnvironment } from "@temporalio/testing";
import { after, before, describe, it } from "mocha";
import { Worker } from "@temporalio/worker";
import assert from "assert";
import { subscriptionWorkflow } from "../workflows";
import * as activities from "../activities";
import { Customer } from "../shared";

describe("Subscription Workflow", function () {
  this.timeout(10000);
  let worker: Worker;
  let testEnv: TestWorkflowEnvironment;

  before(async () => {
    this.timeout(10000);
    testEnv = await TestWorkflowEnvironment.createTimeSkipping();
  });

  beforeEach(async function () {
    const { nativeConnection } = testEnv;
    worker = await Worker.create({
      connection: nativeConnection,
      taskQueue: "test",
      workflowsPath: require.resolve("../workflows"),
      activities,
    });
  });

  after(async () => {
    await testEnv?.teardown();
  });

  const customer: Customer = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    subscription: {
      trialPeriod: 1000,
      billingPeriod: 1000,
      maxBillingPeriods: 3,
      initialBillingPeriodCharge: 100,
    },
    id: "customer-id-123",
  };

  it("completes the workflow with trial cancellation", async () => {
    const { client } = testEnv;

    const result = await worker.runUntil(
      client.workflow.execute(subscriptionWorkflow, {
        args: [customer],
        workflowId: "trial-cancel-test",
        taskQueue: "test",
      })
    );

    assert.equal(result, `Completed trial-cancel-test, Total Charged: 300`);
  });
});