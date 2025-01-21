import { Message } from "./Database";

export class Queue {
    private messages: Map<string, Message[]>;
    private processing: Map<string, number>;

    constructor() {
        this.messages = new Map();
        this.processing = new Map();
    }

    Enqueue = (message: Message): void => {
        if (!this.messages.has(message.key)) {
            this.messages.set(message.key, []);
        }
        this.messages.get(message.key)?.push(message);
    };

    Dequeue = (workerId: number): Message | undefined => {
        for (const [key, queue] of this.messages.entries()) {
            if (queue.length === 0) continue;
            if (this.processing.has(key)) continue;

            const message = queue[0];
            this.processing.set(message.key, workerId);
            return message;
        }
        return undefined;
    };

    Confirm = (workerId: number, messageId: string): void => {
        for (const [key, queue] of this.messages.entries()) {
            if (queue.length > 0 && queue[0].id === messageId) {
                if (this.processing.get(key) === workerId) {
                    this.processing.delete(key);
                    queue.shift();
                }
                break;
            }
        }
    };

    Size = (): number => {
        let total = 0;
        for (const queue of this.messages.values()) {
            total += queue.length;
        }
        return total;
    };
}
