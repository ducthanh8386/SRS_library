// ==========================================
// KHỞI TẠO DỮ LIỆU ĐỘNG (BỔ SUNG THỂ LOẠI)
// ==========================================
if (!localStorage.getItem('lib_categories')) {
    const defaultCategories = ['Toán cao cấp', 'Lập trình', 'Vật lý', 'Tâm lý', 'Văn học', 'Khác'];
    localStorage.setItem('lib_categories', JSON.stringify(defaultCategories));
}

// ==========================================
// XỬ LÝ XÁC THỰC (ĐĂNG NHẬP, ĐĂNG KÝ, QUÊN MK)
// ==========================================
const authController = {
    toggleForm(formType) {
        document.getElementById('login-form').classList.toggle('hidden', formType !== 'login');
        document.getElementById('register-form').classList.toggle('hidden', formType !== 'register');
        document.getElementById('forgot-form').classList.toggle('hidden', formType !== 'forgot');
    },

    recoverPassword() {
        const email = document.getElementById('forgot-email').value;
        const users = JSON.parse(localStorage.getItem('lib_users')) || [];
        const user = users.find(u => u.email === email);
        
        if (user) {
            alert(`Mật khẩu của bạn là: ${user.password}\n(Trong thực tế, hệ thống sẽ gửi email cho bạn)`);
            this.toggleForm('login');
        } else {
            alert("Email không tồn tại trong hệ thống!");
        }
    },

    register() {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-pass').value;
        const role = document.getElementById('reg-role').value;

        if (!name || !email || !pass) return alert("Vui lòng điền đầy đủ thông tin!");
        if (role === 'LIBRARIAN' && !/thuvien/i.test(email)) return alert("Tài khoản Thủ thư phải chứa từ khóa 'thuvien'!");

        const users = JSON.parse(localStorage.getItem('lib_users')) || [];
        if (users.some(u => u.email === email)) return alert("Tài khoản (Email) đã tồn tại!");

        users.push({ email, password: pass, role, name });
        localStorage.setItem('lib_users', JSON.stringify(users));
        
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        this.toggleForm('login');
    },

    login() {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        const users = JSON.parse(localStorage.getItem('lib_users')) || [];
        const user = users.find(u => u.email === email && u.password === pass);

        if (user) {
            sessionStorage.setItem('current_user', JSON.stringify(user));
            appController.renderApp();
        } else {
            alert("Sai thông tin đăng nhập hoặc tài khoản không tồn tại!");
        }
    },

    logout() {
        sessionStorage.removeItem('current_user');
        location.reload(); 
    }
};

