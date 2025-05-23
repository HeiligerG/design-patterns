export interface EditorState {
  onInput(editor: TextEditor): void;
  onSave(editor: TextEditor): void;
  onSaveAs(editor: TextEditor): void;
  onNew(editor: TextEditor): void;
  onOpenFile(editor: TextEditor, filename: string): void;
  getDisplayLabel(): string;
}

export class CleanUnsavedState implements EditorState {
  onInput(editor: TextEditor): void {
    editor.setState(new DirtyUnsavedState());
  }

  onSave(editor: TextEditor): void {
    this.onSaveAs(editor);
  }

  onSaveAs(editor: TextEditor): void {
    const filename = this.promptForFilename();
    if (filename) {
      const content = editor.getContent();
      localStorage.setItem(filename, content);
      editor.setState(new CleanSavedState(filename));
      editor.refreshFilesList();
    }
  }

  onNew(editor: TextEditor): void {
    editor.clearContent();
    editor.setState(new CleanUnsavedState());
  }

  onOpenFile(editor: TextEditor, filename: string): void {
    const content = localStorage.getItem(filename) || '';
    editor.setContent(content);
    editor.setState(new CleanSavedState(filename));
  }

  getDisplayLabel(): string {
    return "_";
  }

  private promptForFilename(): string | null {
    let filename = prompt("Enter a File Name", "");
    if (filename && filename.trim() !== "") {
      if (!filename.endsWith(".txt")) {
        filename = filename + ".txt";
      }
      return filename;
    }
    return null;
  }
}

export class CleanSavedState implements EditorState {
  constructor(private filename: string) {}

  onInput(editor: TextEditor): void {
    editor.setState(new DirtySavedState(this.filename));
  }

  onSave(editor: TextEditor): void {
    
  }

  onSaveAs(editor: TextEditor): void {
    const filename = this.promptForFilename();
    if (filename) {
      const content = editor.getContent();
      localStorage.setItem(filename, content);
      editor.setState(new CleanSavedState(filename));
      editor.refreshFilesList();
    }
  }

  onNew(editor: TextEditor): void {
    editor.clearContent();
    editor.setState(new CleanUnsavedState());
  }

  onOpenFile(editor: TextEditor, filename: string): void {
    const content = localStorage.getItem(filename) || '';
    editor.setContent(content);
    editor.setState(new CleanSavedState(filename));
  }

  getDisplayLabel(): string {
    return this.filename;
  }

  private promptForFilename(): string | null {
    let filename = prompt("Enter a File Name", "");
    if (filename && filename.trim() !== "") {
      if (!filename.endsWith(".txt")) {
        filename = filename + ".txt";
      }
      return filename;
    }
    return null;
  }
}

export class DirtyUnsavedState implements EditorState {
  onInput(editor: TextEditor): void {
  }

  onSave(editor: TextEditor): void {
    this.onSaveAs(editor);
  }

  onSaveAs(editor: TextEditor): void {
    const filename = this.promptForFilename();
    if (filename) {
      const content = editor.getContent();
      localStorage.setItem(filename, content);
      editor.setState(new CleanSavedState(filename));
      editor.refreshFilesList();
    }
  }

  onNew(editor: TextEditor): void {
    editor.clearContent();
    editor.setState(new CleanUnsavedState());
  }

  onOpenFile(editor: TextEditor, filename: string): void {
    const content = localStorage.getItem(filename) || '';
    editor.setContent(content);
    editor.setState(new CleanSavedState(filename));
  }

  getDisplayLabel(): string {
    return "*";
  }

  private promptForFilename(): string | null {
    let filename = prompt("Enter a File Name", "");
    if (filename && filename.trim() !== "") {
      if (!filename.endsWith(".txt")) {
        filename = filename + ".txt";
      }
      return filename;
    }
    return null;
  }
}

export class DirtySavedState implements EditorState {
  constructor(private filename: string) {}

  onInput(editor: TextEditor): void {
  }

  onSave(editor: TextEditor): void {
    const content = editor.getContent();
    localStorage.setItem(this.filename, content);
    editor.setState(new CleanSavedState(this.filename));
    editor.refreshFilesList();
  }

  onSaveAs(editor: TextEditor): void {
    const filename = this.promptForFilename();
    if (filename) {
      const content = editor.getContent();
      localStorage.setItem(filename, content);
      editor.setState(new CleanSavedState(filename));
      editor.refreshFilesList();
    }
  }

  onNew(editor: TextEditor): void {
    editor.clearContent();
    editor.setState(new CleanUnsavedState());
  }

  onOpenFile(editor: TextEditor, filename: string): void {
    const content = localStorage.getItem(filename) || '';
    editor.setContent(content);
    editor.setState(new CleanSavedState(filename));
  }

  getDisplayLabel(): string {
    return `${this.filename} *`;
  }

  private promptForFilename(): string | null {
    let filename = prompt("Enter a File Name", "");
    if (filename && filename.trim() !== "") {
      if (!filename.endsWith(".txt")) {
        filename = filename + ".txt";
      }
      return filename;
    }
    return null;
  }
}

export class TextEditor {
  private textArea: HTMLTextAreaElement;
  private state: EditorState;

  constructor() {
    this.textArea = document.getElementById("text") as HTMLTextAreaElement;
    this.state = new CleanUnsavedState();
    this.initializeEventListeners();
  }

  setState(newState: EditorState): void {
    this.state = newState;
    this.updateStateLabel();
  }

  getContent(): string {
    return this.textArea.value;
  }

  setContent(content: string): void {
    this.textArea.value = content;
  }

  clearContent(): void {
    this.textArea.value = "";
  }

  refreshFilesList(): void {
    this.showFiles(this.listFiles(), "files-list");
  }

  private updateStateLabel(): void {
    const stateLabel = document.getElementById("state-label");
    if (stateLabel) {
      stateLabel.innerText = this.state.getDisplayLabel();
    }
  }

  private initializeEventListeners(): void {
    this.textArea.addEventListener("input", () => {
      this.state.onInput(this);
    });

    const saveAsButton = document.getElementById("save-as-button");
    saveAsButton?.addEventListener("click", () => {
      this.state.onSaveAs(this);
    });

    const saveButton = document.getElementById("save-button");
    saveButton?.addEventListener("click", () => {
      this.state.onSave(this);
    });

    const newButton = document.getElementById("new-button");
    newButton?.addEventListener("click", () => {
      this.state.onNew(this);
    });

    document.addEventListener("contextmenu", (event) => {
      alert("Wanna steal my source code, huh!?");
      event.preventDefault();
      return false;
    });
  }

  private showFiles(files: string[], parentId: string): void {
    const parent = document.getElementById(parentId);
    if (!parent) return;

    while (parent.hasChildNodes()) {
      parent.removeChild(parent.firstChild!);
    }

    for (const file of files) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.innerHTML = file;
      item.appendChild(link);
      parent.append(item);
      
      link.addEventListener("click", () => {
        this.state.onOpenFile(this, file);
      });
    }
  }

  private listFiles(): string[] {
    const files: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        files.push(key);
      }
    }
    return files;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const editor = new TextEditor();
  editor.refreshFilesList();
});