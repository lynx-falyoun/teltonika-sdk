import { convertBytesToInt } from '@app/utils';
import {
  BaseCodec,
  Codec12,
  Codec13,
  Codec14,
  Codec16,
  Codec8,
  Codec8ex,
  CodecsTypesEnum,
  TcpTeltonikaPacket,
} from '@app/codecs';
import { BinaryReader } from '@app/binary-data-handler';

export class TeltonikaPacketsParser {
  private _reader: BinaryReader;
  private isImei = false;
  private imei: any;
  private _codec: BaseCodec;
  private _tcpTeltonikaPacket: TcpTeltonikaPacket;
  private readonly _buff;
  constructor(buffer) {
    this._buff = buffer;
    this._reader = new BinaryReader(buffer);
    this.checkIsImei();
    if (!this.isImei) {
      this.process();
    }
  }

  private checkIsImei() {
    const imeiLength = convertBytesToInt(this._reader.readBytes(2));
    console.log({ imeiLength });
    if (imeiLength > 0) {
      this.isImei = true;
      this.imei = this._reader.readBytes(imeiLength).toString();
      console.log({ imei: this.imei });
    } else {
      convertBytesToInt(this._reader.readBytes(2));
    }
  }

  private process() {
    // We need to advance the point until we encounter the id
    // with the result of that, we can destruct the id value
    this._reader.readInt32(); // data size record
    const codec_id = convertBytesToInt(this._reader.readBytes(1));
    this._reader = new BinaryReader(this._buff);
    switch (codec_id) {
      case 8:
        this._codec = new Codec8(
          this._reader,
          CodecsTypesEnum.DEVICE_DATA_SENDING_CODEC,
        );
        break;
      case 142:
        this._codec = new Codec8ex(
          this._reader,
          CodecsTypesEnum.DEVICE_DATA_SENDING_CODEC,
        );
        break;
      case 16:
        this._codec = new Codec16(
          this._reader,
          CodecsTypesEnum.DEVICE_DATA_SENDING_CODEC,
        );
        break;
      case 12:
        this._codec = new Codec12(
          this._reader,
          CodecsTypesEnum.COMMUNICATION_OVER_GPRS_CODEC,
        );
        break;
      case 13:
        this._codec = new Codec13(
          this._reader,
          CodecsTypesEnum.COMMUNICATION_OVER_GPRS_CODEC,
        );
        break;
      case 14:
        this._codec = new Codec14(
          this._reader,
          CodecsTypesEnum.COMMUNICATION_OVER_GPRS_CODEC,
        );
        break;
    }

    this.tcpTeltonikaPacket = this._codec.decodePacket();
    return this.tcpTeltonikaPacket;
  }

  get codec() {
    return this._codec;
  }
  set tcpTeltonikaPacket(value) {
    this._tcpTeltonikaPacket = value;
  }
  get tcpTeltonikaPacket() {
    return this._tcpTeltonikaPacket;
  }
}
