import { dialog, app } from 'electron'
import { copyFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'

export const DocumentService = {
  async uploadDocument(): Promise<string> {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'jpg', 'png'] }
      ]
    })
    if (result.canceled || !result.filePaths.length) return ''

    const srcPath = result.filePaths[0]
    const docsDir = join(app.getPath('userData'), 'documents')
    await mkdir(docsDir, { recursive: true })

    const ext = extname(srcPath)
    const filename = `contract_${Date.now()}${ext}`
    const destPath = join(docsDir, filename)
    await copyFile(srcPath, destPath)

    return destPath
  }
}
