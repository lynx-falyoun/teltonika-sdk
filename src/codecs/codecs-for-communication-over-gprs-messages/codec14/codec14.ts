import { BaseCodec, CodecsTypesEnum, GprsCodecInterface } from '@app/codecs';
import {
  checkCodecType,
  convertAsciiToBinary,
  convertBytesToInt,
  convertHexToAscii,
} from '@app/utils';
import { TeltonikaPacketsParser } from '@app/teltonika-packets-parser';

/**
 * Codec14 is original Teltonika protocol for device-server communication over GPRS messages and it is based on Codec12 protocol.
 * Main difference of Codec14 is that, device will answer to GPRS command if device physical IMEI number matches specified IMEI number in GPRS command.
 * Codec14 GPRS commands can be used for sending configuration, debug, digital outputs control commands or other (special purpose command on special firmware versions).
 */
export class Codec14 extends BaseCodec implements GprsCodecInterface {
  constructor(reader, codecType: CodecsTypesEnum) {
    checkCodecType(codecType, CodecsTypesEnum.COMMUNICATION_OVER_GPRS_CODEC);
    super(reader, codecType);
  }

  sendCommand(command: string) {
    const bytes = convertAsciiToBinary(command);
    // const zeros = '00000000';
    // const dataSize = '00000016';
    // const codecId = '0E';
    // const commandsQuantity1 = '01';
    // const commandType = '05';
    // const commandSize = '0000000E';
    // const imei = '0352093081452251';
    // const command = '676574766572';
    // const commandsQuantity2 = '01';
    // const CRC = '0000D2C1';
    //
    // console.log('Command: ', convertAsciiToBinary(command)); // Should print 'getver'
    console.log('bytes: ', bytes);
  }

  getDeviceResponse() {
    const zeros = '00000000';
    const dataSize = '00000037';
    const codecId = '0E';
    const responseQuantity1 = '01';
    const responseType = '06';
    const responseSize = '00000096';
    const imei = '0352093081452251';
    const response =
      '5665723A30332E31382E31345F3034204750533A41584E5F352E31305F333333332048773A464D42313230204D6F643A313520494D45493A33353230393330383134353232353120496E69743A323031382D31312D323220373A313320557074696D653A3137323334204D41433A363042444430303136323631205350433A312830292041584C3A30204F42443A3020424C3A312E362042543A34';
    const responseQuantity2 = '01';
    const CRC = '00007AAE';
    const responsePacket =
      zeros +
      dataSize +
      codecId +
      responseQuantity1 +
      responseType +
      responseSize +
      imei +
      response +
      responseQuantity2 +
      CRC;
    const parser = new TeltonikaPacketsParser(
      Buffer.from(responsePacket, 'hex'),
    );
    console.log('Device response tcp packet: ', parser.tcpTeltonikaPacket);
  }
  protected decodeBody() {
    for (let i = 0; i < this.tcpTeltonikaPacket.header.numberOfRecords1; i++) {
      const messageType = convertBytesToInt(this.reader.readBytes(1));
      // 0x06(6 in decimal) (if it is ACK) or 0x11(17 in decimal) (if it is nACK)
      if (messageType === 17) {
        console.log('Not acknowledgement from device');
        return;
      }
      if (messageType === 6) {
        // Acknowledgement from device
        // Response message structure
        const responseSize = convertBytesToInt(this.reader.readBytes(4));
        const imei = convertBytesToInt(this.reader.readBytes(8));
        let response = '';
        for (let i = 0; i < responseSize; i++) {
          const byte = this.reader.readBytes(1);
          response += convertHexToAscii(byte as any);
        }

        console.log('response: ', response);
      }
    }
  }
}
