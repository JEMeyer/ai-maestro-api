class ServerStatus {
  private pendingRequests: Map<string, boolean> = new Map();

  public isServerBusy(serverId: string): boolean {
    return this.pendingRequests.get(serverId) || false;
  }

  public markServerBusy(serverId: string): void {
    this.pendingRequests.set(serverId, true);
  }

  public markServerAvailable(serverId: string): void {
    this.pendingRequests.set(serverId, false);
  }
}

export const serverStatus = new ServerStatus();