// ==========================================
// ĐIỀU KHIỂN NGHIỆP VỤ (CHỨC NĂNG CHÍNH CỦA APP)
// ==========================================
const appController = {
    renderApp() {
        const user = JSON.parse(sessionStorage.getItem('current_user'));
        if (!user) return;

        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('app-view').classList.remove('hidden');
        
        document.getElementById('user-display').innerText = user.name;
        
        let roleName = user.role === 'ADMIN' ? 'Quản trị viên' : (user.role === 'LIBRARIAN' ? 'Thủ thư' : 'Độc giả');
        document.getElementById('role-display').innerText = roleName;
        
        this.renderMenu(user.role);
    },

    renderMenu(role) {
        const menu = document.getElementById('menu-list');
        let items = [];

        // Đã bổ sung UC004: Đổi mật khẩu cho TẤT CẢ các Role
        // Đã bổ sung UC01X: Quản lý loại sách cho Thủ thư
        if (role === 'READER') {
            items = [
                ['🏠 Trang chủ (Xem Sách)', 'viewBooks'], 
                ['👤 Thông tin cá nhân', 'viewProfile'], 
                ['🔒 Đổi mật khẩu', 'changePassword']
            ];
            this.viewBooks();
        } else if (role === 'LIBRARIAN') {
            items = [
                ['🏷️ Quản lý loại sách', 'manageCategories'], 
                ['📚 Quản lý kho sách', 'manageBooks'], 
                ['👥 Duyệt mượn sách', 'manageReaders'], 
                ['🔒 Đổi mật khẩu', 'changePassword']
            ];
            this.manageBooks();
        } else if (role === 'ADMIN') {
            items = [
                ['🛡️ Quản lý tài khoản', 'manageUsers'], 
                ['📊 Thống kê', 'viewStats'], 
                ['🔒 Đổi mật khẩu', 'changePassword']
            ];
            this.manageUsers();
        }

        menu.innerHTML = items.map(item => `
            <li onclick="appController['${item[1]}']()"><span>${item[0]}</span></li>
        `).join('');
    },

    // HÀM HỖ TRỢ: Lấy danh sách thể loại sách từ LocalStorage
    getCategoryOptions(showAllOption = false) {
        let categories = JSON.parse(localStorage.getItem('lib_categories')) || [];
        let html = showAllOption ? '<option value="all">Tất cả thể loại</option>' : '';
        categories.forEach(c => html += `<option value="${c}">${c}</option>`);
        return html;
    },

    // ================= CHỨC NĂNG DÙNG CHUNG =================

    // UC004: Thay đổi mật khẩu
    changePassword() {
        document.getElementById('page-title').innerText = "Thay Đổi Mật Khẩu";
        let html = `
            <div class="form-panel" style="max-width: 500px;">
                <div class="input-group" style="flex-direction: column;">
                    <input type="password" id="old-pass" placeholder="Nhập mật khẩu cũ (*)">
                    <input type="password" id="new-pass" placeholder="Nhập mật khẩu mới (*)">
                    <input type="password" id="confirm-pass" placeholder="Nhập lại mật khẩu mới (*)">
                </div>
                <button class="btn-add" style="width: 100%; margin-top: 10px;" onclick="appController.submitChangePassword()">Xác nhận đổi mật khẩu</button>
            </div>
        `;
        document.getElementById('page-content').innerHTML = html;
    },

    submitChangePassword() {
        let oldP = document.getElementById('old-pass').value;
        let newP = document.getElementById('new-pass').value;
        let confP = document.getElementById('confirm-pass').value;

        if(!oldP || !newP || !confP) return alert("Vui lòng nhập đầy đủ thông tin!");
        if(newP !== confP) return alert("Lỗi: Mật khẩu mới và phần Nhập lại không khớp nhau!");

        let user = JSON.parse(sessionStorage.getItem('current_user'));
        let users = JSON.parse(localStorage.getItem('lib_users')) || [];
        let index = users.findIndex(u => u.email === user.email);

        if(users[index].password !== oldP) {
            return alert("Lỗi: Mật khẩu cũ không chính xác!");
        }

        users[index].password = newP;
        user.password = newP;
        localStorage.setItem('lib_users', JSON.stringify(users));
        sessionStorage.setItem('current_user', JSON.stringify(user));

        alert("Thay đổi mật khẩu thành công!");
        document.getElementById('old-pass').value = '';
        document.getElementById('new-pass').value = '';
        document.getElementById('confirm-pass').value = '';
    },


    // ================= CHỨC NĂNG CỦA ĐỘC GIẢ =================
    viewBooks() {
        document.getElementById('page-title').innerText = "Danh Mục Sách Thư Viện";
        
        let html = `
            <div class="search-panel">
                <input type="text" id="searchInput" placeholder="🔍 Tìm kiếm tên sách..." onkeyup="appController.filterBooks()">
                <select id="categoryFilter" onchange="appController.filterBooks()">
                    ${this.getCategoryOptions(true)}
                </select>
            </div>
            <div id="table-container"></div>
        `;
        document.getElementById('page-content').innerHTML = html;
        
        const books = JSON.parse(localStorage.getItem('lib_books')) || [];
        this.renderBooksTable(books);
    },

    renderBooksTable(books) {
        let tableHtml = `<table>
            <thead><tr><th>Mã</th><th>Tên sách</th><th>Thể loại</th><th>Tác giả</th><th>Năm XB</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
                ${books.map(b => {
                    const isOutOfStock = b.quantity <= 0;
                    const btnHtml = isOutOfStock 
                        ? `<button class="btn-delete" disabled style="background:#95a5a6; cursor:not-allowed">Hết sách</button>`
                        : `<button class="btn-add" onclick="appController.reserveBook('${b.id}', '${b.name}')">Đặt mượn</button>`;
                    
                    return `
                    <tr>
                        <td>${b.id}</td>
                        <td><b>${b.name}</b></td>
                        <td><span class="badge category-badge">${b.category || 'Khác'}</span></td>
                        <td>${b.author}</td>
                        <td>${b.year || 'N/A'}</td>
                        <td><b style="color: ${isOutOfStock ? '#e74c3c' : '#27ae60'}">${isOutOfStock ? 'Sắp có' : 'Đang có'}</b> (${b.quantity} cuốn)</td>
                        <td>${btnHtml}</td>
                    </tr>
                `}).join('')}
            </tbody>
        </table>`;
        document.getElementById('table-container').innerHTML = tableHtml;
    },

    filterBooks() {
        const searchText = document.getElementById("searchInput").value.toLowerCase();
        const selectedCategory = document.getElementById("categoryFilter").value;
        const allBooks = JSON.parse(localStorage.getItem('lib_books')) || [];
        
        const filteredData = allBooks.filter(book => {
            const matchName = book.name.toLowerCase().includes(searchText);
            const matchCategory = selectedCategory === "all" || book.category === selectedCategory;
            return matchName && matchCategory;
        });
        
        this.renderBooksTable(filteredData);
    },

    reserveBook(bookId, bookName) {
        const user = JSON.parse(sessionStorage.getItem('current_user'));
        const reservations = JSON.parse(localStorage.getItem('lib_reservations')) || [];
        
        const isAlreadyReserved = reservations.some(r => r.userEmail === user.email && r.bookId === bookId && r.status === 'Đang chờ duyệt');
        if (isAlreadyReserved) {
            return alert("Bạn đã đặt mượn cuốn sách này rồi, vui lòng chờ Thủ thư duyệt!");
        }

        reservations.push({
            userEmail: user.email,
            bookId: bookId,
            bookName: bookName,
            date: new Date().toLocaleDateString('vi-VN'),
            status: 'Đang chờ duyệt'
        });
        
        localStorage.setItem('lib_reservations', JSON.stringify(reservations));
        alert(`Bạn đã đặt mượn cuốn "${bookName}" thành công!\nVui lòng theo dõi trạng thái trong mục Thông tin cá nhân.`);
    },

    // UC006: Sửa thông tin cá nhân (Độc giả)
    viewProfile() {
        document.getElementById('page-title').innerText = "Thông Tin Cá Nhân";
        const user = JSON.parse(sessionStorage.getItem('current_user'));
        const reservations = JSON.parse(localStorage.getItem('lib_reservations')) || [];
        const myReservations = reservations.filter(r => r.userEmail === user.email);

        let html = `
            <div class="form-panel" style="border-left: 5px solid #3498db; position: relative;">
                <p style="font-size: 16px; margin-bottom: 10px;"><b>Họ và tên:</b> <span>${user.name}</span> 
                    <button class="btn-warning" style="padding: 4px 8px; margin-left: 15px; font-size: 12px;" onclick="appController.showEditProfile('name')">Sửa Tên</button>
                </p>
                <p style="font-size: 16px; margin-bottom: 10px;"><b>Email đăng nhập:</b> <span>${user.email}</span>
                    <button class="btn-warning" style="padding: 4px 8px; margin-left: 15px; font-size: 12px;" onclick="appController.showEditProfile('email')">Sửa Email</button>
                </p>
                <p style="font-size: 16px;"><b>Trạng thái:</b> <span class="badge" style="color:#27ae60; background:#e8f8f5">Đang hoạt động</span></p>
            </div>
            
            <h3 style="margin-bottom:15px; color: #2c3e50;">Lịch sử mượn sách của bạn</h3>
            <table>
                <thead><tr><th>Tên sách</th><th>Ngày đặt</th><th>Trạng thái</th></tr></thead>
                <tbody>
                    ${myReservations.length === 0 ? '<tr><td colspan="3" style="text-align:center">Bạn chưa mượn cuốn sách nào.</td></tr>' : ''}
                    ${myReservations.map(r => `
                        <tr>
                            <td><b>${r.bookName}</b></td>
                            <td>${r.date}</td>
                            <td>
                                <b style="color: ${r.status === 'Đang chờ duyệt' ? '#f39c12' : (r.status === 'Đang mượn' ? '#3498db' : '#27ae60')}">${r.status}</b>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('page-content').innerHTML = html;
    },

    showEditProfile(type) {
        const user = JSON.parse(sessionStorage.getItem('current_user'));
        let title = type === 'name' ? 'Sửa Họ và Tên' : 'Sửa Email';
        let placeholder = type === 'name' ? 'Nhập tên mới...' : 'Nhập email mới...';
        let currentValue = type === 'name' ? user.name : user.email;

        let html = `
            <div class="form-panel" style="max-width: 500px;">
                <h3>${title}</h3>
                <div class="input-group">
                    <input type="text" id="edit-profile-input" value="${currentValue}" placeholder="${placeholder}">
                </div>
                <button class="btn-add" onclick="appController.submitEditProfile('${type}')">Lưu Thay Đổi</button>
                <button class="btn-secondary" onclick="appController.viewProfile()">Hủy bỏ</button>
            </div>
        `;
        document.getElementById('page-content').innerHTML = html;
    },

    submitEditProfile(type) {
        let newVal = document.getElementById('edit-profile-input').value.trim();
        if(!newVal) return alert("Dữ liệu không được để trống!");
        
        let user = JSON.parse(sessionStorage.getItem('current_user'));
        let users = JSON.parse(localStorage.getItem('lib_users')) || [];
        let index = users.findIndex(u => u.email === user.email);

        if (type === 'email') {
            if (newVal !== user.email && users.some(u => u.email === newVal)) {
                return alert("Lỗi: Email này đã có người sử dụng!");
            }
            user.email = newVal;
            users[index].email = newVal;
        } else {
            user.name = newVal;
            users[index].name = newVal;
        }

        // Cập nhật Database và Session hiện tại
        localStorage.setItem('lib_users', JSON.stringify(users));
        sessionStorage.setItem('current_user', JSON.stringify(user));
        
        // Cập nhật Navbar hiển thị Tên
        document.getElementById('user-display').innerText = user.name; 
        alert("Cập nhật thông tin thành công!");
        this.viewProfile(); // Trở lại màn hình profile
    },

    // ================= CHỨC NĂNG CỦA THỦ THƯ =================

    // Quản lý Loại sách (UC Bổ sung cho Thủ thư)
    manageCategories() {
        document.getElementById('page-title').innerText = "Quản Lý Loại Sách";
        let categories = JSON.parse(localStorage.getItem('lib_categories')) || [];
        
        let html = `
            <div class="form-panel">
                <h3>Thêm loại sách mới</h3>
                <div class="input-group" style="max-width: 600px;">
                    <input type="text" id="new-category" placeholder="Nhập tên thể loại sách mới (VD: Khoa học viễn tưởng)...">
                    <button class="btn-add" style="flex: 0.3;" onclick="appController.addCategory()">+ Thêm</button>
                </div>
            </div>
            <table>
                <thead><tr><th>STT</th><th>Tên loại sách</th><th>Thao tác</th></tr></thead>
                <tbody>
                    ${categories.map((c, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td><b>${c}</b></td>
                            <td><button class="btn-delete" onclick="appController.deleteCategory('${c}')">Xóa</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('page-content').innerHTML = html;
    },

    addCategory() {
        let cat = document.getElementById('new-category').value.trim();
        if(!cat) return alert("Vui lòng nhập tên loại sách!");
        let categories = JSON.parse(localStorage.getItem('lib_categories')) || [];
        if(categories.includes(cat)) return alert("Loại sách này đã tồn tại trong hệ thống!");
        
        categories.push(cat);
        localStorage.setItem('lib_categories', JSON.stringify(categories));
        this.manageCategories(); // Tải lại trang
    },

    deleteCategory(cat) {
        if(!confirm(`Bạn có chắc chắn muốn xóa thể loại: ${cat}? Các sách thuộc thể loại này vẫn sẽ giữ nguyên.`)) return;
        let categories = JSON.parse(localStorage.getItem('lib_categories')) || [];
        categories = categories.filter(c => c !== cat);
        localStorage.setItem('lib_categories', JSON.stringify(categories));
        this.manageCategories();
    },

    // Quản lý Kho sách
    manageBooks() {
        document.getElementById('page-title').innerText = "Quản Lý Kho Sách";
        const books = JSON.parse(localStorage.getItem('lib_books')) || [];
        
        let html = `
            <div class="form-panel">
                <h3 id="form-title">Thêm sách mới</h3>
                <input type="hidden" id="edit-book-id" value="">
                
                <div class="input-group">
                    <input type="text" id="book-name" placeholder="Tên sách (*)">
                    <input type="text" id="book-author" placeholder="Tác giả (*)">
                    <input type="number" id="book-qty" placeholder="Số lượng (*)" min="0">
                </div>
                <div class="input-group">
                    <select id="book-category">
                        ${this.getCategoryOptions(false)}
                    </select>
                    <input type="number" id="book-year" placeholder="Năm xuất bản">
                </div>
                <button class="btn-add" id="btn-save" onclick="appController.saveBook()">Lưu Sách</button>
                <button class="btn-secondary hidden" id="btn-cancel" onclick="appController.manageBooks()">Hủy bỏ</button>
            </div>

            <table>
                <thead><tr><th>Mã</th><th>Tên sách</th><th>Thể loại</th><th>Tác giả</th><th>Số lượng</th><th>Thao tác</th></tr></thead>
                <tbody>
                    ${books.map(b => `
                        <tr>
                            <td>${b.id}</td>
                            <td><b>${b.name}</b></td>
                            <td><span class="badge category-badge">${b.category || 'Khác'}</span></td>
                            <td>${b.author}</td>
                            <td><b>${b.quantity}</b></td>
                            <td>
                                <button class="btn-warning" onclick="appController.editBook('${b.id}')">Sửa</button>
                                <button class="btn-delete" onclick="appController.deleteBook('${b.id}')">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('page-content').innerHTML = html;
    },

    saveBook() {
        const idInput = document.getElementById('edit-book-id').value;
        const name = document.getElementById('book-name').value;
        const author = document.getElementById('book-author').value;
        const quantity = parseInt(document.getElementById('book-qty').value);
        const category = document.getElementById('book-category').value;
        const year = document.getElementById('book-year').value;

        if (!name || !author || isNaN(quantity)) return alert("Vui lòng điền đầy đủ các trường bắt buộc (*)");

        let books = JSON.parse(localStorage.getItem('lib_books')) || [];

        if (idInput) {
            const index = books.findIndex(b => b.id === idInput);
            if (index !== -1) {
                books[index] = { ...books[index], name, author, quantity, category, year, status: quantity > 0 ? 'Đang có' : 'Sắp có' };
            }
            alert("Cập nhật sách thành công!");
        } else {
            const newId = 'S' + String(Date.now()).slice(-4); 
            books.push({ id: newId, name, author, quantity, category, year, status: quantity > 0 ? 'Đang có' : 'Sắp có' });
            alert("Thêm sách mới thành công!");
        }

        localStorage.setItem('lib_books', JSON.stringify(books));
        this.manageBooks(); 
    },

    editBook(bookId) {
        const books = JSON.parse(localStorage.getItem('lib_books')) || [];
        const book = books.find(b => b.id === bookId);
        if (!book) return;

        document.getElementById('edit-book-id').value = book.id;
        document.getElementById('book-name').value = book.name;
        document.getElementById('book-author').value = book.author;
        document.getElementById('book-qty').value = book.quantity;
        document.getElementById('book-category').value = book.category || 'Khác';
        document.getElementById('book-year').value = book.year || '';

        document.getElementById('form-title').innerText = `Chỉnh sửa sách: ${book.name}`;
        document.getElementById('btn-save').innerText = "Cập nhật";
        document.getElementById('btn-cancel').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    deleteBook(bookId) {
        if (!confirm("Bạn có chắc chắn muốn xóa cuốn sách này khỏi kho?")) return;
        let books = JSON.parse(localStorage.getItem('lib_books')) || [];
        books = books.filter(b => b.id !== bookId); 
        localStorage.setItem('lib_books', JSON.stringify(books));
        this.manageBooks();
    },

    manageReaders() {
        document.getElementById('page-title').innerText = "Yêu Cầu Mượn Sách";
        const reservations = JSON.parse(localStorage.getItem('lib_reservations')) || [];
        
        let html = `<table>
            <thead><tr><th>Email Độc giả</th><th>Sách muốn mượn</th><th>Ngày đặt</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
                ${reservations.length === 0 ? '<tr><td colspan="5" style="text-align:center">Chưa có yêu cầu mượn sách nào.</td></tr>' : ''}
                ${reservations.map((r, idx) => {
                    let actionBtn = '';
                    if (r.status === 'Đang chờ duyệt') {
                        actionBtn = `<button class="btn-add" onclick="appController.approveReservation(${idx})">Duyệt mượn</button>`;
                    } else if (r.status === 'Đang mượn') {
                        actionBtn = `<button class="btn-secondary" onclick="appController.returnBook(${idx})">Nhận trả sách</button>`;
                    } else {
                        actionBtn = `<span style="color: #7f8c8d; font-weight:bold;">Đã hoàn thành</span>`;
                    }

                    return `
                    <tr>
                        <td><b>${r.userEmail}</b></td>
                        <td>${r.bookName}</td>
                        <td>${r.date}</td>
                        <td><b style="color: ${r.status === 'Đang chờ duyệt' ? '#f39c12' : (r.status === 'Đang mượn' ? '#3498db' : '#27ae60')}">${r.status}</b></td>
                        <td>${actionBtn}</td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>`;
        document.getElementById('page-content').innerHTML = html;
    },

    approveReservation(index) {
        let reservations = JSON.parse(localStorage.getItem('lib_reservations')) || [];
        let books = JSON.parse(localStorage.getItem('lib_books')) || [];
        let req = reservations[index];
        let bookIndex = books.findIndex(b => b.id === req.bookId);

        if (bookIndex !== -1) {
            if (books[bookIndex].quantity <= 0) {
                return alert("Trong kho đã hết cuốn sách này, không thể duyệt!");
            }
            books[bookIndex].quantity -= 1;
            localStorage.setItem('lib_books', JSON.stringify(books));
        }

        reservations[index].status = 'Đang mượn';
        localStorage.setItem('lib_reservations', JSON.stringify(reservations));
        alert("Đã duyệt yêu cầu mượn sách thành công!");
        this.manageReaders(); 
    },

    returnBook(index) {
        let reservations = JSON.parse(localStorage.getItem('lib_reservations')) || [];
        let books = JSON.parse(localStorage.getItem('lib_books')) || [];
        let req = reservations[index];
        let bookIndex = books.findIndex(b => b.id === req.bookId);

        if (bookIndex !== -1) {
            books[bookIndex].quantity += 1;
            localStorage.setItem('lib_books', JSON.stringify(books));
        }

        reservations[index].status = 'Đã trả';
        localStorage.setItem('lib_reservations', JSON.stringify(reservations));
        alert("Đã xác nhận trả sách thành công!");
        this.manageReaders();
    },

    // ================= CHỨC NĂNG CỦA ADMIN =================
    manageUsers() {
        document.getElementById('page-title').innerText = "Quản Lý Tài Khoản";
        const users = JSON.parse(localStorage.getItem('lib_users')) || [];
        
        let html = `
            <div class="form-panel">
                <h3 id="user-form-title" style="color: var(--primary); margin-top: 0; margin-bottom: 15px;">Thêm tài khoản mới</h3>
                <input type="hidden" id="edit-user-email-old" value="">
                <div class="input-group">
                    <input type="text" id="user-name" placeholder="Họ và tên (*)">
                    <input type="email" id="user-email" placeholder="Email / Tên đăng nhập (*)">
                    <input type="text" id="user-phone" placeholder="Số điện thoại">
                </div>
                <div class="input-group">
                    <input type="text" id="user-password" placeholder="Mật khẩu đăng nhập (*)">
                    <select id="user-role">
                        <option value="READER">Độc giả</option>
                        <option value="LIBRARIAN">Thủ thư</option>
                        <option value="ADMIN">Quản trị viên</option>
                    </select>
                </div>
                <button class="btn-add" id="btn-save-user" onclick="appController.saveUser()">Lưu Tài Khoản</button>
                <button class="btn-secondary hidden" id="btn-cancel-user" onclick="appController.manageUsers()">Hủy bỏ</button>
            </div>

            <table>
                <thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Thao tác</th></tr></thead>
                <tbody>
                    ${users.map((u, idx) => `
                        <tr>
                            <td><b>${u.name}</b></td>
                            <td>${u.email}</td>
                            <td><span class="badge" style="background:#e8f4f8; color:#3498db;">${u.role}</span></td>
                            <td>
                                <button class="btn-warning" onclick="appController.editUser('${u.email}')">Sửa</button>
                                ${u.role !== 'ADMIN' ? `<button class="btn-delete" onclick="appController.deleteUser('${u.email}')">Xóa</button>` : '<span style="color:#95a5a6; font-weight:bold; margin-left:10px">Bảo vệ</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('page-content').innerHTML = html;
    },

    saveUser() {
        const oldEmail = document.getElementById('edit-user-email-old').value;
        const name = document.getElementById('user-name').value;
        const email = document.getElementById('user-email').value;
        const phone = document.getElementById('user-phone').value || '';
        const password = document.getElementById('user-password').value;
        const role = document.getElementById('user-role').value;

        if (!name || !email || !password) return alert("Vui lòng điền đầy đủ các trường bắt buộc (*)");

        let users = JSON.parse(localStorage.getItem('lib_users')) || [];

        if (oldEmail) {
            const index = users.findIndex(u => u.email === oldEmail);
            if (index !== -1) {
                if (email !== oldEmail && users.some(u => u.email === email)) {
                    return alert("Lỗi: Email / Tên đăng nhập mới đã tồn tại trong hệ thống!");
                }
                users[index] = { ...users[index], name, email, phone, password, role };
                alert("Cập nhật thông tin tài khoản thành công!");
            }
        } else {
            if (users.some(u => u.email === email)) {
                return alert("Lỗi: Email / Tên đăng nhập đã tồn tại trong hệ thống!");
            }
            users.push({ name, email, phone, password, role });
            alert("Thêm tài khoản mới thành công!");
        }

        localStorage.setItem('lib_users', JSON.stringify(users));
        this.manageUsers(); 
    },

    editUser(email) {
        const users = JSON.parse(localStorage.getItem('lib_users')) || [];
        const user = users.find(u => u.email === email);
        if (!user) return;

        document.getElementById('edit-user-email-old').value = user.email;
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-phone').value = user.phone || '';
        document.getElementById('user-password').value = user.password;
        document.getElementById('user-role').value = user.role;

        document.getElementById('user-form-title').innerText = `Chỉnh sửa tài khoản: ${user.name}`;
        document.getElementById('btn-save-user').innerText = "Cập nhật";
        document.getElementById('btn-save-user').style.backgroundColor = "#f39c12"; 
        document.getElementById('btn-cancel-user').classList.remove('hidden');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    deleteUser(email) {
        if (!confirm(`Bạn có chắc muốn xóa tài khoản: ${email} ?`)) return;
        let users = JSON.parse(localStorage.getItem('lib_users')) || [];
        users = users.filter(u => u.email !== email);
        localStorage.setItem('lib_users', JSON.stringify(users));
        this.manageUsers(); 
    },

    viewStats() {
        document.getElementById('page-title').innerText = "Thống Kê Hoạt Động Thư Viện";
        
        const stats = typeof Database !== 'undefined' ? Database.getStats() : (JSON.parse(localStorage.getItem('lib_stats')) || []);
        
        let totalBorrowed = 0, totalFines = 0, totalImportCost = 0;
        stats.forEach(s => {
            totalBorrowed += s.borrowed; totalFines += s.fine; totalImportCost += s.importCost;
        });

        const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

        let html = `
            <div class="stat-grid">
                <div class="stat-card" style="border-top-color: #3498db">
                    <span class="stat-title">📚 Tổng sách đã mượn</span>
                    <span class="stat-value" style="color: #3498db">${totalBorrowed} cuốn</span>
                </div>
                <div class="stat-card" style="border-top-color: #f39c12">
                    <span class="stat-title">💰 Tổng thu tiền phạt</span>
                    <span class="stat-value" style="color: #f39c12">${formatMoney(totalFines)}</span>
                </div>
                <div class="stat-card" style="border-top-color: #e74c3c">
                    <span class="stat-title">📉 Tổng chi nhập sách</span>
                    <span class="stat-value" style="color: #e74c3c">${formatMoney(totalImportCost)}</span>
                </div>
            </div>

            <div class="form-panel" style="margin-top: 20px; border-left: none;">
                <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 15px;">Báo cáo chi tiết theo tháng</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Tháng</th><th>Đã mượn</th><th>Đã trả</th><th>Hư hỏng</th><th>Tiền phạt</th><th>Mua mới</th><th>Chi phí nhập</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.map(s => `
                            <tr>
                                <td><b>${s.month}</b></td>
                                <td><span class="badge" style="background:#e8f4f8; color:#3498db">${s.borrowed}</span></td>
                                <td><span class="badge" style="background:#e8f8f5; color:#27ae60">${s.returned}</span></td>
                                <td><b style="color: #e74c3c">${s.damaged}</b></td>
                                <td>${formatMoney(s.fine)}</td>
                                <td>${s.newBought}</td>
                                <td>${formatMoney(s.importCost)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('page-content').innerHTML = html;
    }
}; 

window.onload = () => {
    if(sessionStorage.getItem('current_user')) {
        appController.renderApp();
    }
};