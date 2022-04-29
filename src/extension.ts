import * as vscode from 'vscode';

/**
 * This method is called when the extension is activated
 * It is activated the very first time the command is executed 
 */
export function activate(context: vscode.ExtensionContext) {
	/**
	 * All custom commands of the extension has to be defined in
	 * package.json
	 */

	/**
	 * Moves the cursor, a specific line and character count from the
	 * current position
	 * 
	 * Remember that cursor position changes are relative to the current
	 * position of the cursor
	 */
	let moveCursorDisposable = vscode.commands.registerCommand('myt.moveCursor', (args) => {
		/**
		 * `line` is the number of lines to move. This can be positive or negative
		 * `char` is the number of characters to move. This can also be positive or negative
		 * `isAnchor` means whether to move the start of the active selection
		 * `isActive` means whether to move the active part of the selection, the end,
		 *   however the active position can come before anchor
		 */
		const line = (args.line ?? 0) as number;
		const char = (args.char ?? 0) as number;
		const isAnchor = (args.isAnchor ?? true) as boolean;
		const isActive = (args.isActive ?? true) as boolean;
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return null;
		}
		const createPosition = (pos: vscode.Position): vscode.Position => {
			const newLineValue = pos.line + line;
			const newCharValue = pos.character + char;
			/**
			 * If the new calculated value for line position is less
			 * than zero, then the new position will be zero.
			 * 
			 * The same applies for the character position too.
			 */
			const candidate = pos.translate(
				(newLineValue < 0) ? -newLineValue : line,
				(newCharValue < 0) ? -newCharValue : char
			);
			/** This provides the adjusted position that is verified to be valid by vscode */
			return editor.document.validatePosition(candidate);
		};
		editor.selections = editor.selections.map(
			(prev) => new vscode.Selection(
				/** This moves the position of the beginning of the selection */
				isAnchor ? createPosition(prev.anchor) : prev.anchor,
				/** This moves the position of the end of the selection */
				isActive ? createPosition(prev.active) : prev.active
			)
		);
	});

	/**
	 * These subscriptions will be cleared automatically by vscode
	 * when the extension is deactivated
	 */
	context.subscriptions.push(moveCursorDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
