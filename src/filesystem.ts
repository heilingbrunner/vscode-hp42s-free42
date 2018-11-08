import * as vscode from "vscode";
import * as fs from "fs";
import { IFileSystem } from "./contracts";
import { Bytes } from './bytes';

export class FileSystem implements IFileSystem {

  constructor() {}

  /** Write bytes to file */
  writeBytes(fileName: string, content: string) {
    let data = new Buffer(Bytes.toBytes(content));

    fs.writeFile(fileName, data, (err) => {
      if (err) {
        vscode.window.showInformationMessage("hp42s/free42: Write binary file failed");
      }
    });
  }

  /** Write text file */
  writeText(fileName: string, content: string) {
    fs.writeFile(fileName, content, (err) => {
      if (err) {
        vscode.window.showInformationMessage("hp42s/free42: write text file failed");
      }
    });
  }

  /** Delete file */
  deleteFile(filename: string){
    fs.exists(filename,(exists)=>{
      if(exists){
        fs.unlink(filename,(err) => {
          if (err) {
            vscode.window.showErrorMessage("hp42s/free42: delete file failed");
          } 
          console.log(filename + ' deleted');
        });
      }
    });
  }

  dispose() {}
  
}
