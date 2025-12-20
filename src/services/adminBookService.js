import apiClient from '@/plugins/axios'; // 引入已配置 JWT 的 Axios 實例

/**
 * 管理員書籍相關的 API 服務模組
 * 所有操作都需要 ADMIN 權限 (路徑是 /api/admin/books)
 */
const AdminBookService = {

    /**
     * 獲取所有書籍 (包含已下架的)
     * GET /api/admin/books
     * @returns {Promise<Array>} 書籍列表
     */
    getAllBooksForAdmin() {
        return apiClient.get(`/admin/books`);
    },

    /**
     * 新增一本書籍
     * POST /api/admin/books
     * @param {Object} bookData - 完整的書籍資料
     * @returns {Promise<Object>} 創建後的書籍實體
     */
    createBook(bookData) {
        return apiClient.post(`/admin/books`, bookData);
    },

    /**
     * 更新單本書籍資訊
     * PUT /api/admin/books/{bookId}
     * @param {number} bookId
     * @param {Object} bookData - 更新後的書籍資料
     * @returns {Promise<Object>} 更新後的書籍實體
     */
    updateBook(bookId, bookData) {
        if (!bookId) {
            return Promise.reject(new Error("必須提供書籍 ID。"));
        }
        return apiClient.put(`/admin/books/${bookId}`, bookData);
    },

    /**
     * 刪除單本書籍 (永久刪除)
     * DELETE /api/admin/books/{bookId}
     * @param {number} bookId
     * @returns {Promise<string>} 成功訊息
     */
    deleteBook(bookId) {
        if (!bookId) {
            return Promise.reject(new Error("必須提供書籍 ID。"));
        }
        return apiClient.delete(`/admin/books/${bookId}`);
    }

    // 假設您還有分類管理，可以在此處添加 getCategories 等方法
};

export default AdminBookService;