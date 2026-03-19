
const Database = {
    init() {
       
        if (!localStorage.getItem('lib_users')) {
            const defaultUsers = [
                { email: 'admin', password: '123', role: 'ADMIN', name: 'Quản trị viên Hệ thống' },
                { email: 'thuvien', password: '123', role: 'LIBRARIAN', name: 'Thủ thư A' },
                { email: 'docgia', password: '123', role: 'READER', name: 'Độc giả B' }
            ];
            localStorage.setItem('lib_users', JSON.stringify(defaultUsers));
        }

    
        if (!localStorage.getItem('lib_books')) {
            const defaultBooks = [
                { id: 'S001', name: 'Giải tích 1', category: 'Toán cao cấp', author: 'Nguyễn Văn A', year: 1969, quantity: 5, status: 'Đang có' },
                { id: 'S002', name: 'Lập trình C#', category: 'Lập trình', author: 'Trịnh Văn B', year: 1956, quantity: 0, status: 'Sắp có' },
                { id: 'S003', name: 'Đắc Nhân Tâm', category: 'Tâm lý', author: 'Dale Carnegie', year: 1936, quantity: 15, status: 'Đang có' },
                { id: 'S004', name: 'Vật lí 1', category: 'Vật lý', author: 'Lê Văn C', year: 1960, quantity: 9, status: 'Đang có' }
            ];
            localStorage.setItem('lib_books', JSON.stringify(defaultBooks));
        }
        
   
        if (!localStorage.getItem('lib_reservations')) {
            localStorage.setItem('lib_reservations', JSON.stringify([]));
        }


        if (!localStorage.getItem('lib_stats')) {
            const mockStats = [
                { month: 'Tháng 1', borrowed: 120, returned: 100, damaged: 2, fine: 200000, newBought: 15, importCost: 3000000 },
                { month: 'Tháng 2', borrowed: 140, returned: 110, damaged: 3, fine: 300000, newBought: 10, importCost: 2500000 },
                { month: 'Tháng 3', borrowed: 130, returned: 105, damaged: 1, fine: 150000, newBought: 12, importCost: 2800000 },
                { month: 'Tháng 4', borrowed: 160, returned: 120, damaged: 4, fine: 400000, newBought: 18, importCost: 3200000 }
            ];
            localStorage.setItem('lib_stats', JSON.stringify(mockStats));
        }
    },

    getStats() {
        return JSON.parse(localStorage.getItem('lib_stats')) || [];
    }
};

Database.init();