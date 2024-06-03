import { getGPUFromPath } from '../services/database';

/**
 * The ComputeStatus class manages the busy status of servers, using a Map to store server IDs and their availability.
 */
class ComputeStatus {
  // "keys" are the gpu ids
  private pendingRequests: Map<string, boolean> = new Map();

  public isBusy(path: string) {
    const gpu = getGPUFromPath(path);

    if (!gpu) {
      return new Error('No GPU found for the given path');
    } else {
      return this.pendingRequests.get(gpu.id) || false;
    }
  }

  public markBusy(path: string) {
    const gpu = getGPUFromPath(path);

    if (!gpu) {
      return new Error('No GPU found for the given path');
    }

    this.pendingRequests.set(gpu.id, true);
  }

  public markAvailable(path: string) {
    const gpu = getGPUFromPath(path);

    if (!gpu) {
      return new Error('No GPU found for the given path');
    }

    this.pendingRequests.set(gpu.id, false);
  }
}

export const Compute = new ComputeStatus();
