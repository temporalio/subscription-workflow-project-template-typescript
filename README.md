This project template illustrates the design pattern for subscription style business logic.

You might compare this to similar projects in our [Go](https://github.com/temporalio/subscription-workflow-project-template-go), [Java](https://github.com/temporalio/subscription-workflow-project-template-java), [Python](https://github.com/temporalio/email-subscription-project-python/) and [PHP](https://github.com/temporalio/subscription-workflow-project-template-php) SDKs.

## Project Specifications

Your task is to write a Workflow for a limited time Subscription (eg a 36 month Phone plan) that satisfies these conditions:

1. When the user signs up, **send a welcome email** and start a free trial for `trialPeriod`.
2. If the user cancels during the trial, **send a trial cancellation email** and complete the Workflow. Liekewise, if the `trialPeriod` expires, start the billing process.
3. Billing Process:
   - As long as you have not exceeded `maxBillingPeriods`,
   - **Charge the customer** for the `billingPeriodChargeAmount`.
   - Then wait for the next `billingPeriod`.
   - If the customer cancels during a billing period, **send a subscription cancellation email**.
   - If Subscription has ended normally (exceeded `maxBillingPeriods` without cancellation), **send a subscription ended email** and complete the Workflow.
4. At any point while subscriptions are ongoing, be able to look up and change any customer's:
   - Amount Charged
   - Period number (for manual adjustments e.g. refunds)

Of course, this all has to be fault tolerant, scalable to millions of customers, testable, maintainable!

## Tutorial

The guided tutorial for writing this on your own can be found [here](https://learn.temporal.io/tutorials/typescript/subscriptions/).

## Setup

1. Start by running the Temporal Server in one terminal window: `temporal server start-dev --ui-port 8080 --db-filename clusterdata.db`. For more details on this command, please refer to the `Set up a local development environment for Temporal and TypeScript` tutorial [here](https://learn.temporal.io/getting_started/typescript/dev_environment/).

2. In another terminal window, run `npm install` to install dependencies. Then, start the Worker by running `npm run start.watch`.

3. In another terminal window, run the Workflow Execution with `npm run workflow`.

This will start the Workflow Executions for 5 customers in parallel. You will see the result of the Activity calls in the terminal Window your Worker is running:

```bash
Sending welcome email to email-1@customer.com
Sending welcome email to email-2@customer.com
Sending welcome email to email-4@customer.com
Sending welcome email to email-5@customer.com
Sending welcome email to email-3@customer.com
```

Each of their periods and charges are varied on purpose to simulate real life variation.
After their "trial" period, each customer will be charged:

```bash
Charging email-1@customer.com amount 130 for their billing period
Charging email-2@customer.com amount 140 for their billing period
Charging email-3@customer.com amount 150 for their billing period
Charging email-4@customer.com amount 160 for their billing period
Charging email-5@customer.com amount 170 for their billing period
```

If you let this run to completion, the Workflow Executions complete and report their results back:

```bash
Workflow result Completed SubscriptionsWorkflowId-1, Total Charged: 390
Workflow result Completed SubscriptionsWorkflowId-2, Total Charged: 420
Workflow result Completed SubscriptionsWorkflowId-3, Total Charged: 450
Workflow result Completed SubscriptionsWorkflowId-4, Total Charged: 580
Workflow result Completed SubscriptionsWorkflowId-5, Total Charged: 510
```

**Get billing info**

You can Query the Workflow Executions and get the billing information for each customer. Do this by running the following command:

```bash
npm run querybillinginfo
```

You can run this after execution completes, or during execution to see the billing period number increase during the executions or see the total charged amount thus far.

```bash
Workflow Id subscription-ABC123
Billing Period 2
Total Charged Amount 100
Workflow Id subscription-ABC123
Billing Period 3
Total Charged Amount 200
# etc.
```

**Update billing**

You can send a Signal a Workflow Execution to update the billing cycle cost to 300 for all customers. Do this by running the following command:

```bash
npm run updatechargeamount
```

This will update all customer's charge amount to 300:

```bash
subscription-ABC123 updating BillingPeriodChargeAmount to 300
```

**Cancel subscription**

You can send a Signal to all Workflow Executions to cancel the subscription for all customers. The Workflow Executions will complete after the currently executing billing period. Do this by running the command:

```bash
npm run cancelsubscription
```

This will cancel the subscription to the user supplied in the Client:

```bash
Subscription finished for: ABC123
```

After running this, check out the [Temporal Web UI](localhost://8088) and see that all subscription Workflow Executions have a "Completed" status.

