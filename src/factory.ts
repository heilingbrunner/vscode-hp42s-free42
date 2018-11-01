import { IConverter, IFormatter, IFileSystem } from './contracts';
import { Converter } from './converter';
import { Formatter } from './formatter';
import { FileSystem } from './filesystem';

export class Factory {
  static getConverter(): IConverter {
    return new Converter();
  }

  static getFormatter(): IFormatter {
    return new Formatter();
  }

  static getFileSystem(): IFileSystem {
    return new FileSystem();
  }
}
