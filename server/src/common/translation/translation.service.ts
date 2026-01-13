import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { translationConfig } from './translation.config';
import * as cheerio from 'cheerio';
import { decode } from 'html-entities';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  private readonly libreTranslateUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.libreTranslateUrl =
      this.configService.get<string>('LIBRETRANSLATE_URL') as string;

    this.logger.log(`LibreTranslate URL: ${this.libreTranslateUrl}`);
  }

  /**
   * Gọi API LibreTranslate
   * Chỉ cần dịch từ vi -> en
   */
  private async callLibreTranslate(
    text: string,
    from = 'vi',
    to = 'en',
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.libreTranslateUrl}/translate`,
        {
          q: text,
          source: from,
          target: to,
          format: 'text',
        },
        {
          timeout: 10000,
        },
      );

      return response.data.translatedText || text;
    } catch (err: any) {
      this.logger.error(`LibreTranslate error: ${err.message}`);
      if (err.response?.data?.error) {
        this.logger.error(`LibreTranslate server: ${err.response.data.error}`);
      }
      return text; //- Fallback: giữ nguyên
    }
  }

  /**
   * Dịch text thuần
   */
  async translateText(text: string, to = 'en', from = 'vi'): Promise<string> {
    if (!text.trim()) return text;
    return this.callLibreTranslate(text, from, to);
  }

  /**
   * Dịch HTML – giữ cấu trúc, dịch từng đoạn nhỏ
   */
  async translateHTML(html: string, to = 'en', from = 'vi'): Promise<string> {
    if (!html) return '';

    const $ = cheerio.load(html, { xmlMode: false, decodeEntities: false });
    const ignoreTags = ['script', 'style', 'code', 'pre'];

    //- Hàm dịch từng đoạn text nhỏ (tránh lỗi Stanza với dấu "-")
    const translateNodeText = async (node: cheerio.Element) => {
      if (node.type === 'tag' && ignoreTags.includes(node.name)) return;

      if (node.type === 'text' && node.data?.trim()) {
        let rawText = decode(node.data);

        //- Tách thành các câu nhỏ để tránh lỗi Stanza
        const sentences = rawText.split(/(?<=[.!?])\s+/);
        let translated = '';

        for (const sentence of sentences) {
          if (sentence.trim()) {
            const cleaned = sentence
              .replace(/-\s+/g, ' ') //- Thay "- " bằng khoảng trắng
              .replace(/\s+/g, ' ')
              .trim();
            if (cleaned) {
              translated += (await this.translateText(cleaned, to, from)) + ' ';
            } else {
              translated += sentence + ' ';
            }
          } else {
            translated += sentence;
          }
        }

        node.data = translated.trim();
      }

      if (node.type === 'tag' && node.children) {
        for (const child of node.children) {
          await translateNodeText(child);
        }
      }
    };

    //- Dịch text nodes
    await translateNodeText($('body')[0]);

    //- Dịch attributes
    const attributesToTranslate = ['alt', 'title', 'placeholder'];
    for (const attr of attributesToTranslate) {
      $(`[${attr}]`).each((_, elem) => {
        const value = $(elem).attr(attr);
        if (value?.trim()) {
          const decoded = decode(value);
          //- Dịch từng phần nhỏ
          const translated = decoded.split(/(?<=[.!?])\s+/).map(async (s) => {
            const cleaned = s.replace(/-\s+/g, ' ').trim();
            return cleaned ? await this.translateText(cleaned, to, from) : s;
          });
          Promise.all(translated).then((parts) => {
            $(elem).attr(attr, parts.join(' '));
          });
        }
      });
    }

    return $('body').html() || '';
  }

  /**
   * Dịch dữ liệu module (giữ nguyên cấu trúc)
   */
  async translateModuleData<T extends Record<string, any>>(
    module: keyof typeof translationConfig,
    data: T,
  ): Promise<T> {
    const fieldsToTranslate = translationConfig[module];
    const result: any = { ...data };

    for (const field of fieldsToTranslate) {
      if (data[field]) {
        const vi = data[field];
        let en: string;

        const isHTML = /<[^>]+>/.test(vi) || /&[a-zA-Z0-9#]+;/.test(vi);

        if (isHTML) {
          en = await this.translateHTML(vi, 'en', 'vi');
        } else {
          en = await this.translateText(vi, 'en', 'vi');
        }

        result[field] = { vi, en };
      }
    }

    return result;
  }
}
