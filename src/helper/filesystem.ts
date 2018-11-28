import * as vscode from 'vscode';
import * as fs from 'fs';
import { Bytes } from './bytes';

//export class FileSystem {
//  constructor() {}
//
//  /** Write bytes to file */
//  writeBytes(fileName: string, content: string) {
//    let data = new Buffer(Bytes.toBytes(content));
//
//    fs.writeFile(fileName, data, err => {
//      if (err) {
//        vscode.window.showInformationMessage(
//          'hp42s/free42: Write binary file failed'
//        );
//      }
//    });
//  }
//
//  /** Write text file */
//  writeText(fileName: string, content: string) {
//    fs.writeFile(fileName, content, err => {
//      if (err) {
//        vscode.window.showInformationMessage(
//          'hp42s/free42: write text file failed'
//        );
//      }
//    });
//  }
//
//  /** Delete file */
//  deleteFile(filename: string) {
//    fs.exists(filename, exists => {
//      if (exists) {
//        fs.unlink(filename, err => {
//          if (err) {
//            vscode.window.showErrorMessage('hp42s/free42: delete file failed');
//          }
//          console.log(filename + ' deleted');
//        });
//      }
//    });
//  }
//
//  getFileSize(uri: vscode.Uri): Number {
//    let filepath = this.getPhysicalPath(uri);
//    let fstat = fs.statSync(filepath);
//    return fstat ? fstat['size'] : -1;
//  }
//
//  getPhysicalPath(uri: vscode.Uri): string {
//    if (uri.scheme === 'rawhex') {
//      // remove the 'hexdump' extension
//      let filepath = uri.with({ scheme: 'file' }).fsPath.slice(0, -7);
//      return filepath;
//    }
//
//    return uri.fsPath;
//  }
//
//  getBuffer(uri: vscode.Uri): Buffer | undefined {
//    return this.getEntry(uri);
//  }
//
//  getEntry(uri: vscode.Uri): Buffer | undefined {
//    // ignore text files with hexdump syntax
//    if (uri.scheme !== 'hexdump') {
//      return;
//    }
//    const filepath = this.getPhysicalPath(uri);
//
//    let buffer: Buffer | undefined;
//    buffer = fs.readFileSync(filepath);
//
//    return buffer;
//  }
//
//  existsSync(filePath: string): boolean {
//    return fs.existsSync(filePath);
//  }
//
//  dispose() {}
//}

/** Write bytes to file */
export function writeBytes(fileName: string, content: string) {
  let data = new Buffer(Bytes.toBytes(content));

  fs.writeFile(fileName, data, err => {
    if (err) {
      vscode.window.showInformationMessage(
        'hp42s/free42: Write binary file failed'
      );
    }
  });
}

/** Write text file */
export function writeText(fileName: string, content: string) {
  fs.writeFile(fileName, content, err => {
    if (err) {
      vscode.window.showInformationMessage(
        'hp42s/free42: write text file failed'
      );
    }
  });
}

/** Delete file */
export function deleteFile(filename: string) {
  fs.exists(filename, exists => {
    if (exists) {
      fs.unlink(filename, err => {
        if (err) {
          vscode.window.showErrorMessage('hp42s/free42: delete file failed');
        }
        console.log(filename + ' deleted');
      });
    }
  });
}

export function getFileSize(uri: vscode.Uri): Number {
  let filepath = getPhysicalPath(uri);
  let fstat = fs.statSync(filepath);
  return fstat ? fstat['size'] : -1;
}

export function getPhysicalPath(uri: vscode.Uri): string {
  if (uri.scheme === 'rawhex') {
    // remove the 'hexdump' extension
    let filepath = uri.with({ scheme: 'file' }).fsPath.slice(0, -7);
    return filepath;
  }

  return uri.fsPath;
}

export function getBuffer(uri: vscode.Uri): Buffer | undefined {
  return getEntry(uri);
}

export function getEntry(uri: vscode.Uri): Buffer | undefined {
  // ignore text files with hexdump syntax
  if (uri.scheme !== 'rawhex') {
    return;
  }
  const filepath = getPhysicalPath(uri);

  let buffer: Buffer | undefined;
  buffer = fs.readFileSync(filepath);

  return buffer;
}

export function existsSync(filePath: string): boolean {
  return fs.existsSync(filePath);
}
