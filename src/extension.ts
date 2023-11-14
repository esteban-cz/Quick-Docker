import * as vscode from "vscode";
import { exec } from "child_process";

// Function to execute a command in the terminal
function executeCommand(command: string) {
  const terminal = vscode.window.createTerminal("Quick Docker Terminal");
  terminal.sendText(command);
  return terminal;
}

export function activate(context: vscode.ExtensionContext) {
  // Function to check if any Docker container is running
  function isAnyContainerRunning() {
    return new Promise<boolean>((resolve, reject) => {
      exec("docker ps --quiet", (err, stdout) => {
        if (err) {
          reject(err);
        } else {
          const running = stdout.trim().length > 0;
          resolve(running);
        }
      });
    });
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("quickDocker.btnPressed", async () => {
      const isRunning = await isAnyContainerRunning();
      const command = isRunning ? "docker-compose down" : "docker-compose up -d --build";
      const action = isRunning ? "Stopping" : "Building and Starting";
      
      vscode.window.showInformationMessage(`${action} your container...`);
      const terminal = executeCommand(command);
    })
  );

  // Check on extension activation
  isAnyContainerRunning().then((isRunning) => {
    const buttonTitle = isRunning ? "Stop Container" : "Build and Start";
    const icon = isRunning ? "$(debug-stop)" : "$(run-all)";

    vscode.commands.executeCommand("setContext", "dockerRunning", isRunning);
    vscode.commands.executeCommand("setContext", "dockerBtnTitle", buttonTitle);
    vscode.commands.executeCommand("setContext", "dockerBtnIcon", icon);
  });
}
export function deactivate() {}
