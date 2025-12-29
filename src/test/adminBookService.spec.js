import { describe, it, expect, vi } from 'vitest';
import AdminBookService from '../services/adminBookService';
import apiClient from '../plugins/axios';

// 模擬已配置 JWT 的 apiClient
vi.mock('../plugins/axios');

describe('AdminBookService 測試 - 管理端權限操作', () => {

    it('🧪 應能正確調用 GET 獲取所有書籍列表', async () => {
        apiClient.get.mockResolvedValue({ data: [] });
        await AdminBookService.getAllBooksForAdmin();
        expect(apiClient.get).toHaveBeenCalledWith('/admin/books');
    });

    it('🧪 驗證 updateBook 是否正確組合路徑與帶入資料', async () => {
        const bookId = 123;
        const updateData = { title: '新書名', price: 500 };
        apiClient.put.mockResolvedValue({ data: { ...updateData, bookId } });

        await AdminBookService.updateBook(bookId, updateData);

        // 驗證路徑是否包含 ID，且 Payload 是否正確
        expect(apiClient.put).toHaveBeenCalledWith(`/admin/books/${bookId}`, updateData);
    });

    it('🧪 驗證 deleteBook 在未提供 ID 時應攔截並回報錯誤', async () => {
        // 測試代碼中的防錯機制：if (!bookId)
        await expect(AdminBookService.deleteBook(null))
            .rejects.toThrow('必須提供書籍 ID。');
    });
});