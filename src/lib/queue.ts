export default class Queue<T> {
  private queue: T[] = [];
  private maxQueueSize: number;

  private pendingPolls: ((_: T) => void)[] = [];
  private pendingPushes: [T, (_: void) => void][] = [];

  constructor(size: number) {
    this.maxQueueSize = size;
  }

  public push(item: T): Promise<void> {
    if (this.queue.length < this.maxQueueSize) {
      this.pushInternal(item);
      return Promise.resolve();
    } else {
      return new Promise((resolve, _) => {
        this.pendingPushes.push([item, resolve]);
      });
    }
  }

  private pushInternal(item: T) {
    this.queue.push(item);
    this.notifyItemAvailable();
  }

  private notifySpotOpened() {
    let i = 0;
    for (i = 0; i < this.pendingPushes.length; i++) {
      if (this.queue.length > 0) {
        const [item, resolve] = this.pendingPushes[i];
        this.pushInternal(item);
        resolve();
      } else {
        break;
      }
    }
    this.pendingPushes = this.pendingPushes.slice(i);
  }

  private notifyItemAvailable() {
    let i = 0;
    for (i = 0; i < this.pendingPolls.length; i++) {
      if (this.queue.length > 0) {
        const front = this.pollInternal();
        this.pendingPolls[i](front);
      } else {
        break;
      }
    }
    this.pendingPolls = this.pendingPolls.slice(i);
  }

  private pollInternal(): T {
    const front = this.queue[0];
    this.queue = this.queue.slice(1);
    this.notifySpotOpened();
    return front;
  }

  public poll(): Promise<T> {
    if (this.queue.length > 0) {
      return Promise.resolve(this.pollInternal());
    } else {
      return new Promise((resolve, reject) => {
        this.pendingPolls.push(resolve);
      });
    }
  }

  public length(): number {
    return this.queue.length;
  }
}
