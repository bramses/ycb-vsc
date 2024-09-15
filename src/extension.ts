import * as vscode from 'vscode';
import axios from 'axios';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "ycb-vsc" is now active!');

    // Register the command for highlighting code
    const highlightDisposable = vscode.commands.registerCommand('ycb-vsc.highlightCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            const language = editor.document.languageId;
            const formattedText = `\`\`\`${language}\n${text}\n\`\`\``;

            const description = await getGPTDescription(formattedText);
            await sendToDescriptionEndpoint(text, formattedText, description, language);
        }
    });

    // Register the command for summarizing code
    const summarizeDisposable = vscode.commands.registerCommand('ycb-vsc.summarizeCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const text = editor.document.getText();
            const summary = await getGPTSummary(text);
			console.log(summary);
            await sendToSummaryEndpoint(summary);
        }
    });

    context.subscriptions.push(highlightDisposable);
    context.subscriptions.push(summarizeDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// Function to get description from GPT
async function getGPTDescription(code: string): Promise<string> {
    const openaiKey = vscode.workspace.getConfiguration('ycb-vsc').get('openaiKey');
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4o",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `Describe the following code in plain English:\n\n${code}` }
        ]
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`,
        }
    });
    return response.data.choices[0].message.content.trim();
}

// Function to get summary from GPT
async function getGPTSummary(code: string): Promise<string> {
    const openaiKey = vscode.workspace.getConfiguration('ycb-vsc').get('openaiKey');
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4o",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `Summarize the following code. Include what it does, what it imports, and what it exports:\n\n${code}` }
        ]
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`,
        }
    });
    return response.data.choices[0].message.content.trim();
}

// Function to send data to the endpoint
async function sendToDescriptionEndpoint(code: string, formattedText: string, description: string, language: string) {
    const ycbKey = vscode.workspace.getConfiguration('ycb-vsc').get('ycbKey');
    const ycbUrl = vscode.workspace.getConfiguration('ycb-vsc').get('ycbUrl');
	const ycbDBPath = vscode.workspace.getConfiguration('ycb-vsc').get('ycbDBPath');
	const editor = vscode.window.activeTextEditor;
    const filePath = editor?.document.uri.fsPath;
    const fileName = editor?.document.fileName;

    await axios.post(`${ycbUrl}/add`, {
        data: `${description}\n\n${formattedText}`,
		metadata: {
			title: fileName,
			author: "file://" + filePath,
            language,
            code
		},
		dbPath: ycbDBPath,
		apiKey: ycbKey,
    });
}

async function sendToSummaryEndpoint(description: string) {
    const ycbKey = vscode.workspace.getConfiguration('ycb-vsc').get('ycbKey');
    const ycbUrl = vscode.workspace.getConfiguration('ycb-vsc').get('ycbUrl');
	const ycbDBPath = vscode.workspace.getConfiguration('ycb-vsc').get('ycbDBPath');
	const editor = vscode.window.activeTextEditor;
    const filePath = editor?.document.uri.fsPath;
    const fileName = editor?.document.fileName;

    await axios.post(`${ycbUrl}/add`, {
        data: `${description}`,
		metadata: {
			title: fileName,
			author: "file://" + filePath,
		},
		dbPath: ycbDBPath,
		apiKey: ycbKey,
    });
}