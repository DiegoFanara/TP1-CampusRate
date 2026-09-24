import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Place } from '../places/entities/place.entity';
import { Review } from '../reviews/entities/review.entity';

interface DbShape {
  places: Place[];
  reviews: Review[];
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly filePath = path.join(process.cwd(), 'data', 'db.json');

  async onModuleInit(): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await this.write({ places: [], reviews: [] });
    }
  }

  async read(): Promise<DbShape> {
    const texte = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(texte) as DbShape;
  }

  async write(data: DbShape): Promise<void> {
    const texte = JSON.stringify(data, null, 2);
    await fs.writeFile(this.filePath, texte);
  }
}