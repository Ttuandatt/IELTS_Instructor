import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class ContentVersionService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: {
    entityId: string;
    entityType: 'passage' | 'prompt';
    action: 'create' | 'update' | 'publish' | 'unpublish' | 'delete';
    editorId: string;
    changes?: Record<string, any>;
  }) {
    // Get next version number for this entity
    const lastVersion = await this.prisma.contentVersion.findFirst({
      where: { entity_id: params.entityId, entity_type: params.entityType },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const version = (lastVersion?.version ?? 0) + 1;

    return this.prisma.contentVersion.create({
      data: {
        entity_id: params.entityId,
        entity_type: params.entityType,
        action: params.action,
        editor_id: params.editorId,
        version,
        changes: params.changes,
      },
    });
  }

  async getHistory(entityType: string, entityId: string) {
    return this.prisma.contentVersion.findMany({
      where: { entity_id: entityId, entity_type: entityType },
      include: { editor: { select: { id: true, display_name: true } } },
      orderBy: { version: 'desc' },
    });
  }
}
