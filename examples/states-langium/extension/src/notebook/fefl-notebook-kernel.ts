/********************************************************************************
 * Copyright (c) 2024 Genielabs
 ********************************************************************************/
import * as vscode from 'vscode';
import { runInterpreter } from 'fefl-language-server/src/interpreter/interpreter';

export class FeflNotebookKernel {
    readonly id = 'fefl-kernel';
    public readonly label = 'Fefl Kernel';
    readonly supportedLanguages = ['fefl'];

    private _executionOrder = 0;
    private readonly _controller: vscode.NotebookController;

    constructor() {

        this._controller = vscode.notebooks.createNotebookController(this.id,
            'fefl-notebook',
            this.label);

        this._controller.supportedLanguages = this.supportedLanguages;
        this._controller.supportsExecutionOrder = true;
        this._controller.executeHandler = this._executeAll.bind(this);
    }

    dispose(): void {
        this._controller.dispose();
    }

    private async _executeAll(cells: vscode.NotebookCell[], _notebook: vscode.NotebookDocument, _controller: vscode.NotebookController): Promise<void> {
        for (const cell of cells) {
            await this._doExecution(cell);
        }
    }

    private async _doExecution(cell: vscode.NotebookCell): Promise<void> {
        const execution = this._controller.createNotebookCellExecution(cell);

        execution.executionOrder = ++this._executionOrder;
        execution.start(Date.now());

        const text = cell.document.getText();
        let lines = '';
        await execution.clearOutput();

        const log = async (value: unknown) => {
            const stringValue = `${value}`;
            lines += stringValue + '\n';
            await execution.replaceOutput(new vscode.NotebookCellOutput([vscode.NotebookCellOutputItem.text(lines)]));
        };

        try {
            await runInterpreter(text, { log });
            execution.end(true, Date.now());
        } catch (err) {
            const errString = err instanceof Error ? err.message : String(err);
            await execution.appendOutput(new vscode.NotebookCellOutput([vscode.NotebookCellOutputItem.error(new Error(errString))]));
            execution.end(false, Date.now());
        }
    }
}
