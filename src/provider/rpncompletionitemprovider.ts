import * as vscode from 'vscode';

export class RpnCompletionItemProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.CompletionItem[] {

        // Activation with '"', ' '
        // see extension.ts
        // vscode.languages.registerCompletionItemProvider(...)

        const items: vscode.CompletionItem[] = [];

        // get the current line/prefix
        const line = document.lineAt(position).text;
        const prefix = line.substring(0, position.character);

        if(!(/(CLV|GTO|INPUT|STO|RCL|VIEW|XEQ)/.test(prefix))) {
            return items;
        }

        let variableCompletionsFound: boolean = false;

        // 1. user at `GTO "` or `XEQ "` ? 
        if (/\b(GTO|XEQ)\s+["']$/.test(prefix)) {

            // Add global label completion items
            const labelCompletion = this.getGlobalLabelCompletionItems(document);
            if (labelCompletion) {
                items.push(...labelCompletion);
            }
        }

        // 2. user at `GTO ` or `XEQ ` ? 
        if (/\b(GTO|XEQ)\s+$/.test(prefix)) {

            // Add local label completion items
            const labelCompletion = this.getLocalLabelCompletionItems(document);
            if (labelCompletion) {
                items.push(...labelCompletion);
            }
        }

        // 2. user at `RCL "/'` oder `STO "/'`
        if (/\b(CLV|INPUT|RCL|STO|VIEW)(\+|-|×|÷)?\s+["']$/.test(prefix)) {

            // Add variable completion items
            const variableCompletion = this.getVariableCompletionItems(document);
            if (variableCompletion) {
                items.push(...variableCompletion);

                variableCompletionsFound = true;
            }

        }

        // 3. user at `RCL ` oder `STO `
        if (!variableCompletionsFound && /\b(RCL|STO)(\+|-|×|÷)?\s+$/.test(prefix)) {

            // Add register completion items
            const registerCompletion = this.getRegisterCompletionItems(document);
            if (registerCompletion) {
                items.push(...registerCompletion);
            }

        }

        return items;
    }

    private getGlobalLabelCompletionItems(
        document: vscode.TextDocument
    ): vscode.CompletionItem[] | undefined {

        const text = document.getText();

        // get global labels
        const labelRegex = /\bLBL\s+["']([A-Za-z0-9]+)["'](\s+|$)/gm;
        const labels = new Set<string>();
        let match;
        while ((match = labelRegex.exec(text)) !== null) {
            // not local labels
            if (!/^([A-Ja-e]|[0-9][0-9])$/.test(match[1])) {
                labels.add(match[1]);
            }
        }

        // wrap global labels as completion items
        return Array.from(labels).map((label: string) => {
            const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Function);

            item.insertText = new vscode.SnippetString(`${label}`);
            item.detail = 'used global labels ...';

            return item;
        });
    }

    private getLocalLabelCompletionItems(
        document: vscode.TextDocument
    ): vscode.CompletionItem[] | undefined {

        const text = document.getText();

        // get local labels
        const labelRegex = /\bLBL\s+([a-eA-J]|[0-9]{2})(\s+|$)/gm;
        const labels = new Set<string>();
        let match;
        while ((match = labelRegex.exec(text)) !== null) {
            labels.add(match[1]);
        }

        // wrap local labels as completion items
        return Array.from(labels).map((label: string) => {
            const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Function);

            item.insertText = new vscode.SnippetString(`${label}`);
            item.detail = 'used local labels ...';

            return item;
        });
    }

    private getVariableCompletionItems(
        document: vscode.TextDocument
    ): vscode.CompletionItem[] | undefined {

        const text = document.getText();

        // get variables
        const variableRegex = /\b(INPUT|RCL|STO)(\+|-|×|÷)?\s+["']([A-Za-z0-9]+)["'](\s+|$)/gm;
        const variables = new Set<string>();
        let match;
        while ((match = variableRegex.exec(text)) !== null) {
            variables.add(match[3]);
        }

        // wrap variables as completion items
        return Array.from(variables).map((variable: string) => {
            const item = new vscode.CompletionItem(variable, vscode.CompletionItemKind.Function);

            item.insertText = new vscode.SnippetString(`${variable}`);
            item.detail = 'used variables ...';

            return item;
        });
    }

    private getRegisterCompletionItems(
        document: vscode.TextDocument
    ): vscode.CompletionItem[] | undefined {

        const text = document.getText();

        // get registers
        const registerRegex = /\b(RCL|STO)(\+|-|×|÷)?\s+(\d+)/gm;
        const registers = new Set<string>();
        let match;
        while ((match = registerRegex.exec(text)) !== null) {
            registers.add(match[3]);
        }

        // wrap registers as completion items
        return Array.from(registers).map((register: string) => {
            const item = new vscode.CompletionItem(register, vscode.CompletionItemKind.Function);

            item.insertText = new vscode.SnippetString(`${register}`);
            item.detail = 'used registers (00-99)...';

            return item;
        });
    }

}
