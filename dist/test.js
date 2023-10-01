"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
(async () => {
    const manager = await (0, index_1.createManager)();
    console.log(`RVL manager created on network interface ${manager.networkInterface}, ` +
        `bound to ${manager.address}:${manager.port}, with device ID ${manager.deviceId}`);
    const controller = await manager.createController({
        channel: 0
    });
    console.log(`RVL controller created on channel ${controller.channel} with log level ${index_1.LogLevel[controller.logLevel]}`);
    controller.setWaveParameters({
        waves: [
            (0, index_1.createPulsingWave)(0, 255, 1),
            (0, index_1.createSolidColorWave)(180, 255, 255)
        ]
    });
})();
//# sourceMappingURL=test.js.map