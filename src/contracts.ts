import * as vscode from 'vscode';
import { ProgError } from './progerror';
import { Result } from './result';
import { Configuration } from './configuration';

export type unstring = string | undefined;
export type unProgError = ProgError | undefined;
export type configBit = {} | undefined;

export interface IConverter {
  encode(config: Configuration, languageId: string, editor: vscode.TextEditor): Result;
  dispose(): void;
}

export interface IFormatter {
  provideDocumentFormattingEdits(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.TextEdit[]>;
  dispose(): void;
}

export interface IFileSystem {
  deleteFile(filename: string): any;
  writeBytes(fileName: string, content: string): void;
  writeText(fileName: string, content: string): void;
  dispose(): void;
}
