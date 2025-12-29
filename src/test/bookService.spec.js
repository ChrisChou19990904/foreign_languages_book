import { describe, it, expect, vi } from 'vitest';
import BookService from '../services/bookService';
import apiClient from '../plugins/axios';
import axios from 'axios';

// 同時模擬兩種 axios 實例
vi.mock('../plugins/axios');
vi.mock('axios');

describe('BookService 前端邏輯驗證', () => {

    it('🧪 驗證 getBooksByLang 是否呼叫正確的 API 路徑', async () => {
        apiClient.get.mockResolvedValue({ data: [] });

        await BookService.getBooksByLang('japanese');

        expect(apiClient.get).toHaveBeenCalledWith('/public/books/lang/japanese');
    });

    it('🧪 驗證 addReview 是否正確帶入 Token 與 Payload', async () => {
        // 模擬 localStorage 取得 Token
        const mockToken = 'test-token-123';
        Storage.prototype.getItem = vi.fn(() => mockToken);

        axios.post.mockResolvedValue({ data: { success: true } });

        const payload = { bookId: 1, content: '好書！', rating: 5 };
        await BookService.addReview(payload);

        // 驗證 axios.post 的參數，包含 Headers
        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/user/reviews'),
            payload,
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': `Bearer ${mockToken}`
                })
            })
        );
    });
});