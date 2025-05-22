export interface Publisher {
  subscribe(subscriber: Subscriber): void;
  unsubscribe(subscriber: Subscriber): void;
  notify(event: ParkingEvent): void
}

export interface Subscriber {
  update(event: ParkingEvent): void
}

export class ParkingEvent {
  constructor(
    public readonly lotName: string,
    public readonly occupied: number,
    public readonly capacity: number,
    public readonly eventType: 'enter' | 'exit'
  ) {}
}

export class ParkingLot implements Publisher {
  public occupied: number = 0;
  private subscribers: Subscriber[] = [];

  constructor(
    public name: string,
    public capacity: number,
  ) {}

  subscribe(subscriber: Subscriber): void {
    this.subscribers.push(subscriber);
  }

  unsubscribe(subscriber: Subscriber): void {
    const index = this.subscribers.indexOf(subscriber);
    if (index > -1) {
      this.subscribers.splice(index, 1);
    }
  }

  notify(event: ParkingEvent): void {
    this.subscribers.forEach(subscriber => subscriber.update(event));
  }

  enter() {
    if (!this.isFull()) {
      this.occupied++;
      const event = new ParkingEvent(this.name, this.occupied, this.capacity, 'enter');
      this.notify(event);
    } else {
      throw new Error(`the parking lot is full`);
    }
  }

  exit() {
    if (!this.isEmpty()) {
      this.occupied--;
      const event = new ParkingEvent(this.name, this.occupied, this.capacity, 'exit');
      this.notify(event);
    } else {
      throw new Error(`the parking lot is empty`);
    }
  }

  isFull() {
    return this.occupied == this.capacity;
  }

  isEmpty() {
    return this.occupied == 0;
  }
}

export class Display implements Subscriber {
  update(event: ParkingEvent): void {
    const action = event.eventType === 'enter' ? 'entered' : 'left';
    console.log(`A car ${action} the lot ${event.lotName}: ${event.occupied}/${event.capacity} occupied.`);
  }
}
