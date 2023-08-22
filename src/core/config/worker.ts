class WorkerService {
  public worker;
  constructor() {
    this.worker = new SharedWorker("/worker.js");
  }

  startWorker() {
    this.worker.port.start();
  }

  postMessage(message: unknown) {
    this.worker.port.postMessage(message);
  }

  onMessage(callBack: (e: MessageEvent) => void) {
    this.worker.port.onmessage = (e: MessageEvent) => {
      callBack(e);
    };
  }
}

const workerService =
  typeof Worker !== "undefined" ? new WorkerService() : null;

export default workerService;
