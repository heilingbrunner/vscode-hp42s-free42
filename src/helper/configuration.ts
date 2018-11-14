import * as vscode from 'vscode';
import { configBit } from '../typedefs';

export class Configuration {
    ignoreLastEndCommandForBytePrgm: configBit;
    generateHexFile: configBit;
    
    useLineNumbers: configBit;
    replaceAbbreviations: configBit;
    removeTooLongSpaces: configBit;
    trimLine: configBit;

    constructor(useWorkspaceConfiguration: boolean){
        if(useWorkspaceConfiguration){
          let config = vscode.workspace.getConfiguration('HP42S/free42');

          this.ignoreLastEndCommandForBytePrgm = config.get('encoderIgnoreLastEndCommandForBytePrgm');
          this.generateHexFile = config.get('encoderGenerateHexFile');

          this.useLineNumbers = config.get('formatterUseLineNumbers');
          this.replaceAbbreviations = config.get('formatterReplaceAbbreviations');
          this.removeTooLongSpaces = config.get('formatterRemoveTooLongSpaces');
          this.trimLine = config.get('formatterTrimLine');
        }
    }
    
}