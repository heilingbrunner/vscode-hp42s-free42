import * as vscode from "vscode";

export class Configuration {

  platform: string;
  encoderGenerateHexFile?: boolean;
  decoderGenerateHexFile?: boolean;

  useLineNumbers?: boolean;
  replaceAbbreviations?: boolean;
  removeTooLongSpaces?: boolean;
  trimLine?: boolean;
  useWhitespaceBetweenHex?: boolean;
  eol?: string;

  constructor(useWorkspaceConfiguration: boolean) {
    this.platform = process.platform;

    if (useWorkspaceConfiguration) {
      let config = vscode.workspace.getConfiguration("HP42S/free42");

      this.encoderGenerateHexFile = config.get<boolean>("encoderGenerateHexFile");
      this.decoderGenerateHexFile = config.get<boolean>("decoderGenerateHexFile");

      this.useLineNumbers = config.get<boolean>("formatterUseLineNumbers");
      this.replaceAbbreviations = config.get<boolean>("formatterReplaceAbbreviations");
      this.removeTooLongSpaces = config.get<boolean>("formatterRemoveTooLongSpaces");
      this.trimLine = config.get<boolean>("formatterTrimLine");
      this.useWhitespaceBetweenHex = config.get<boolean>("formatterUseWhitespaceBetweenHex");
      
      // get eol ...
      config = vscode.workspace.getConfiguration("files", null);
      const fileseol = String(config.get<string>("eol"));

      switch (true) {
        case /auto/.test(fileseol):
          this.eol = (this.platform === 'win32' ? '\r\n' : '\n');
          break;
        case /\r\n/.test(fileseol):
          this.eol = '\r\n';
          break;
        case /\n/.test(fileseol):
          this.eol = '\n';
          break;
        default:
          this.eol = '\r\n';
          break;
      }
        

      
    } else {
      this.encoderGenerateHexFile = true;

      this.useLineNumbers = true;
      this.replaceAbbreviations = true;
      this.removeTooLongSpaces = true;
      this.trimLine = true;
      this.useWhitespaceBetweenHex = true;
      this.eol = '\r\n';
    }
  }
}
