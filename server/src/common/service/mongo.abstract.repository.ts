import {
  ClientSession,
  Document,
  FilterQuery,
  ProjectionType,
  QueryOptions,
  Types,
  UpdateQuery,
} from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

export type RepositoryQueryOptions<T extends Document> = QueryOptions<T> & {
  projection?: string | ProjectionType<T>;
};

export type RepositoryRawOptions<T extends Document> = {
  projection?: string | ProjectionType<T>;
  sort?: Record<string, 1 | -1> | string;
  skip?: number;
  limit?: number;
  populate?: any;
  lean?: boolean;
  session?: ClientSession;
  includeDeleted?: boolean;
};

export type ConditionQuery<T extends Document> = {
  filter?: FilterQuery<T>;
  options?: RepositoryQueryOptions<T>;
  includeDeleted?: boolean;
};

export class MongoAbstractRepository<T extends Document> {
  public readonly name: string;

  constructor(
    public readonly entity: Function,
    protected readonly model: SoftDeleteModel<T>,
  ) {
    this.name = entity?.name?.toLowerCase?.() || 'entity';
  }

  async create(
    dto: Partial<T> | Record<string, any>,
    session?: ClientSession,
  ): Promise<T> {
    if (session) {
      const created = await this.model.create([dto], { session });
      return created[0] as T;
    }

    return (await this.model.create(dto)) as T;
  }

  async findOne(condition?: ConditionQuery<T>): Promise<T | null> {
    const normalized = this.normalizeCondition(condition);
    const { projection, ...queryOptions } = normalized.options;

    return this.model
      .findOne(normalized.filter, projection, queryOptions)
      .lean<T>()
      .exec();
  }

  async find(condition?: ConditionQuery<T>): Promise<T[]> {
    const normalized = this.normalizeCondition(condition);
    const { projection, ...queryOptions } = normalized.options;

    return this.model
      .find(normalized.filter, projection, queryOptions)
      .lean<T[]>()
      .exec();
  }

  async findById(
    id: string | Types.ObjectId,
    projection?: string | ProjectionType<T>,
    options?: QueryOptions<T>,
    includeDeleted = false,
  ): Promise<T | null> {
    let filter = { _id: id } as FilterQuery<T>;
    if (!includeDeleted) {
      filter = this.appendNotDeletedFilter(filter);
    }

    return this.model.findOne(filter, projection, options).lean<T>().exec();
  }

  async updateMany(
    conditions: FilterQuery<T>,
    dto: UpdateQuery<T>,
    options?: QueryOptions<T>,
    session?: ClientSession,
  ): Promise<any> {
    return this.model
      .updateMany(conditions, dto, { ...options, session })
      .exec();
  }

  async softDelete(
    filter: FilterQuery<T>,
    session?: ClientSession,
  ): Promise<boolean> {
    const result = await this.model.softDelete(filter || {}, {
      session,
    } as QueryOptions<T>);

    const deletedCount =
      (result as { deleted?: number })?.deleted ||
      (result as { modifiedCount?: number })?.modifiedCount ||
      (result as { deletedCount?: number })?.deletedCount ||
      0;

    return deletedCount > 0;
  }

  async softDeleteById(
    id: string | Types.ObjectId,
    session?: ClientSession,
  ): Promise<boolean> {
    return this.softDelete({ _id: id } as FilterQuery<T>, session);
  }

  async startSession(): Promise<ClientSession> {
    return this.model.startSession();
  }

  async countDocumentsRaw(
    filter: FilterQuery<T> = {} as FilterQuery<T>,
    includeDeleted = true,
  ): Promise<number> {
    const finalFilter = includeDeleted
      ? filter
      : this.appendNotDeletedFilter(filter);

    return this.model.countDocuments(finalFilter).exec();
  }

