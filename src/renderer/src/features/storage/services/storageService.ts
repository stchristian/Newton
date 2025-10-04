import type { FileSystemItem } from '../../../../../preload/types'

export class StorageService {
  static async readDirectory(path: string): Promise<FileSystemItem[]> {
    try {
      return await window.fileSystem.readDirectory(path)
    } catch (error) {
      console.error('Error reading directory:', error)
      throw error
    }
  }

  static async readFile(path: string): Promise<string> {
    try {
      return await window.fileSystem.readFile(path)
    } catch (error) {
      console.error('Error reading file:', error)
      throw error
    }
  }

  static async writeFile(path: string, content: string): Promise<void> {
    try {
      await window.fileSystem.writeFile(path, content)
    } catch (error) {
      console.error('Error writing file:', error)
      throw error
    }
  }

  static async createFile(directory: string, fileName: string, content: string): Promise<string> {
    try {
      return await window.fileSystem.createFile(directory, fileName, content)
    } catch (error) {
      console.error('Error creating file:', error)
      throw error
    }
  }

  static async createFolder(path: string): Promise<void> {
    try {
      await window.fileSystem.createFolder(path)
    } catch (error) {
      console.error('Error creating folder:', error)
      throw error
    }
  }

  static async deleteFile(path: string): Promise<void> {
    try {
      await window.fileSystem.deleteFile(path)
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  static async openFolder(): Promise<string | null> {
    try {
      return await window.fileSystem.openFolder()
    } catch (error) {
      console.error('Error opening folder:', error)
      throw error
    }
  }

  static async renameFile(path: string, newPath: string): Promise<void> {
    try {
      await window.fileSystem.renameFile(path, newPath)
    } catch (error) {
      console.error('Error renaming file:', error)
      throw error
    }
  }

  static async deleteRecursively(path: string): Promise<void> {
    try {
      await window.fileSystem.deleteRecursively(path)
    } catch (error) {
      console.error('Error deleting recursively:', error)
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
