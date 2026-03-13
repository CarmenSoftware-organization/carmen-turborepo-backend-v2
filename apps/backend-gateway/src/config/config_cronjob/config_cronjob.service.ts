import { Injectable, HttpException } from '@nestjs/common';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { envConfig } from 'src/libs/config.env';

@Injectable()
export class ConfigCronjobService {
  private readonly logger = new BackendLogger(ConfigCronjobService.name);
  private readonly CRONJOB_SERVICE_URL = `http://${envConfig.CRONJOB_SERVICE_HOST}:${envConfig.CRONJOB_SERVICE_TCP_PORT}`;

  /**
   * Send HTTP request to the cronjob microservice
   * ส่งคำขอ HTTP ไปยังไมโครเซอร์วิสงานตั้งเวลา
   * @param endpoint - API endpoint path / เส้นทาง API endpoint
   * @param options - Fetch request options / ตัวเลือกคำขอ fetch
   * @returns Response data from the cronjob service / ข้อมูลตอบกลับจากเซอร์วิสงานตั้งเวลา
   */
  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.CRONJOB_SERVICE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new HttpException(
          error.message || 'Request failed',
          response.status,
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to connect to cronjob service', 503);
    }
  }

  /**
   * Get all cron jobs from the cronjob service
   * ค้นหางานตั้งเวลาทั้งหมดจากเซอร์วิสงานตั้งเวลา
   * @returns All cron job configurations / การกำหนดค่างานตั้งเวลาทั้งหมด
   */
  async getAll() {
    return this.request('/api/cronjobs');
  }

  /**
   * Get a cron job by ID from the cronjob service
   * ค้นหางานตั้งเวลาเดียวตาม ID จากเซอร์วิสงานตั้งเวลา
   * @param id - Cron job ID / รหัสงานตั้งเวลา
   * @returns Cron job configuration / การกำหนดค่างานตั้งเวลา
   */
  async getById(id: string) {
    return this.request(`/api/cronjobs/${id}`);
  }

  /**
   * Create a new cron job via the cronjob service
   * สร้างงานตั้งเวลาใหม่ผ่านเซอร์วิสงานตั้งเวลา
   * @param data - Cron job creation data / ข้อมูลสำหรับสร้างงานตั้งเวลา
   * @returns Created cron job / งานตั้งเวลาที่สร้างแล้ว
   */
  async create(data: Record<string, unknown>) {
    return this.request('/api/cronjobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing cron job via the cronjob service
   * อัปเดตงานตั้งเวลาที่มีอยู่ผ่านเซอร์วิสงานตั้งเวลา
   * @param id - Cron job ID / รหัสงานตั้งเวลา
   * @param data - Update data / ข้อมูลสำหรับอัปเดต
   * @returns Updated cron job / งานตั้งเวลาที่อัปเดตแล้ว
   */
  async update(id: string, data: Record<string, unknown>) {
    return this.request(`/api/cronjobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a cron job by ID via the cronjob service
   * ลบงานตั้งเวลาตาม ID ผ่านเซอร์วิสงานตั้งเวลา
   * @param id - Cron job ID / รหัสงานตั้งเวลา
   * @returns Deletion result / ผลการลบ
   */
  async delete(id: string) {
    return this.request(`/api/cronjobs/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Start a cron job by ID via the cronjob service
   * เริ่มงานตั้งเวลาตาม ID ผ่านเซอร์วิสงานตั้งเวลา
   * @param id - Cron job ID / รหัสงานตั้งเวลา
   * @returns Start result / ผลการเริ่มงาน
   */
  async start(id: string) {
    return this.request(`/api/cronjobs/${id}/start`, {
      method: 'POST',
    });
  }

  /**
   * Stop a cron job by ID via the cronjob service
   * หยุดงานตั้งเวลาตาม ID ผ่านเซอร์วิสงานตั้งเวลา
   * @param id - Cron job ID / รหัสงานตั้งเวลา
   * @returns Stop result / ผลการหยุดงาน
   */
  async stop(id: string) {
    return this.request(`/api/cronjobs/${id}/stop`, {
      method: 'POST',
    });
  }

  /**
   * Execute a cron job immediately by ID via the cronjob service
   * เรียกใช้งานตั้งเวลาทันทีตาม ID ผ่านเซอร์วิสงานตั้งเวลา
   * @param id - Cron job ID / รหัสงานตั้งเวลา
   * @returns Execution result / ผลการเรียกใช้งาน
   */
  async execute(id: string) {
    return this.request(`/api/cronjobs/${id}/execute`, {
      method: 'POST',
    });
  }

  /**
   * Get all active cron jobs currently in memory
   * ค้นหางานตั้งเวลาที่ทำงานอยู่ในหน่วยความจำทั้งหมด
   * @returns Active jobs in memory / งานที่ทำงานอยู่ในหน่วยความจำ
   */
  async getActiveInMemory() {
    return this.request('/api/cronjobs/debug/memory');
  }
}
