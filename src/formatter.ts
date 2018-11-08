import * as vscode from 'vscode';
import { IFormatter } from './contracts';

export class Formatter implements IFormatter {
  constructor() {}

  provideDocumentFormattingEdits(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    let edits: vscode.TextEdit[] = [];

    // read Configuration
    let config = vscode.workspace.getConfiguration('HP42S/free42');
    let useLineNumbers = config.get('formatterUseLineNumbers');
    let replaceAbbreviations = config.get('formatterReplaceAbbreviations');
    let removeTooLongSpaces = config.get('formatterRemoveTooLongSpaces');
    let trimLine = config.get('formatterTrimLine');

    let codeLineNr = 0;

    // go through document line by line
    for (let i = 0; i < document.lineCount; i++) {
      let line = document.lineAt(i);
      let text = line.text;

      if (!line.isEmptyOrWhitespace) {

        // Remove line numbers
        text = text.replace(/(^\s*\d+)(▸|▶|\s+)(.*)/, '$3');

        // Refresh line numbers, when not removing line numbers
        if (useLineNumbers) {
          if (!text.match(/^\s*(@|#|\/\/)/)) {

            // When first code line is not { n-Byte Prgm }, then increment codeLineNr
            if((codeLineNr === 0) && !text.match(/^\{ .* \}/)){
              codeLineNr ++;
            }

            // line format min. two digits
            text = text.replace(
              /^(\d+\s+|)(.+)/,
              (codeLineNr < 10 ? '0' + codeLineNr : codeLineNr) + ' $2'
            );
            codeLineNr++;
          }
        }

        if (replaceAbbreviations) {
          // see https://www.swissmicros.com/dm42/decoder/ see 2. tab
          text = text.replace(/RCLx/, 'RCL×');
          text = text.replace(/RCL\//, 'RCL÷');

          text = text.replace(/STOx/, 'STO×');
          text = text.replace(/STO\//, 'STO÷');

          text = text.replace(/BASEx/, 'BASE×');
          text = text.replace(/BASE\//, 'BASE÷');
          text = text.replace(/BASE\+\/-/, 'BASE±');

          text = text.replace(/\b(R(\\|)\^)/, 'R↑');
          text = text.replace(/\b(R(\\|)v)\b/, 'R↓');

          text = text.replace(/\\Sigma/, 'Σ');
          text = text.replace(/\\GS/, 'Σ');

          text = text.replace(/SUM\+/, 'Σ+');
          text = text.replace(/SUM-/, 'Σ-');
          text = text.replace(/CLSUM/, 'CLΣ');
          text = text.replace(/PRSUM/, 'PRΣ');
          text = text.replace(/SUMREG/, 'ΣREG');

          text = text.replace(/(\\|)->HR/, '→HR');
          text = text.replace(/(\\|)->HMS/, '→HMS');

          text = text.replace(/(\\|)->DEC/, '→DEC');
          text = text.replace(/(\\|)->OCT/, '→OCT');
          text = text.replace(/(\\|)->RAD/, '→RAD');
          text = text.replace(/(\\|)->HMS/, '→HMS');
          text = text.replace(/(\\|)->REC/, '→REC');
          text = text.replace(/(\\|)->DEG/, '→DEG');
          text = text.replace(/(\\|)->POL/, '→POL');

          text = text.replace(/X!=0\?/, 'X≠0?');
          text = text.replace(/X<=0\?/, 'X≤0?');
          text = text.replace(/X>=0\?/, 'X≥0?');
          text = text.replace(/X!=Y\?/, 'X≠Y');
          text = text.replace(/X<=Y0\?/, 'X≤Y?');
          text = text.replace(/X>=Y\?/, 'X≥Y?');

          text = text.replace(/\b\+\/-\b/, '±');
          text = text.replace(/10\^X/, '10↑X');
          text = text.replace(/E\^X/, 'E↑X');
          text = text.replace(/X\^2/, 'X↑2');
          text = text.replace(/Y\^X/, 'Y↑X');
          text = text.replace(/E\^X-1/, 'E↑X-1');

          text = text.replace(/\b<-\b/, '←');
          text = text.replace(/\b\^\b/, '↑');
          text = text.replace(/\bv\b/, '↓');
          text = text.replace(/\b->\b/, '→');

          text = text.replace(/\b\/\b/, '÷');

          text = text.replace(/\|-/, '⊢');
          text = text.replace(/├/, '⊢');
        }

        if (removeTooLongSpaces) {
          if (!/".*"/.test(text)) {
            // All without double quotes
            text = text.replace(/\s{2,}/g, ' ');
          } else {
            // All without double quotes
            if (/^(\w+)(\s+)"/.test(text)) {
              text = text.replace(/^(\w+)(\s+)"/, '$1 "');
            }

            //if (/"\s{2,}/.test(text)) {
            //  text = text.replace(/"\s{2,}/g, '" ');
            //}
          }

          if (/\s+IND\s+/.test(text)) {
            text = text.replace(/\s+IND\s+/, ' IND ');
          }

          if (/\s+TO\s+/.test(text)) {
            text = text.replace(/\s+TO\s+/, ' TO ');
          }
        }

        if (trimLine) {
          text = text.trim();
        }

        edits.push(
          vscode.TextEdit.replace(
            new vscode.Range(line.range.start, line.range.end),
            text
          )
        );
      }
    }
    return edits;
  }

  dispose() {}
}
