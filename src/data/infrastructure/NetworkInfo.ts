import * as Network from 'expo-network';
import { INetworkInfo } from '../../domain/repositories/INetworkInfo';

export class NetworkInfo implements INetworkInfo {
  async isConnected(): Promise<boolean> {
    try {
      const status = await Network.getNetworkStateAsync();
      return Boolean(status.isConnected && status.isInternetReachable !== false);
    } catch {
      return false;
    }
  }
}

