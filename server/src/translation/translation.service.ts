import { Injectable, Logger } from '@nestjs/common';
import { translate } from '@vitalets/google-translate-api';
import { translationConfig } from './translation.config';
import * as cheerio from 'cheerio';
import { decode } from 'html-entities';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  /**
   * Dịch text thuần sang ngôn ngữ target
   * @param text Nội dung cần dịch
   * @param to Ngôn ngữ đích (default: 'en')
   * @param from Ngôn ngữ gốc (default: 'vi')
   */
  async translateText(text: string, to = 'en', from = 'vi'): Promise<string> {
    try {
      const res = await translate(text, { to, from });
      return res.text;
    } catch (err) {
      this.logger.error(`Translation failed: ${err.message}`);
      return text; //- Fallback giữ nguyên nếu lỗi
    }
  }

  /**
   * Dịch HTML giữ nguyên cấu trúc
   * @param html Nội dung HTML cần dịch
   * @param to Ngôn ngữ đích
   * @param from Ngôn ngữ gốc
   */
  async translateHTML(html: string, to = 'en', from = 'vi'): Promise<string> {
    if (!html) return '';

    //- Load HTML với xmlMode: false để xử lý fragments an toàn
    const $ = cheerio.load(html, { xmlMode: false, decodeEntities: false });

    //- Các thẻ không cần dịch text bên trong
    const ignoreTags = ['script', 'style', 'code'];

    //- Hàm đệ quy duyệt và dịch text nodes
    const traverseAndTranslate = async (node: cheerio.Element) => {
      //- Bỏ qua nếu node nằm trong thẻ không cần dịch
      if (node.type === 'tag' && ignoreTags.includes(node.name)) {
        return;
      }

      //- Dịch text node nếu có nội dung
      if (node.type === 'text' && node.data?.trim()) {
        const decodedText = decode(node.data);
        if (decodedText.trim()) {
          try {
            const translated = await this.translateText(decodedText, to, from);
            node.data = translated; //- Gán lại text đã dịch
          } catch (error) {
            this.logger.error(
              `Lỗi dịch text trong HTML: ${decodedText}`,
              error,
            );
          }
        }
      }

      //- Chỉ duyệt children nếu node là tag
      if (node.type === 'tag' && node.children) {
        for (const child of node.children) {
          await traverseAndTranslate(child);
        }
      }
    };

    //- Dịch attributes (như alt, title)
    const translateAttributes = async () => {
      const attributesToTranslate = ['alt', 'title'];
      const elements = $(`[${attributesToTranslate.join('],[')}]`).toArray();

      for (const elem of elements) {
        for (const attr of attributesToTranslate) {
          const value = $(elem).attr(attr);
          if (value?.trim()) {
            const decodedValue = decode(value);
            try {
              const translated = await this.translateText(
                decodedValue,
                to,
                from,
              );
              $(elem).attr(attr, translated);
            } catch (error) {
              this.logger.error(
                `Lỗi dịch attribute ${attr}: ${decodedValue}`,
                error,
              );
            }
          }
        }
      }
    };

    //- Dịch text nodes trước, rồi attributes
    await traverseAndTranslate($('body')[0]);
    await translateAttributes();

    //- Trả về HTML fragment
    return $('body').html() || '';
  }

  /**
   * Dịch dữ liệu module
   * @param module Tên module (e.g., 'jobs')
   * @param data Object data (DTO)
   */
  async translateModuleData<T extends Record<string, any>>(
    module: keyof typeof translationConfig,
    data: T,
  ): Promise<T> {
    const fieldsToTranslate = translationConfig[module];
    const result: any = { ...data };

    //- lặp qua field cần dịch
    for (const field of fieldsToTranslate) {
      if (data[field]) {
        const vi = data[field];
        let en: string;

        //- Kiểm tra xem có phải HTML không
        const isHTML = /<[^>]+>/.test(vi) || /&[a-zA-Z0-9#]+;/.test(vi);

        if (isHTML) {
          //- bắt đầu dịch với html
          en = await this.translateHTML(vi, 'en', 'vi');
        } else {
          //- bắt đầu dịch với văn bản thường
          en = await this.translateText(vi, 'en', 'vi');
        }

        result[field] = { vi, en };
      }
    }

    return result;
  }
}
