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
	 * Moves the cursor to either end of the current word
	 * 
	 * 
	 */
	let cursorToWordExtremesDisposable = vscode.commands.registerCommand('myt.moveCursorToWordExtremes', (args) => {
		const isForward = args.isForward ?? false;
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		const positionDifference = (a: vscode.Position, b: vscode.Position) => {
			return { line: a.line - b.line, character: a.character - b.character };
		};

		editor.selections = editor.selections.map(
			(prev) => {
				if (vscode.window.activeTextEditor) {
					const wordRange = vscode.window.activeTextEditor.document.getWordRangeAtPosition(prev.active);
					if (wordRange) {
						const anchorEndVal = positionDifference(wordRange.end, prev.anchor);
						const anchorStartVal = positionDifference(wordRange.start, prev.anchor);
						const activeEndVal = positionDifference(wordRange.end, prev.active);
						const activeStartVal = positionDifference(wordRange.start, prev.active);
						return new vscode.Selection(
							prev.anchor.isEqual(prev.active)
								? prev.anchor.translate(
									(isForward ? anchorEndVal : anchorStartVal).line,
									(isForward ? anchorEndVal : anchorStartVal).character
								) : prev.anchor,
							prev.active.translate(
								(isForward ? activeEndVal : activeStartVal).line,
								(isForward ? activeEndVal : activeStartVal).character
							)
						);
					}
				}
				return prev;
			}
		);
	});

	/**
	 * These subscriptions will be cleared automatically by vscode
	 * when the extension is deactivated
	 */
	context.subscriptions.push(moveCursorDisposable);
	context.subscriptions.push(cursorToWordExtremesDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
