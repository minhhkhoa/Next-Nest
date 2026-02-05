import { Injectable, Logger } from '@nestjs/common';
import { translationConfig } from './translation.config';
import * as cheerio from 'cheerio';
import { decode } from 'html-entities';
import { translate } from 'google-translate-api-x';
import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  /**
   * CẤU HÌNH PROXY THỦ CÔNG:
   * Khi bị Google chặn (Lỗi 429), Khoa điền URL proxy vào đây.
   * Định dạng: 'http://user:pass@ip:port' hoặc 'http://ip:port'
   * Nếu không dùng, hãy để là null.
   */
  private readonly PROXY_URL = null;

  /**
   * Hàm lấy cấu hình dịch thuật linh hoạt
   */
  private getTranslateOptions() {
    const options: any = {
      forceBatch: true, // Ưu tiên Batch để an toàn hơn
      autoCorrect: true, // Tự động sửa lỗi chính tả
      client: 'gtx', // Dùng client gtx để ổn định, tránh 403
    };

    // Nếu Khoa điền PROXY_URL, nó sẽ tự động kích hoạt Agent
    if (this.PROXY_URL) {
      this.logger.warn(`Đang sử dụng PROXY để dịch: ${this.PROXY_URL}`);
      options.requestOptions = {
        agent: new HttpsProxyAgent(this.PROXY_URL),
      };
    }

    return options;
  }

  /**
   * Dịch HTML – Giữ cấu trúc, dịch theo lô (Batch)
   */
  async translateHTML(html: string, to = 'en', from = 'vi'): Promise<string> {
    if (!html) return '';

    const $ = cheerio.load(html, { xmlMode: false, decodeEntities: false });
    const ignoreTags = ['script', 'style', 'code', 'pre'];

    const textNodes: any[] = [];
    const textsToTranslate: string[] = [];

    const collectNodes = (node: any) => {
      if (node.type === 'tag' && ignoreTags.includes(node.name)) return;
      if (node.type === 'text' && node.data?.trim()) {
        const cleaned = decode(node.data).trim();
        if (cleaned) {
          textNodes.push(node);
          textsToTranslate.push(cleaned);
        }
      }
      if (node.children) {
        for (const child of node.children) collectNodes(child);
      }
    };

    collectNodes($('body')[0]);
    if (textsToTranslate.length === 0) return html;

    try {
      // Chia nhỏ mảng nếu tổng ký tự > 4500 để không quá giới hạn 5000 của Google
      const results = await this.translateLargeArray(
        textsToTranslate,
        from,
        to,
      );

      textNodes.forEach((node, index) => {
        if (results[index]?.text) {
          node.data = results[index].text;
        }
      });
    } catch (err: any) {
      this.logger.error(`Batch Translation Error: ${err.message}`);
    }

    return $('body').html() || '';
  }

  /**
   * Hàm bổ trợ: Chia nhỏ mảng text để dịch an toàn, tránh lỗi 429 và giới hạn 5000 ký tự
   */
  private async translateLargeArray(
    texts: string[],
    from: string,
    to: string,
  ): Promise<any[]> {
    const batches: string[][] = [];
    let currentBatch: string[] = [];
    let currentLength = 0;

    for (const text of texts) {
      // Giới hạn an toàn 4000 ký tự cho mỗi lô gửi đi
      if (currentLength + text.length > 4000) {
        batches.push(currentBatch);
        currentBatch = [];
        currentLength = 0;
      }
      currentBatch.push(text);
      currentLength += text.length;
    }
    if (currentBatch.length > 0) batches.push(currentBatch);

    const finalResults: any[] = []; // Fix lỗi TS(2345) bằng cách khai báo any[]

    for (const batch of batches) {
      try {
        const res = await translate(batch, {
          from,
          to,
          ...this.getTranslateOptions(),
        });
        // Google trả về Array nếu input là Array
        finalResults.push(...(Array.isArray(res) ? res : [res]));

        // Nghỉ 300ms giữa các lô nếu nội dung quá dài
        if (batches.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } catch (error) {
        this.logger.error(`Lỗi khi dịch lô: ${error.message}`);
        // Nếu lỗi, đẩy giá trị null để giữ đúng index của mảng
        batch.forEach(() => finalResults.push({ text: null }));
      }
    }
    return finalResults;
  }

  /**
   * Dịch text đơn lẻ
   */
  async translateText(text: string, to = 'en', from = 'vi'): Promise<string> {
    if (!text?.trim()) return text;
    try {
      const res = await translate(text, {
        from,
        to,
        ...this.getTranslateOptions(),
      });
      return (res as any).text || text;
    } catch (err) {
      this.logger.error(`Single Translate Error: ${err.message}`);
      return text;
    }
  }

  /**
   * Dịch dữ liệu theo module config
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
        const isHTML = /<[^>]+>/.test(vi) || /&[a-zA-Z0-9#]+;/.test(vi);

        result[field] = {
          vi,
          en: isHTML
            ? await this.translateHTML(vi)
            : await this.translateText(vi),
        };
      }
    }
    return result;
  }
}
