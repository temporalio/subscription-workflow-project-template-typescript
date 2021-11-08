# Temporal Subscription Workflow Template in TypeScript
<!-- @@@SNIPSTART subscription-ts-readme -->
This project template illustrates the design pattern for subscription style business logic.

**Setup**

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

This will start the Workflow Executions for 5 customers in parallel:

```bash
Sending welcome email to email-3@customer.com
Sending welcome email to email-4@customer.com
Sending welcome email to email-2@customer.com
Sending welcome email to email-1@customer.com
Sending welcome email to email-5@customer.com
```

Each of their periods and charges are varied on purpose to simulate real life variation.

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
