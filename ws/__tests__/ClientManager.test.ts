import {
  ActionMessageActionType,
  TargetedMessageModel,
  ActionMessageModel,
  MessageType,
  InitializeMessageModel,
} from '@filedrop/types';

import { ClientManager } from '../src/ClientManager.js';
import { Client } from '../src/types/Client.js';
import { generateClientName } from '../src/utils/name.js';
export class TestClient implements Client {
  clientName = generateClientName();
  readonly firstSeen = new Date();
  lastSeen = new Date();
  remoteAddress?: string = undefined;
  networkName?: string = undefined;
  lastMessage = '{}';
  closed = false;
  readyState = 1;
  clientId?: string;
  secret?: string;
  initialized = false;
  send(message: any) {
    this.lastMessage = JSON.stringify(message);
  }

  sendRaw(data: string) {
    this.lastMessage = data;
  }

  close() {
    this.closed = true;
  }
}

describe('ClientManager', () => {
  it('welcomes the client', async () => {
    const clientManager = new ClientManager();

    const client = new TestClient();
    clientManager.sendAppInfo(client);

    expect(JSON.parse(client.lastMessage)).toMatchObject({
      type: MessageType.APP_INFO,
    });

    clientManager.handleMessage(client, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC',
    } as InitializeMessageModel);

    expect(JSON.parse(client.lastMessage)).toMatchObject({
      type: MessageType.CLIENT_INFO,
      clientId: client.clientId,
      suggestedClientName: client.clientName,
    });
  });

  it('keeps track of local clients', async () => {
    const clientManager = new ClientManager();

    const client1 = new TestClient();
    client1.remoteAddress = '127.0.0.1';
    client1.networkName = 'TEST';
    clientManager.handleMessage(client1, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);

    const client2 = new TestClient();
    client2.remoteAddress = '127.0.0.2';
    client2.networkName = 'TEST';
    clientManager.handleMessage(client2, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);

    const client3 = new TestClient();
    client3.remoteAddress = '127.0.0.1';
    client3.networkName = 'TEST';
    clientManager.handleMessage(client3, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);

    expect(clientManager.getLocalClients(client1)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          clientId: client1.clientId,
        }),
        expect.objectContaining({
          clientId: client3.clientId,
        }),
      ])
    );
    expect(clientManager.getLocalClients(client2)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          clientId: client2.clientId,
        }),
      ])
    );

    clientManager.removeClient(client3);
    expect(clientManager.getLocalClients(client1)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          clientId: client1.clientId,
        }),
      ])
    );
  });

  it('pings clients', async () => {
    const clientManager = new ClientManager();

    const client1 = new TestClient();
    clientManager.handleMessage(client1, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);

    const client2 = new TestClient();
    clientManager.handleMessage(client2, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC2',
    } as InitializeMessageModel);

    const client3 = new TestClient();
    clientManager.handleMessage(client3, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC3',
    } as InitializeMessageModel);

    clientManager.pingClients();

    expect(JSON.parse(client1.lastMessage)).toMatchObject({
      type: MessageType.PING,
    });

    expect(JSON.parse(client2.lastMessage)).toMatchObject({
      type: MessageType.PING,
    });

    expect(JSON.parse(client3.lastMessage)).toMatchObject({
      type: MessageType.PING,
    });
  });

  it('relays messages to target clients', async () => {
    const clientManager = new ClientManager();

    const client1 = new TestClient();
    clientManager.handleMessage(client1, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);

    const client2 = new TestClient();
    clientManager.handleMessage(client2, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC2',
    } as InitializeMessageModel);

    const targetedMessage: ActionMessageModel = {
      type: MessageType.ACTION,
      action: ActionMessageActionType.ACCEPT,
      targetId: client2.clientId!,
      transferId: 'ay3UIn8k4QsznfyHCt9mh',
    };

    clientManager.handleMessage(client1, targetedMessage);

    expect(JSON.parse(client2.lastMessage)).toMatchObject({
      type: MessageType.ACTION,
    });
  });

  it('drops invalid messages', async () => {
    const clientManager = new ClientManager();

    const client1 = new TestClient();
    clientManager.handleMessage(client1, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC1',
    } as InitializeMessageModel);

    const client2 = new TestClient();
    clientManager.handleMessage(client2, {
      type: MessageType.INITIALIZE,
      secret: 'ABCABCABCABC2',
    } as InitializeMessageModel);

    const targetedMessage: TargetedMessageModel = {
      type: MessageType.ACTION,
      targetId: client2.clientId!,
    };

    clientManager.handleMessage(client1, targetedMessage);

    expect(JSON.parse(client2.lastMessage)).toMatchObject({
      type: MessageType.CLIENT_INFO,
    });
  });
});
