function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface IState {
  [key: string]: any;
}
interface ISubscriber {
  next: Map<string, Function>;
  error: Map<string, Function>;
  complete: Map<string, Function>;
}
export default class Channel {
  private __state: IState = {};
  private __uuid: string = uuidv4();
  private __history: Array<IState> = [];
  private __subscribers: ISubscriber = {
    next: new Map<string, Function>(),
    error: new Map<string, Function>(),
    complete: new Map<string, Function>()
  };
  constructor(initState: IState) {
    this.__state = initState;
    this.__history.push({ ...initState });
  }

  next(state: IState) {
    this.__history.push({ ...state });
    this.__state == { ...state };
    this.__subscribers.next.forEach((nextFn: Function) => {
      nextFn(this.__history[this.__history.length - 1]);
    });
  }

  hasSubscribers() {
    return this.__subscribers.next.values.length > 0;
  }

  reset() {
    this.__subscribers = {
      next: new Map<string, Function>(),
      error: new Map<string, Function>(),
      complete: new Map<string, Function>()
    };
  }

  complete(finalState: IState) {
    this.next(finalState);
    this.__subscribers.complete.forEach((completeFn: Function) => {
      completeFn();
    });
    this.reset();
  }

  get(propName: string) {
    return this.__state[propName];
  }

  set(propName: string, propValue: any) {
    this.__state[propName] = propValue;
    this.next({ ...this.__state });
  }

  subscribe(onNextFn: Function, onErrorFn: Function, onCompleteFn: Function) {
    const uuid = uuidv4();
    this.__subscribers.next.set(uuid, onNextFn);
    this.__subscribers.complete.set(uuid, onCompleteFn);
    this.__subscribers.error.set(uuid, onErrorFn);
    return {
      unsubscribe: () => {
        this.__subscribers.next.delete(uuid);
        this.__subscribers.error.delete(uuid);
        this.__subscribers.complete.delete(uuid);
      }
    };
  }
}