  async findRaw(
    filter: FilterQuery<T> = {} as FilterQuery<T>,
    options: RepositoryRawOptions<T> = {},
  ): Promise<any[]> {
    const finalFilter = options.includeDeleted
      ? filter
      : this.appendNotDeletedFilter(filter);

    let query: any = this.model.find(finalFilter, options.projection);

    if (options.sort) query = query.sort(options.sort);
    if (typeof options.skip === 'number') query = query.skip(options.skip);
    if (typeof options.limit === 'number') query = query.limit(options.limit);
    if (options.populate) query = query.populate(options.populate);
    if (options.session) query = query.session(options.session);
    if (options.lean) query = query.lean();

    return query.exec();
  }

  async findOneRaw(
    filter: FilterQuery<T> = {} as FilterQuery<T>,
    options: RepositoryRawOptions<T> = {},
  ): Promise<any | null> {
    const finalFilter = options.includeDeleted
      ? filter
      : this.appendNotDeletedFilter(filter);

    let query: any = this.model.findOne(finalFilter, options.projection);

    if (options.sort) query = query.sort(options.sort);
    if (options.populate) query = query.populate(options.populate);
    if (options.session) query = query.session(options.session);
    if (options.lean) query = query.lean();

    return query.exec();
  }

  async findByIdRaw(
    id?: string | Types.ObjectId,
    options: RepositoryRawOptions<T> = {},
  ): Promise<any | null> {
    if (!id) return null;
    return this.findOneRaw({ _id: id } as FilterQuery<T>, options);
  }

  async findOneAndUpdateRaw(
    filter: FilterQuery<T>,
    dto: UpdateQuery<T>,
    options: QueryOptions<T> = {},
  ): Promise<any | null> {
    return this.model.findOneAndUpdate(filter, dto, options).exec();
  }

  async updateOneRaw(
    filter: FilterQuery<T>,
    dto: UpdateQuery<T>,
    options: QueryOptions<T> = {},
  ): Promise<any> {
    return this.model.updateOne(filter, dto, options).exec();
  }

  async updateManyRaw(
    filter: FilterQuery<T>,
    dto: UpdateQuery<T>,
    options: QueryOptions<T> = {},
  ): Promise<any> {
    return this.model.updateMany(filter, dto, options).exec();
  }

  async aggregateRaw<R = any>(pipeline: any[]): Promise<R[]> {
    return this.model.aggregate(pipeline).exec();
  }

  async deleteOneRaw(
    filter: FilterQuery<T>,
    options: QueryOptions<T> = {},
  ): Promise<any> {
    return this.model.deleteOne(filter, options).exec();
  }

  async deleteManyRaw(
    filter: FilterQuery<T>,
    options: QueryOptions<T> = {},
  ): Promise<any> {
    return this.model.deleteMany(filter, options).exec();
  }

  //- func build condition để tự thêm isDeleted: false nếu không truyền includeDeleted = true.
  private normalizeCondition(
    condition?: ConditionQuery<T>,
  ): Required<Pick<ConditionQuery<T>, 'filter' | 'options'>> {
    const filter = (condition?.filter || {}) as FilterQuery<T>;
    const options = (condition?.options || {}) as RepositoryQueryOptions<T>;

    return {
      filter: condition?.includeDeleted
        ? filter
        : this.appendNotDeletedFilter(filter),
      options,
    };
  }

  private appendNotDeletedFilter(filter: FilterQuery<T>): FilterQuery<T> {
    const hasIsDeleted = Object.prototype.hasOwnProperty.call(
      filter,
      'isDeleted',
    );
    const hasDeletedAt = Object.prototype.hasOwnProperty.call(
      filter,
      'deletedAt',
    );
    const hasDeletedAtSnake = Object.prototype.hasOwnProperty.call(
      filter,
      'deleted_at',
    );

    if (hasIsDeleted || hasDeletedAt || hasDeletedAtSnake) {
      return filter;
    }

    return {
      ...filter,
      isDeleted: false,
    } as FilterQuery<T>;
  }
}
