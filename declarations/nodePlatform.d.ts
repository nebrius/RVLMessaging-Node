/// <reference types="node" />
export declare function addPacketToQueue(packet: Buffer): void;
export declare function beginWrite(destination: number): void;
export declare function write8(data: number): void;
export declare function write16(data: number): void;
export declare function write32(data: number): void;
export declare function write(data: number, length: number): void;
export declare function endWrite(): void;
export declare function parsePacket(): number;
export declare function read8(): number;
export declare function read16(): number;
export declare function read32(): number;
export declare function read(bufferPointer: number, length: number): void;
export declare function getDeviceId(): number;
export declare function localClock(): number;
export declare function print(messagePointer: number): void;
export declare function println(messagePointer: number): void;
