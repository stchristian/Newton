import type { FileSystemItem } from '../types/file-system'

export class FileSystemService {
  static async readDirectory(path: string): Promise<FileSystemItem[]> {
    try {
      return await window.api.readDirectory(path)
    } catch (error) {
      console.error('Error reading directory:', error)
      throw error
    }
  }

  static async readFile(path: string): Promise<string> {
    try {
      return await window.api.readFile(path)
    } catch (error) {
      console.error('Error reading file:', error)
      throw error
    }
  }

  static async writeFile(path: string, content: string): Promise<void> {
    try {
      await window.api.writeFile(path, content)
    } catch (error) {
      console.error('Error writing file:', error)
      throw error
    }
  }

  static async createFile(directory: string, fileName: string, content: string): Promise<string> {
    try {
      return await window.api.createFile(directory, fileName, content)
    } catch (error) {
      console.error('Error creating file:', error)
      throw error
    }
  }

  static async createFolder(path: string): Promise<void> {
    try {
      await window.api.createFolder(path)
    } catch (error) {
      console.error('Error creating folder:', error)
      throw error
    }
  }

  static async deleteFile(path: string): Promise<void> {
    try {
      await window.api.deleteFile(path)
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  static async openFolder(): Promise<string | null> {
    try {
      return await window.api.openFolder()
    } catch (error) {
      console.error('Error opening folder:', error)
      throw error
    }
  }

  static isMarkdownFile(path: string): boolean {
    return /\.(md|mdx|markdown)$/i.test(path)
  }

  static getFileName(path: string): string {
    return path.split('/').pop() ?? path
  }

  static filterHiddenFiles(items: FileSystemItem[]): FileSystemItem[] {
    return items.filter((item) => !item.name.startsWith('.'))
  }
}
