import * as vscode from 'vscode';
import * as fs from 'fs';

import { toBytes } from './bytes';

/** Write bytes to file */
export function writeBytes(fileName: string, content: string) {
  const data = Buffer.from(toBytes(content)); // deprecated: new Buffer(toBytes(content));

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
      });
    }
  });
}

export function getFileSize(uri: vscode.Uri): Number {
  const filepath = getPhysicalPath(uri);
  const fstat = fs.statSync(filepath);
  return fstat ? fstat['size'] : -1;
}

export function getPhysicalPath(uri: vscode.Uri): string {
  if (uri.scheme === 'raw42') {
    // remove the '.raw42' extension
    const filepath = uri.with({ scheme: 'file' }).fsPath.slice(0, -('.raw42'.length));
    return filepath;
  }

  return uri.fsPath;
}

export function getBuffer(uri: vscode.Uri): Buffer | undefined {
  return getEntry(uri);
}

export function getEntry(uri: vscode.Uri): Buffer | undefined {
  // ignore text files with hexdump syntax
  if (uri.scheme !== 'raw42') {
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
