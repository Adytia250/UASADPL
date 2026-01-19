// --- SISTEM AUTHENTICATION ---

const loginModal = document.getElementById('login-modal');
const loginBtn = document.getElementById('login-btn');
const closeLoginBtn = document.querySelector('.close-login');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginFormContainer = document.getElementById('login-form-container');
const registerFormContainer = document.getElementById('register-form-container');
// --- LOGIKA HAMBURGER MENU ---

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        // Menambah/menghapus class 'active' saat diklik
        navLinks.classList.toggle('active');
        
        // Opsional: Ubah ikon dari garis 3 (bars) ke silang (times)
        const icon = menuToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });
}

// Tutup menu otomatis saat salah satu link diklik (untuk mobile)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.replace('fa-times', 'fa-bars');
    });
});

// Cek Status Login Saat Halaman Dimuat
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
});

function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        document.body.classList.remove('logged-out');
        document.body.classList.add('logged-in');
        loginBtn.textContent = 'Logout (' + user.name + ')';
        loginBtn.classList.add('logout-mode');
        
        // Isi otomatis nama di form booking jika ada
        if(document.getElementById('book-name')) {
            document.getElementById('book-name').value = user.name;
        }
    } else {
        document.body.classList.add('logged-out');
        document.body.classList.remove('logged-in');
        loginBtn.textContent = 'Login';
        loginBtn.classList.remove('logout-mode');
    }
}

// Fungsi Buka Modal Login
function openLoginModal() {
    loginModal.style.display = 'block';
}

// Event Login/Logout Button
loginBtn.addEventListener('click', () => {
    if (localStorage.getItem('currentUser')) {
        // Proses Logout
        localStorage.removeItem('currentUser');
        alert('Anda telah logout.');
        location.reload(); // Refresh untuk mengunci kembali web
    } else {
        openLoginModal();
    }
});

// Close Modal
closeLoginBtn.onclick = () => loginModal.style.display = 'none';
window.onclick = (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
};

// Switch Tab Login/Register
loginTab.onclick = () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginFormContainer.style.display = 'block';
    registerFormContainer.style.display = 'none';
};

registerTab.onclick = () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerFormContainer.style.display = 'block';
    loginFormContainer.style.display = 'none';
};

// Handle Register
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
        alert('Email sudah terdaftar!');
        return;
    }
    
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registrasi berhasil! Silakan login.');
    loginTab.click();
});

// Handle Login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert('Selamat datang, ' + user.name + '!');
        loginModal.style.display = 'none';
        checkLoginStatus();
    } else {
        alert('Email atau password salah!');
    }
});

// --- FITUR UI LAINNYA ---

// Smooth Scroll
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Modal Booking
const bookingModal = document.getElementById('booking-modal');
const bookNowBtn = document.getElementById('book-now-btn');
if(bookNowBtn) {
    bookNowBtn.onclick = () => {
        if (!localStorage.getItem('currentUser')) {
            alert('Silakan login terlebih dahulu untuk memesan!');
            openLoginModal();
        } else {
            bookingModal.style.display = 'block';
        }
    };
}

document.querySelector('.close').onclick = () => bookingModal.style.display = 'none';

// Fungsi untuk memunculkan teks Visi & Misi saat diklik
function toggleContent(id) {
    const content = document.getElementById(id);
    const parent = content.parentElement;
    const icon = parent.querySelector('i');

    // Tutup semua konten lain jika ingin hanya satu yang terbuka (Opsional)
    // document.querySelectorAll('.collapsible-content').forEach(el => {
    //     if(el.id !== id) el.classList.remove('active');
    // });

    // Toggle class active
    content.classList.toggle('active');

    // Ubah icon plus (+) menjadi minus (-) saat terbuka
    if (content.classList.contains('active')) {
        icon.classList.replace('fa-plus', 'fa-minus');
    } else {
        icon.classList.replace('fa-minus', 'fa-plus');
    }
}

