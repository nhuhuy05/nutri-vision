import * as Network from 'expo-network';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

export async function checkNetworkStatus(): Promise<NetworkState> {
  try {
    const status = await Network.getNetworkStateAsync();
    return {
      isConnected: Boolean(status.isConnected),
      isInternetReachable: status.isInternetReachable ?? status.isConnected ?? false,
    };
  } catch (error) {
    return {
      isConnected: false,
      isInternetReachable: false,
    };
  }
}

