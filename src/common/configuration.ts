import * as vscode from 'vscode';

export class Configuration {
    generateHexFile?: boolean;
    
    useLineNumbers?: boolean;
    replaceAbbreviations?: boolean;
    removeTooLongSpaces?: boolean;
    trimLine?: boolean;
    useWhitespaceBetweenHex?: boolean;

    constructor(useWorkspaceConfiguration: boolean){
        if(useWorkspaceConfiguration){
          let config = vscode.workspace.getConfiguration('HP42S/free42');

          this.generateHexFile = config.get<boolean>('encoderGenerateHexFile');

          this.useLineNumbers = config.get<boolean>('formatterUseLineNumbers');
          this.replaceAbbreviations = config.get<boolean>('formatterReplaceAbbreviations');
          this.removeTooLongSpaces = config.get<boolean>('formatterRemoveTooLongSpaces');
          this.trimLine = config.get<boolean>('formatterTrimLine');
          this.useWhitespaceBetweenHex = config.get<boolean>('formatterUseWhitespaceBetweenHex'); 
        } else {
          this.generateHexFile = true;

          this.useLineNumbers = true;
          this.replaceAbbreviations = true;
          this.removeTooLongSpaces = true;
          this.trimLine = true;
          this.useWhitespaceBetweenHex = true;
        }
    }
    
}