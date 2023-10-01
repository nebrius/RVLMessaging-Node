/*
Copyright (c) Bryan Hughes <bryan@nebri.us>

This file is part of RVL Node.

RVL Node is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

RVL Node is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with RVL Node.  If not, see <http://www.gnu.org/licenses/>.
*/

import {
  LogLevel,
  IWorkerOptions,
  IMessage,
  ISendPacketMessage,
  IReceivePacketMessage,
  ISetWaveParametersMessage,
  ISetBrightnessMessage,
  ISetPowerStateMessage
} from './types';
import { IWaveParameters } from './animation';
import { join } from 'path';
import { fork, ChildProcess } from 'child_process';

const DEFAULT_TIME_PERIOD = 255;
const DEFAULT_DISTANCE_PERIOD = 32;
const MAX_NUM_WAVES = 4;

export type SendPacket = (message: ISendPacketMessage) => void;

// Private and friend class properties
export const initController = Symbol();
export const processPacket = Symbol();
const isInitialized = Symbol();
const options = Symbol();
const rvlWorker = Symbol();
const sendPacket = Symbol();

export class RVLController {
  private [isInitialized] = false;
  private [options]: IWorkerOptions;
  private [rvlWorker]: ChildProcess | undefined;
  private [sendPacket]: SendPacket;

  public get channel() {
    return this[options].channel;
  }

  public get logLevel() {
    return this[options].logLevel;
  }

  constructor(
    channel: number,
    logLevel: LogLevel,
    deviceId: number,
    send: SendPacket
  ) {
    this[options] = { channel, logLevel, deviceId };
    this[sendPacket] = send;
  }

  public [initController](): Promise<void> {
    return new Promise((resolve, reject) => {
      this[rvlWorker] = fork(join(__dirname, 'worker.js'), [ JSON.stringify(this[options]) ]);

      this[rvlWorker].on('error', reject);

      this[rvlWorker].on('exit', (code) => {
        throw new Error(`Internal Error: worker thread unexpectedly quit with code ${code}`);
      });

      this[rvlWorker].on('message', (message: IMessage) => {
        if (!this[isInitialized]) {
          if (message.type === 'initComplete') {
            this[isInitialized] = true;
            resolve();
          } else {
            throw new Error(
              `Internal Error: received worker thread "${message.type}" message before receiving "initComplete" message`
            );
          }
        } else {
          switch (message.type) {
            case 'sendPacket':
              this[sendPacket](message as ISendPacketMessage);
              break;
            default:
              throw new Error(`Internal Error: received unknown message type "${message.type}" from child process`);
          }
        }
      });
    });
  }

  public [processPacket](packet: Buffer): void {
    if (!this[rvlWorker]) {
      throw new Error('Internal Error: this[rvlWorker] is unexpectedly undefined. This is a bug');
    }
    const message: IReceivePacketMessage = {
      type: 'receivedPacket',
      payload: packet.toString('base64')
    };
    this[rvlWorker].send(message);
  }

  public setWaveParameters(newWaveParameters: IWaveParameters): void {
    if (!this[isInitialized]) {
      throw new Error('Cannot call "setWaveParameters" before calling "init"');
    }
    if (!this[rvlWorker]) {
      throw new Error('Internal Error: this[rvlWorker] is unexpectedly undefined. This is a bug');
    }
    if (newWaveParameters.waves.length > MAX_NUM_WAVES) {
      throw new Error(`Only ${MAX_NUM_WAVES} waves max are supported`);
    }
    if (typeof newWaveParameters.timePeriod !== 'number') {
      newWaveParameters.timePeriod = DEFAULT_TIME_PERIOD;
    }
    if (typeof newWaveParameters.distancePeriod !== 'number') {
      newWaveParameters.timePeriod = DEFAULT_DISTANCE_PERIOD;
    }
    const message: ISetWaveParametersMessage = {
      type: 'setWaveParameters',
      waveParameters: newWaveParameters
    };
    this[rvlWorker].send(message);
  }

  public setPowerState(newPowerState: boolean): void {
    if (!this[isInitialized]) {
      throw new Error('Cannot call "setPowerState" before calling "init"');
    }
    if (!this[rvlWorker]) {
      throw new Error('Internal Error: this[rvlWorker] is unexpectedly undefined. This is a bug');
    }
    const message: ISetPowerStateMessage = {
      type: 'setPowerState',
      powerState: newPowerState
    };
    this[rvlWorker].send(message);
  }

  public setBrightness(newBrightness: number): void {
    if (!this[isInitialized]) {
      throw new Error('Cannot call "setBrightness" before calling "init"');
    }
    if (!this[rvlWorker]) {
      throw new Error('Internal Error: this[rvlWorker] is unexpectedly undefined. This is a bug');
    }
    const message: ISetBrightnessMessage = {
      type: 'setBrightness',
      brightness: newBrightness
    };
    this[rvlWorker].send(message);
  }
}
