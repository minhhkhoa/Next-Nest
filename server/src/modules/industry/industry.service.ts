import { Injectable } from '@nestjs/common';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';
import { TranslationService } from 'src/common/translation/translation.service';
import { InjectModel } from '@nestjs/mongoose';
import { Industry, IndustryDocument } from './schemas/industry.schema';
import mongoose from 'mongoose';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IndustryService {
  constructor(
    private configService: ConfigService,
    private readonly translationService: TranslationService,
    @InjectModel(Industry.name)
    private indusTryModel: SoftDeleteModel<IndustryDocument>,
  ) {}
  async create(createIndustryDto: CreateIndustryDto) {
    try {
      const dataLang = await this.translationService.translateModuleData(
        'industry',
        createIndustryDto,
      );

      //- quy ước các danh mục root thì có parentId: ROOT_PARENT_INDUSTRY_ID(.env)

      const industry = await this.indusTryModel.create(dataLang);

      return {
        _id: industry._id,
        name: industry.name.en,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAll(currentPage: number, limit: number, query: string) {
    const { filter, sort, population } = aqp(query);

    if (query) {
      delete filter[query]; //- log filter ra để check các điều kiện nào không hợp lệ
      const searchRegex = new RegExp(query, 'i'); //- 'i' để không phân biệt hoa thường
      filter.$or = [
        { 'name.vi': { $regex: searchRegex } },
        { 'name.en': { $regex: searchRegex } },
      ];
    }

    const defaultPage = currentPage > 0 ? +currentPage : 1;
    let offset = (+defaultPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.indusTryModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.indusTryModel
      .find(filter) //- nó tự động bỏ document có isDeleted: true.
      .skip(offset)
      .limit(defaultLimit)
      .sort('-createdAt')
      .populate(population)
      .exec();

    return {
      meta: {
        current: defaultPage,
        pageSize: limit,
        totalPages: totalPages,
        totalItems: totalItems,
      },
      result,
    };
  }

  //- start build tree
  // Lấy toàn bộ cây - giữ nguyên parentId gốc, thêm isParent
  async getTreeIndustry(): Promise<any[]> {
    const ROOT_ID = this.configService.get<string>('ROOT_PARENT_INDUSTRY_ID');

    const industries = await this.indusTryModel
      .find({ isDeleted: false })
      .select('name parentId createdAt updatedAt')
      .lean();

    const industryMap = new Map<string, any>();
    const roots: any[] = [];

    // Tạo node, giữ nguyên parentId thật
    industries.forEach((doc) => {
      const item = {
        _id: doc._id.toString(),
        name: doc.name,
        parentId: doc.parentId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        children: [] as any[],
        isParent: false,
      };

      industryMap.set(item._id, item);

      // Node là root nếu parentId === ROOT_ID
      if (doc.parentId === ROOT_ID) {
        roots.push(item);
      }
    });

    // Gắn con vào cha + đánh dấu isParent
    industries.forEach((doc) => {
      if (doc.parentId !== ROOT_ID) {
        const parent = industryMap.get(doc.parentId);
        if (parent) {
          const childItem = industryMap.get(doc._id.toString());
          parent.children.push(childItem);
          parent.isParent = true;
        }
      }
    });

    // Sắp xếp children theo tên tiếng Việt
    const sortChildren = (node: any) => {
      node.children.sort((a: any, b: any) =>
        a.name.vi.localeCompare(b.name.vi),
      );
      node.children.forEach(sortChildren);
    };
    roots.forEach(sortChildren);

    return roots;
  }

  // 2. Tìm kiếm thông minh: trả về cây đầy đủ nếu khớp cha hoặc con
  async searchIndustryTree(query: string): Promise<any[]> {
    //- ko co query thì tìm kiếm bình thường
    if (!query?.trim()) {
      return this.getTreeIndustry();
    }

    const ROOT_ID =
      this.configService.get<string>('ROOT_PARENT_INDUSTRY_ID');
    const searchRegex = new RegExp(query.trim(), 'i');

    // Bước 1: Tìm tất cả các ngành có tên khớp (vi hoặc en)
    const matchedDocs = await this.indusTryModel
      .find({
        isDeleted: false,
        $or: [{ 'name.vi': searchRegex }, { 'name.en': searchRegex }],
      })
      .lean();

    if (matchedDocs.length === 0) return [];

    // Bước 2: Với mỗi ngành khớp → tìm cha trực tiếp → lấy TOÀN BỘ cây con của cha đó
    const rootParentIds = new Set<string>(); // các cha (root) cần hiển thị toàn bộ

    for (const doc of matchedDocs) {
      let currentId = doc.parentId;

      // Nếu chính nó là root → thêm luôn
      if (currentId === ROOT_ID) {
        rootParentIds.add(doc._id.toString());
        continue;
      }

      // Lên đến cha trực tiếp (cấp 1)
      while (currentId && currentId !== ROOT_ID) {
        const parent = await this.indusTryModel.findById(currentId).lean();
        if (!parent) break;

        // Nếu cha này là root → đánh dấu cần hiện toàn bộ cây của nó
        if (parent.parentId === ROOT_ID) {
          rootParentIds.add(parent._id.toString());
          break;
        }

        currentId = parent.parentId;
      }
    }

    // Bước 3: Lấy TOÀN BỘ con cháu của các rootParentIds này
    const finalIds = new Set<string>();

    const collectAllDescendants = async (parentId: string) => {
      const children = await this.indusTryModel
        .find({
          parentId,
          isDeleted: false,
        })
        .lean();

      for (const child of children) {
        const childId = child._id.toString();
        if (!finalIds.has(childId)) {
          finalIds.add(childId);
          await collectAllDescendants(childId);
        }
      }
    };

    // Thêm chính các root parent + tất cả con cháu của chúng
    for (const rootId of rootParentIds) {
      finalIds.add(rootId);
      await collectAllDescendants(rootId);
    }

    // Bước 4: Lấy dữ liệu + build cây
    const allDocs = await this.indusTryModel
      .find({
        _id: {
          $in: Array.from(finalIds).map(
            (id) => new mongoose.Types.ObjectId(id),
          ),
        },
        isDeleted: false,
      })
      .select('name parentId createdAt updatedAt')
      .lean();

    const map = new Map<string, any>();
    const resultRoots: any[] = [];

    // Tạo node
    allDocs.forEach((doc) => {
      const item = {
        _id: doc._id.toString(),
        name: doc.name,
        parentId: doc.parentId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        children: [],
        isParent: false,
      };
      map.set(item._id, item);

      // Chỉ thêm vào resultRoots nếu là root (parentId === ROOT_ID)
      if (doc.parentId === ROOT_ID) {
        resultRoots.push(item);
      }
    });

    // Gắn con + đánh dấu isParent
    allDocs.forEach((doc) => {
      if (doc.parentId !== ROOT_ID) {
        const parent = map.get(doc.parentId);
        if (parent) {
          const child = map.get(doc._id.toString());
          parent.children.push(child);
          parent.isParent = true;
        }
      }
    });

    // Sắp xếp
    const sortChildren = (node: any) => {
      node.children.sort((a: any, b: any) =>
        a.name.vi.localeCompare(b.name.vi),
      );
      node.children.forEach(sortChildren);
    };
    resultRoots.forEach(sortChildren);

    return resultRoots;
  }
  //- end build tree

  async findOne(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID industry không đúng định dạng', !!id);
      }

      const industry = await this.indusTryModel.findById(id);

      if (!industry)
        throw new BadRequestCustom('ID industry không tìm thấy', !!id);

      if (industry?.isDeleted) {
        throw new BadRequestCustom(
          'Industry này hiện đã bị xóa',
          !!industry?.isDeleted,
        );
      }

      return industry;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(id: string, updateIndustryDto: UpdateIndustryDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID industry không đúng định dạng', !!id);
      }

      const industry = await this.indusTryModel.findById(id);
      if (!industry)
        throw new BadRequestCustom('ID industry không tìm thấy', !!id);

      //- cần translation trước đã
      const dataTranslation = await this.translationService.translateModuleData(
        'industry',
        updateIndustryDto,
      );
      const filter = { _id: id };
      const update = { $set: dataTranslation };

      const result = await this.indusTryModel.updateOne(filter, update);

      if (result.modifiedCount === 0)
        throw new BadRequestCustom('Lỗi sửa industry', !!id);
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID industry không đúng định dạng', !!id);
      }

      const industry = await this.indusTryModel.findById(id);
      if (!industry)
        throw new BadRequestCustom('ID industry không tìm thấy', !!id);

      const isDeleted = industry.isDeleted;

      if (isDeleted)
        throw new BadRequestCustom('Industry này đã được xóa', !!isDeleted);

      //- check xem industry này có con hay không, nếu có thì không cho xóa
      const industryId = industry._id.toString();

      const childIndustry = await this.indusTryModel.findOne({
        parentId: industryId,
      });
      if (childIndustry)
        throw new BadRequestCustom('Chưa thể xóa root industry', !!id);

      const filter = { _id: id };
      const result = this.indusTryModel.softDelete(filter);

      if (!result) throw new BadRequestCustom('Lỗi xóa industry', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
