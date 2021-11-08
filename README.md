# Temporal Subscription Workflow Template in TypeScript
<!-- @@@SNIPSTART subscription-ts-readme -->
This project template illustrates the design pattern for subscription style business logic.

You might compare this to similar projects in our [Go](https://github.com/temporalio/subscription-workflow-project-template-go), [Java](https://github.com/temporalio/subscription-workflow-project-template-java) and [PHP](https://github.com/temporalio/subscription-workflow-project-template-php) SDKs.

## Setup

Run the Temporal Server:

```bash
git clone https://github.com/temporalio/docker-compose.git
cd docker-compose
docker-compose up
```

**Start**

Start the Worker:

```bash
npm run start.watch
```

Start the Workflow Executions:

```bash
npm run workflow
```

This will start the Workflow Executions for 5 customers with the following Ids:

```text
Id-0
Id-1
Id-2
Id-3
Id-4
```

**Get billing info**

You can Query the Workflow Executions and get the billing information for each customer.

```bash
npm run querybillinginfo
```

Run this multiple times to see the billing period number increase during the executions or see the billing cycle cost.

**Update billing**

You can send a Signal a Workflow Execution to update the billing cycle cost to 300 for all customers.

```bash
npm run updatechargeamount
```

**Cancel subscription**

You can send a Signal to all Workflow Executions to cancel the subscription for all customers.
Workflow Executions will complete after the currently executing billing period.

```bash
npm run cancelsubscription
```

After running this, check out the [Temporal Web UI](localhost://8088) and see that all subscription Workflow Executions have a "Completed" status.
<!-- @@@@SNIPEND -->
