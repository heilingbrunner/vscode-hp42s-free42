import * as vscode from 'vscode';

export class Configuration {
    generateHexFile: {} | undefined;
    
    useLineNumbers: {} | undefined;
    replaceAbbreviations: {} | undefined;
    removeTooLongSpaces: {} | undefined;
    trimLine: {} | undefined;

    constructor(useWorkspaceConfiguration: boolean){
        if(useWorkspaceConfiguration){
          let config = vscode.workspace.getConfiguration('HP42S/free42');

          this.generateHexFile = config.get('encoderGenerateHexFile');

          this.useLineNumbers = config.get('formatterUseLineNumbers');
          this.replaceAbbreviations = config.get('formatterReplaceAbbreviations');
          this.removeTooLongSpaces = config.get('formatterRemoveTooLongSpaces');
          this.trimLine = config.get('formatterTrimLine');
        }
    }
    
}