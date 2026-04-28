import { randomUUID } from 'node:crypto';

export type EntityWithId = {
  id: string;
};

export type CreateEntityInput<T extends EntityWithId> = Omit<T, 'id'> & {
  id?: string;
};

export class InMemoryRepository<T extends EntityWithId> {
  private readonly items = new Map<string, T>();

  constructor(seed: T[] = []) {
    seed.forEach((item) => {
      this.items.set(item.id, item);
    });
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.items.values());
  }

  async findById(id: string): Promise<T | null> {
    return this.items.get(id) ?? null;
  }

  async create(data: CreateEntityInput<T>): Promise<T> {
    const id = data.id ?? randomUUID();
    const entity = {
      ...data,
      id,
    } as T;

    this.items.set(id, entity);
    return entity;
  }

  async update(id: string, patch: Partial<Omit<T, 'id'>>): Promise<T | null> {
    const existing = this.items.get(id);

    if (!existing) {
      return null;
    }

    const updated = {
      ...existing,
      ...patch,
      id,
    } as T;

    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
}
