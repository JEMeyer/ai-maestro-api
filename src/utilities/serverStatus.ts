/**
 * The ServerStatus class manages the busy status of servers, using a Map to store server IDs and their availability.
 */
class ServerStatus {
  private pendingRequests: Map<string, boolean> = new Map();

  public isBusy(serverId: string): boolean {
    return this.pendingRequests.get(serverId) || false;
  }

  public markBusy(serverId: string): void {
    this.pendingRequests.set(serverId, true);
  }

  public markAvailable(serverId: string): void {
    this.pendingRequests.set(serverId, false);
  }
}

export const serverStatus = new ServerStatus();
