import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

@Injectable()
export class DocxParserService {
  private readonly logger = new Logger(DocxParserService.name);
  private readonly scriptPath = resolve(__dirname, '../../../..', 'docs', 'docx_parser.py');
  private readonly pythonBin = process.env.PYTHON_BIN || 'python';

  async parseDocx(inputPath: string): Promise<any> {
    const tempOutput = join(tmpdir(), `docx_parse_${randomUUID()}.json`);
    await this.runParser(inputPath, tempOutput);
    const raw = await fs.readFile(tempOutput, 'utf-8');
    await fs.unlink(tempOutput).catch(() => undefined);
    return JSON.parse(raw);
  }

  private runParser(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = ['--input', inputPath, '--output', outputPath];
      const proc = spawn(this.pythonBin, [this.scriptPath, ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stderr = '';
      proc.stderr?.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          const error = stderr || `docx parser exited with code ${code}`;
          this.logger.error(error);
          reject(new Error(error));
        }
      });

      proc.on('error', (err) => {
        this.logger.error('Failed to start docx parser process', err);
        reject(err);
      });
    });
  }
}
