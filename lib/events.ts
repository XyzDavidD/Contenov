// Simple event emitter for global state updates
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, data?: any) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

export const eventEmitter = new EventEmitter();

// Event types
export const EVENTS = {
  CREDITS_UPDATED: 'credits_updated',
  BRIEF_CREATED: 'brief_created',
  BRIEF_DELETED: 'brief_deleted'
} as const;