// Data Kamar (Bisa ditambah fotonya di dalam array images)
const roomsData = [
    {
        id: 1,
        name: "Kamar Standar",
        price: "Rp 100.000",
        rating: 4,
        images: ["standart1.png", "https://pix8.agoda.net/hotelImages/56295915/1241844803/609af8d644609498b0bab5b622fc0760.jpg?ce=2&s=1024x", "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/748210881.jpg?k=5f3e0de0d4d52c3c305a5a9999299b02272598260805200498ca663fb716eddc&o=&s=1024x"],
        facilities: ["1 kasur double", "WiFi Gratis", "AC", "Balkon", "Kamar Mandi Pribadi"],
        reviews: [
            { user: "Muhammad", text: "Pelayanan ramah dan lokasi mudah di cari. Untuk type standart tidak ada tv nya. Kasurnya empuk dan nyaman. AC kurang dingin perlu perawatan. Sudah disediakan peralatan mandi juga.", star: 5 },
            { user: "Heri", text: "Selalu nginap disini staff nya ramah mendukung dan fasilitas kamar seperti tidur aja di perbaiki", star: 4 }
        ]
    },
    {
        id: 2,
        name: "Kamar Deluxe",
        price: "Rp 200.000",
        rating: 5,
        images: ["deluxe1.png", "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/567177157.jpg?k=cde27fa00624b5f6acdced2f4d3b0fdde6f53ebe55b8e4d55273efd0afb1e8a3&o=&s=1024x", "https://pix8.agoda.net/hotelImages/56295915/-1/f7db5b05e25da7f6697453c6f7a898f3.jpg?ce=0&s=1024x"],
        facilities: ["1 kasur double", "WiFi Cepat", "AC", "Smart TV", "Kamar Mandi Pribadi", "Balkon"],
        reviews: [
            { user: "Awaline", text: "di kamar yang saya sewa sempat ada kecoaknya. air hangatnya terlalu panas dan kran kontrolnya tidak bisa digunakan krn tidak bisa diputar (macet).", star: 5 }
        ]
    },
    {
        id: 3,
        name: "Kamar Suite",
        price: "Rp 250.000",
        rating: 5,
        images: ["suite1.png", "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/721022168.jpg?k=80c5f56eb5f781b0ff0f14c26baf4dc27e629094e9c02022f2b6553e8279f0d4&o=&s=1024x", "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/721023287.jpg?k=27976a033cfb1f9e0b42d2ef1b760a316cd75a56eb6c35813fa3a0c44e5dd387&o=&s=1024x"],
        facilities: ["1 kasur double", "WiFi Gratis", "AC", "Smart TV", "Kamar Mandi Pribadi", "1 sofa bed", "Ruang Tamu", "Mini Bar"],
        reviews: [
            { user: "Martino", text: "tempatnya enak nyaman bagus bersih, ac-nya dingin", star: 5 },
        ]
    }
];

// Menampilkan Kamar ke Grid
function displayRooms() {
    const container = document.getElementById('rooms-container');
    container.innerHTML = roomsData.map(room => `
        <div class="room-card">
            <img src="${room.images[0]}" alt="${room.name}">
            <div class="room-info">
                <h3>${room.name}</h3>
                <div class="rating-stars">${'★'.repeat(room.rating)}${'☆'.repeat(5-room.rating)}</div>
                <p class="price">${room.price} / malam</p>
                <button class="cta-btn" onclick="openRoomDetail(${room.id})" style="margin-top:15px; width:100%;">Lihat Detail</button>
            </div>
        </div>
    `).join('');
}

// Membuka Modal Detail
function openRoomDetail(id) {
    const room = roomsData.find(r => r.id === id);
    const modal = document.getElementById('room-detail-modal');
    const body = document.getElementById('detail-body');

    body.innerHTML = `
        <h2>${room.name}</h2>
        <div class="image-gallery">
            ${room.images.map(img => `<img src="${img}" alt="foto">`).join('')}
        </div>
        <div class="detail-desc">
            <h4>Fasilitas Kamar:</h4>
            <ul>${room.facilities.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}</ul>
        </div>
        <div class="review-section">
            <h4>Ulasan Tamu:</h4>
            ${room.reviews.map(rev => `
                <div class="review-item">
                    <strong>${rev.user}</strong> <span class="rating-stars">${'★'.repeat(rev.star)}</span>
                    <p>"${rev.text}"</p>
                </div>
            `).join('')}
        </div>
        <button class="cta-btn" style="width:100%; margin-top:20px;" onclick="document.getElementById('book-now-btn').click()">Pesan Sekarang</button>
    `;
    modal.style.display = 'block';
}

// Tutup Detail Modal
document.querySelector('.close-detail').onclick = () => {
    document.getElementById('room-detail-modal').style.display = 'none';
};

// Panggil fungsi tampilkan kamar saat load
window.onload = () => {
    displayRooms();
    checkStatus(); // Panggil fungsi login status dari kode sebelumnya
};

// Handle Contact Form Submission
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('button');
    const originalText = btn.textContent;
    
    btn.textContent = "Mengirim...";
    btn.disabled = true;

    // Simulasi loading
    setTimeout(() => {
        alert('Terima kasih! Pesan Anda telah terkirim. Kami akan menghubungi Anda segera.');
        btn.textContent = originalText;
        btn.disabled = false;
        this.reset();
    }, 2000);
});

// --- FUNGSI NOTIFIKASI (TOAST) ---
function showNotification(title, message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Hapus elemen dari DOM setelah animasi selesai (5 detik)
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// --- INTEGRASI KE FORM PEMESANAN ---
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Ambil data (opsional untuk ditampilkan di notifikasi)
        const roomType = this.querySelector('select').value;
        const checkIn = this.querySelector('input[type="date"]').value;

        // Tutup modal
        document.getElementById('booking-modal').style.display = 'none';
        
        // Munculkan Notifikasi
        showNotification(
            "Pesanan Diterima!", 
            `Kamar ${roomType} berhasil dipesan untuk tanggal ${checkIn}.`, 
            "success"
        );

        this.reset();
    });
}

// --- INTEGRASI KE FORM KONTAK ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        showNotification(
            "Pesan Terkirim", 
            "Terima kasih, tim kami akan segera menghubungi Anda.", 
            "info"
        );
        
        this.reset();
    });
}