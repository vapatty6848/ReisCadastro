import fs from 'fs';
import path from 'path';

export class StorageService {
  private uploadsDir = path.join(process.cwd(), 'uploads');

  /**
   * Deleta uma lista de arquivos do sistema de arquivos
   * @param fileUrls Lista de URLs dos arquivos (ex: /uploads/imagem.jpg)
   */
  async deleteFiles(fileUrls: string[]): Promise<void> {
    fileUrls.forEach(fileUrl => {
      if (!fileUrl) return;

      // Normaliza o caminho: remove /uploads/ do início para pegar apenas o nome do arquivo
      // ou garante que o caminho seja relativo à raiz do projeto
      const relativePath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
      const fullPath = path.join(process.cwd(), relativePath);

      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`[StorageService] Arquivo deletado: ${fullPath}`);
        } catch (error) {
          console.error(`[StorageService] Erro ao deletar ${fullPath}:`, error);
        }
      } else {
        console.warn(`[StorageService] Arquivo não encontrado: ${fullPath}`);
      }
    });
  }

  /**
   * Resolve o caminho público para um arquivo salvo
   */
  getPublicUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  /**
   * Formata os arquivos recebidos pelo Multer para o formato de URL esperado
   */
  formatMulterFiles(multerFiles: Express.Multer.File[] = []): string[] {
    return multerFiles.map(file => this.getPublicUrl(file.filename));
  }
}
