import * as vscode from 'vscode';
// import * as fs from 'fs';

import { toBytes } from './bytes';

/** Write bytes to file */
export async function writeBytes(fileName: string, content: string) {
    try {
        const data = Uint8Array.from(toBytes(content));
        const uri = vscode.Uri.file(fileName);
        await vscode.workspace.fs.writeFile(uri, data);
    } catch (err) {
        vscode.window.showInformationMessage(
            'hp42s/free42: Write binary file failed'
        );
    }
}

/** Write text file */
export async function writeText(fileName: string, content: string) {
    try {
        const uri = vscode.Uri.file(fileName);
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        await vscode.workspace.fs.writeFile(uri, data);
    } catch (err) {
        vscode.window.showInformationMessage(
            'hp42s/free42: write text file failed'
        );
    }
}

/** Delete file */
export async function deleteFile(filename: string) {
    try {
        const uri = vscode.Uri.file(filename);
        const stat = await vscode.workspace.fs.stat(uri);
        if (stat) {
            await vscode.workspace.fs.delete(uri);
        }
    } catch (err) {
        // File doesn't exist or delete failed
        if (!(err instanceof vscode.FileSystemError.FileNotFound)) {
            vscode.window.showErrorMessage('hp42s/free42: delete file failed');
        }
    }
}

export async function getFileSize(uri: vscode.Uri): Promise<number> {
    try {
        const filepath = getPhysicalPath(uri);
        const uriPath = vscode.Uri.file(filepath);
        const stat = await vscode.workspace.fs.stat(uriPath);
        return stat.size;
    } catch (err) {
        return -1;
    }
}

export function getPhysicalPath(uri: vscode.Uri): string {
    if (uri.scheme === 'raw42') {
        // remove the '.raw42' extension
        const filepath = uri.with({ scheme: 'file' }).fsPath.slice(0, -('.raw42'.length));
        return filepath;
    }

    return uri.fsPath;
}

export async function getBuffer(uri: vscode.Uri): Promise<Uint8Array | undefined> {
    return getEntry(uri);
}

export async function getEntry(uri: vscode.Uri): Promise<Uint8Array | undefined> {
    // ignore text files with hexdump syntax
    if (uri.scheme !== 'raw42') {
        return undefined;
    }
    
    try {
        const filepath = getPhysicalPath(uri);
        const fileUri = vscode.Uri.file(filepath);
        const data = await vscode.workspace.fs.readFile(fileUri);
        return data;
    } catch (err) {
        return undefined;
    }
}

export async function existsSync(filePath: string): Promise<boolean> {
    try {
        const uri = vscode.Uri.file(filePath);
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch (err) {
        return false;
    }
}
