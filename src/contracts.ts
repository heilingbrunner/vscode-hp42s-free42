import * as vscode from 'vscode';
import { ProgError } from './progerror';
import { Result } from './result';

export type unstring = string | undefined;
export type unProgError = ProgError | undefined;

export interface IConverter {
  encode(languageId: string, text: string): Result;
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
