import { DeviceType } from '@filedrop/types';

export interface Client {
  clientId?: string;
  clientName?: string;
  readonly firstSeen: Date;
  lastSeen: Date;
  readonly remoteAddress?: string;
  networkName?: string;
  readonly readyState: number;
  publicKey?: string;
  deviceType?: DeviceType;
  initialized: boolean;
  secret?: string;

  send(data: string): void;
  close(): void;
}
