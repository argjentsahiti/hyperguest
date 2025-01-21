# Queue Implementation

The main challenge was to ensure that messages within each group are processed in **FIFO (First-In-First-Out) order**, which is crucial due to the presence of `SET` operations.

## Understanding the SET Problem

Consider the following scenario:

1. **Worker 1** dequeues and processes the `SET` operation message for `item1`.
    - The processing includes a sleep operation of **100ms**.

2. **Worker 2** dequeues and processes an `ADD` operation message for `item1`.
    - The processing includes a sleep operation of **44ms**.

3. As a result, the `ADD` operation completes first, increasing the value by `2`. However, when the `SET` operation (processed by Worker 1) completes, it sets the value back to `50`, effectively **overwriting the previous addition**, causing data inconsistency.

## Solution Approach

Although this is not an exact implementation, I aimed to design a solution similar to **AWS FIFO Queues**, which ensures that messages are grouped by a key and processed in strict FIFO order within each group.

My implementation preserves **parallelism**, meaning that if one group is currently being processed (blocked), workers can switch to another group and continue processing available messages without delays.

## Code Explanation

The solution revolves around two primary data structures: **hash maps** to track message queues and their processing states.

### Data Structures Used:

- **`messages` (Map<string, Message[]>):**
- - Stores messages in **FIFO order**, grouped by their respective keys.
- - If a key is not already present, a new queue (array) is created for it.

- **`processing` (Map<string, number>):**
- - Tracks the keys that are currently being processed.
- - Ensures that no two workers process messages for the same key concurrently.

These data structures help maintain message grouping while efficiently tracking ongoing processing.

## Method Breakdown

### `Enqueue` Method:
- Checks if the `messages` map contains the message key.
- If the key is not present, it initializes an empty queue for that key.
- The message is then pushed to the queue associated with that key, ensuring FIFO order.

### `Dequeue` Method:
- Iterates through each key's message queue.
- Checks if there are any messages available and if the key is **not already being processed**.
- If both conditions are met, the first message (FIFO order) is dequeued, and the key is marked as **processing**, ensuring no other worker processes messages for that key simultaneously.

### `Confirm` Method:
- Loops through each key's queue to find the message that matches the given `messageId`.
- Verifies that the worker confirming the message is the same one that processed it, using the `processing` map.
- If validated, the message is removed from the queue, and the key is unmarked from the processing map.

### `Size` Method:
- Iterates through each queue and sums up their lengths to determine the total number of messages currently in the system.

---

# What I Would Do Differently

## General Issues
- **Worker Completion Timing:**
- - Instead of relying on a fixed sleep duration (`10 seconds`), use `Promise.all` to wait for all worker processes to complete. This ensures that all operations finish, regardless of the time needed.

- **Missing `package.json` and `package-lock.json`:**
- - These files are necessary for initializing a Node.js project. Without them, the project's dependencies and configuration are unclear.

- **Missing TypeScript Configuration:**
- - A `tsconfig.json` file is not present. This file is essential for defining the TypeScript project structure and specifying compiler options.

- **Missing `.gitignore` File:**
- - A `.gitignore` file should be added to exclude unnecessary files (e.g., `node_modules`, build artifacts) from the repository.

### Database (`Database.ts`)
1. **Error Handling:**
- - Add validation for message values, such as ensuring `message.val` is a valid number before operations.
2. **Concurrency Concerns:**
- - The `set` method could face race conditions if multiple workers attempt updates for the same key.

### Worker (`Worker.ts`)
1. **Error Handling for Worker Execution:**
- - No error-handling mechanism exists within the worker. If an error occurs while processing a message, it could stop the worker. Add error handling to continue processing other messages.
