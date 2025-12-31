// -------------------------- Data persistence helpers --------------------------
const LS_KEYS = { USERS:'ss_users', HOTELS:'ss_hotels', BOOKINGS:'ss_bookings', CURRENT:'ss_currentUser' };
function save(key,val){localStorage.setItem(key,JSON.stringify(val))}
function load(key, fallback){const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}

// -------------------------- Seed default data --------------------------
(function seed(){
  if(!load(LS_KEYS.USERS)){
    const admin={id:Date.now(),name:'Admin',email:'admin@singgah.com',password:'admin123',role:'admin'};
    const user={id:Date.now()+1,name:'Test User',email:'user@singgah.com',password:'user123',role:'user'};
    save(LS_KEYS.USERS,[admin,user]);
  }
  if(!load(LS_KEYS.HOTELS)){
    // small default dataset
    const hotels=[
      {id:1,name:'Grand Luxury Resort',location:'Bali, Indonesia',rating:4.8,price:150,amenities:['WiFi','Pool','Spa'],stars:5,deal:'30% OFF',description:'Experience ultimate luxury',image:''},
      {id:2,name:'Urban Comfort Hotel',location:'Tokyo, Japan',rating:4.5,price:120,amenities:['WiFi','Parking'],stars:4,deal:null,description:'Modern hotel in Tokyo',image:''},
      {id:3,name:'Cozy Countryside Inn',location:'Yogyakarta, Indonesia',rating:4.2,price:60,amenities:['WiFi','Breakfast'],stars:3,deal:'Breakfast Included',description:'A peaceful stay near nature',image:''}
    ];
    save(LS_KEYS.HOTELS,hotels);
  }
  if(!load(LS_KEYS.BOOKINGS)) save(LS_KEYS.BOOKINGS,[]);
})();

// -------------------------- State --------------------------
let hotels = load(LS_KEYS.HOTELS,[]);
let bookings = load(LS_KEYS.BOOKINGS,[]);
let users = load(LS_KEYS.USERS,[]);
let currentUser = load(LS_KEYS.CURRENT, null);

// -------------------------- UI Init --------------------------
document.addEventListener('DOMContentLoaded',()=>{
  renderNav();
  displayFeaturedHotels();
  displayHotels();
  setMinDate();

  // event listeners
  document.getElementById('loginForm')?.addEventListener('submit',handleLogin);
  document.getElementById('registerForm')?.addEventListener('submit',handleRegister);
  document.getElementById('hotelForm')?.addEventListener('submit',saveHotelFromForm);
  document.getElementById('bookingForm')?.addEventListener('submit',completeBooking);
  document.getElementById('sortBy')?.addEventListener('change',()=>{applyFilters()});

  // sync checkout min when checkin changes
  const checkinInput = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');
  checkinInput?.addEventListener('change',()=>{
    if(!checkinInput.value) return;
    const min = new Date(checkinInput.value);
    min.setDate(min.getDate()+1);
    const minStr = min.toISOString().split('T')[0];
    if(checkoutInput) {
      checkoutInput.setAttribute('min', minStr);
      if(!checkoutInput.value || checkoutInput.value <= checkinInput.value) checkoutInput.value = minStr;
    }
  });
});

// -------------------------- Navigation & Auth --------------------------
function renderNav(){
  const area=document.getElementById('navAuthArea');area.innerHTML='';
  const adminNavItem = document.getElementById('adminNavItem');
  if(currentUser){
    const span=document.createElement('div');span.className='small';span.textContent=`Hi, ${currentUser.name} (${currentUser.role})`;
    const btnLogout=document.createElement('button');btnLogout.className='btn btn-outline';btnLogout.textContent='Logout';btnLogout.onclick=logout;
    area.appendChild(span);area.appendChild(btnLogout);
    // show admin menu if admin
    if(currentUser.role==='admin') adminNavItem?.classList.remove('hidden'); else adminNavItem?.classList.add('hidden');
  } else {
    const btnLogin=document.createElement('button');btnLogin.className='btn btn-outline';btnLogin.textContent='Login';btnLogin.onclick=()=>openModal('loginModal');
    const btnReg=document.createElement('button');btnReg.className='btn btn-primary';btnReg.textContent='Sign Up';btnReg.onclick=()=>openModal('registerModal');
    area.appendChild(btnLogin);area.appendChild(btnReg);
    adminNavItem?.classList.add('hidden');
  }
}

function handleLogin(e){e.preventDefault();
  const email=document.getElementById('loginEmail').value.trim();
  const pwd=document.getElementById('loginPassword').value;
  const u = users.find(x=>x.email.toLowerCase()===email.toLowerCase() && x.password===pwd);
  if(!u){alert('Email atau password salah');return}
  currentUser={id:u.id,name:u.name,email:u.email,role:u.role}; save(LS_KEYS.CURRENT,currentUser);
  closeModal('loginModal'); renderNav(); alert('Login sukses'); showPage('home');
}
function handleRegister(e){e.preventDefault();
  const name=document.getElementById('regName').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const pwd=document.getElementById('regPassword').value;
  if(!name||!email||!pwd){alert('Isi semua field');return}
  if(users.find(u=>u.email.toLowerCase()===email.toLowerCase())){alert('Email sudah terdaftar');return}
  const newUser={id:Date.now(),name, email, password:pwd, role:'user'}; users.push(newUser); save(LS_KEYS.USERS,users);
  closeModal('registerModal'); alert('Registrasi sukses — silakan login');
}
function logout(){currentUser=null;localStorage.removeItem(LS_KEYS.CURRENT);renderNav();showPage('home');}

// small helper exposed to HTML
function openRegister(){openModal('registerModal')}

// -------------------------- Modal helpers --------------------------
function openModal(id){document.getElementById(id).classList.add('active')}
function closeModal(id){document.getElementById(id).classList.remove('active')}

// -------------------------- Date helper --------------------------
function setMinDate(){
  const today=new Date().toISOString().split('T')[0];
  const checkin=document.getElementById('checkin'); const checkout=document.getElementById('checkout');
  if(checkin) checkin.setAttribute('min',today);
  if(checkout) { const t=new Date(); t.setDate(t.getDate()+1); checkout.setAttribute('min', t.toISOString().split('T')[0]); }
}

// -------------------------- Show Page --------------------------
function showPage(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  if(page==='admin' && (!currentUser || currentUser.role!=='admin')){alert('Access denied: Admin only'); showPage('home'); return}
  document.getElementById(page+'Page')?.classList.remove('hidden');
  // special render
  if(page==='admin'){displayAdminHotels();displayAdminBookings()}
  if(page==='dashboard'){displayUserBookings()}
}

// -------------------------- Display hotel cards --------------------------
function createHotelCard(h){return `
  <div class="hotel-card" data-id="${h.id}" onclick="showHotelDetails(${h.id})">
    <img class="hotel-image" src="${h.image||'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI1MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMDAlIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2QzZDRkZiIvPjxyZWN0IHg9IjAiIHk9IjE1IiB3aWR0aD0iMTAwMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg=='}" alt="${h.name}">
    <div class="hotel-content">
      <div class="hotel-header"><div class="hotel-name">${h.name}</div><div class="hotel-rating">★ ${h.rating}</div></div>
      <div class="small hotel-location">📍 ${h.location}</div>
      <div style="margin-top:8px">${(h.amenities||[]).slice(0,3).map(a=>`<span class='small amenity-tag'>${a}</span>`).join(' ')}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
        <div><div class="small">Starting from</div><div class="price-amount">$${h.price}</div></div>
        <button class="btn btn-primary" style="height:36px" onclick="event.stopPropagation(); showHotelDetails(${h.id})">View</button>
      </div>
    </div>
  </div>`}

function displayHotels(list=hotels){document.getElementById('hotelsList').innerHTML=list.map(createHotelCard).join(''); displayFeaturedHotels();}
function displayFeaturedHotels(){const featured=hotels.filter(h=>h.deal).slice(0,3); document.getElementById('featuredHotels').innerHTML=featured.map(createHotelCard).join('')}

// -------------------------- Show Hotel Details & Booking --------------------------
let selectedHotel=null;
function showHotelDetails(id){
  selectedHotel=hotels.find(h=>h.id===id); if(!selectedHotel) return;
  document.getElementById('modalHotelName').textContent=selectedHotel.name;
  document.getElementById('modalHotelBody').innerHTML=`
    <div style="display:flex;gap:16px;align-items:flex-start">
      <div style="flex:1">
        <img src="${selectedHotel.image||'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjM0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjM0MCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=='}" style="width:100%;height:200px;object-fit:cover;border-radius:8px" alt="${selectedHotel.name}">
      </div>
      <div style="flex:1">
        <p class='small'>${selectedHotel.description}</p>
        <p class='small'>📍 ${selectedHotel.location}</p>
        <p class='small'>Amenities: ${(selectedHotel.amenities||[]).join(', ')}</p>
        <p class='small'>Price: $${selectedHotel.price} — Rating: ${selectedHotel.rating}</p>
        ${selectedHotel.deal?`<div class="hotel-badge" style="display:inline-block;margin-top:8px">${selectedHotel.deal}</div>`:''}
      </div>
    </div>
  `;
  document.getElementById('modalBookBtn').onclick=()=>{
    if(!currentUser){alert('Silakan login terlebih dahulu untuk booking'); openModal('loginModal'); return}
    openBooking(selectedHotel)
  };
  openModal('hotelModal')
}

function openBooking(hotel){
  closeModal('hotelModal');
  // grab dates from search inputs. if empty, default to today/tomorrow
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  let ci = checkin, co = checkout;
  if(!ci){
    const d = new Date(); ci = d.toISOString().split('T')[0];
  }
  if(!co){
    const d = new Date(); d.setDate(d.getDate()+1); co = d.toISOString().split('T')[0];
  }
  // sync hidden fields in booking modal
  document.getElementById('bkCheckin').value = ci;
  document.getElementById('bkCheckout').value = co;
  // prefill contact fields
  document.getElementById('bkEmail').value = currentUser?.email || '';
  const nameParts = (currentUser?.name||'').split(' ');
  document.getElementById('bkFirst').value = nameParts[0] || '';
  document.getElementById('bkLast').value = nameParts.slice(1).join(' ') || '';
  openModal('bookingModal');
}

function completeBooking(e){e.preventDefault();
  // validate dates (from hidden fields)
  const checkin=document.getElementById('bkCheckin').value; const checkout=document.getElementById('bkCheckout').value;
  if(!checkin||!checkout){alert('Tanggal tidak valid'); return}
  const ci=new Date(checkin); const co=new Date(checkout); if(co<=ci){alert('Tanggal check-out harus lebih besar dari check-in');return}
  const nights=Math.round((co-ci)/(1000*60*60*24));
  if(!selectedHotel){alert('Hotel tidak ditemukan'); return}
  const total=selectedHotel.price * nights;
  // gather contact
  const fname=document.getElementById('bkFirst').value.trim(); const lname=document.getElementById('bkLast').value.trim();
  const email=document.getElementById('bkEmail').value.trim(); const phone=document.getElementById('bkPhone').value.trim();
  if(!fname||!lname||!email||!phone){alert('Lengkapi data kontak');return}
  const booking={id:Date.now(),userId:currentUser.id,hotelId:selectedHotel.id,hotelName:selectedHotel.name,room:'Standard',checkin,checkout,nights,total,status:'Confirmed',date:new Date().toLocaleDateString(),contact:{fname,lname,email,phone}}
  bookings.push(booking); save(LS_KEYS.BOOKINGS,bookings); closeModal('bookingModal'); alert('Booking sukses!'); showPage('dashboard');
}

// -------------------------- Booking displays --------------------------
function displayUserBookings(){
  const container=document.getElementById('userBookings');
  if(!currentUser){container.innerHTML=`<div class='small'>Silakan login untuk melihat booking Anda.</div>`;return}
  const my=bookings.filter(b=>b.userId===currentUser?.id);
  if(my.length===0){container.innerHTML=`<div style='padding:40px;text-align:center' class='small'>Belum ada booking</div>`;return}
  container.innerHTML=my.map(b=>`<div class='hotel-card' style='margin-bottom:16px'><div class='hotel-content'><div style='display:flex;justify-content:space-between'><div><div style='font-weight:700'>${b.hotelName}</div><div class='small'>${b.room}</div></div><div style='font-weight:700;'>${b.status}</div></div><div style='display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:12px'><div><div class='small'>Check-in</div><div>${b.checkin}</div></div><div><div class='small'>Check-out</div><div>${b.checkout}</div></div><div><div class='small'>Nights</div><div>${b.nights}</div></div><div><div class='small'>Total</div><div style='color:var(--color-primary);font-weight:700;'>$${b.total}</div></div></div></div></div>`).join('');
}

function displayAdminBookings(){
  const container=document.getElementById('adminBookingsList');
  if(bookings.length===0){container.innerHTML='<div class="small">No bookings yet</div>';return}
  container.innerHTML=`<table class='table'><thead><tr><th>ID</th><th>Hotel</th><th>User</th><th>Check-in</th><th>Check-out</th><th>Total</th><th>Status</th></tr></thead><tbody>${bookings.map(b=>`<tr><td>#${b.id}</td><td>${b.hotelName}</td><td>${(users.find(u=>u.id===b.userId)||{}).email||'—'}</td><td>${b.checkin}</td><td>${b.checkout}</td><td>$${b.total}</td><td>${b.status}</td></tr>`).join('')}</tbody></table>`
}

// -------------------------- Admin: CRUD hotels --------------------------
function displayAdminHotels(){
  const container=document.getElementById('adminHotelsList');
  if(hotels.length===0){container.innerHTML='<div class="small">No hotels</div>';return}
  container.innerHTML=`<table class='table'><thead><tr><th>Hotel</th><th>Location</th><th>Price</th><th>Rating</th><th>Actions</th></tr></thead><tbody>${hotels.map(h=>`<tr><td>${h.name}</td><td>${h.location}</td><td>$${h.price}</td><td>${h.rating}</td><td><button class='btn btn-outline' onclick='openHotelForm("edit",${h.id})'>Edit</button> <button class='btn' style='background:#ef4444;color:#fff' onclick='deleteHotel(${h.id})'>Delete</button></td></tr>`).join('')}</tbody></table>`
}

function openHotelForm(mode,id){
  document.getElementById('hotelFormTitle').textContent = mode==='add' ? 'Add New Hotel' : 'Edit Hotel';
  if(mode==='add'){document.getElementById('hotelForm').reset();document.getElementById('hotelId').value=''; openModal('hotelFormModal');}
  else{
    const h=hotels.find(x=>x.id===id);if(!h) return;
    document.getElementById('hotelId').value=h.id;
    document.getElementById('hotelName').value=h.name;
    document.getElementById('hotelLocation').value=h.location;
    document.getElementById('hotelPrice').value=h.price;
    document.getElementById('hotelRating').value=h.rating;
    document.getElementById('hotelAmenities').value=h.amenities.join(',');
    document.getElementById('hotelStars').value=h.stars;
    document.getElementById('hotelDescription').value=h.description;
    document.getElementById('hotelImage').value=h.image||'';
    openModal('hotelFormModal')
  }
}

function saveHotelFromForm(e){e.preventDefault();
  const id=document.getElementById('hotelId').value;
  const name=document.getElementById('hotelName').value.trim();
  const location=document.getElementById('hotelLocation').value.trim();
  const price=Number(document.getElementById('hotelPrice').value);
  const rating=Number(document.getElementById('hotelRating').value);
  const amenities=document.getElementById('hotelAmenities').value.split(',').map(s=>s.trim()).filter(Boolean);
  const stars=Number(document.getElementById('hotelStars').value);
  const description=document.getElementById('hotelDescription').value;
  const image=document.getElementById('hotelImage').value;
  if(!name||!location) {alert('Isi semua field penting');return}
  if(id){const i=hotels.findIndex(h=>h.id==id);if(i>=0){hotels[i]=Object.assign({},hotels[i],{name,location,price,rating,amenities,stars,description,image});}}
  else{hotels.push({id:Date.now(),name,location,price,rating,amenities,stars,description,image});}
  save(LS_KEYS.HOTELS,hotels);displayAdminHotels();displayHotels();closeModal('hotelFormModal');alert('Saved')}
function deleteHotel(id){if(!confirm('Delete hotel?')) return; hotels=hotels.filter(h=>h.id!==id); save(LS_KEYS.HOTELS,hotels); displayAdminHotels(); displayHotels();}

// -------------------------- Search & Filters --------------------------
function searchHotels(e){e?.preventDefault(); const q=document.getElementById('destination').value.trim().toLowerCase(); applyFilters(q)}
function applyFilters(q=null){
  let list=[...hotels];
  const min=Number(document.getElementById('minPrice').value||0);
  const max=Number(document.getElementById('maxPrice').value||999999);
  list = list.filter(h=>h.price>=min && h.price<=max);
  // stars
  const starChecks=[...document.querySelectorAll('.star-filter:checked')].map(i=>Number(i.value));
  if(starChecks.length) list=list.filter(h=>starChecks.includes(Number(h.stars)));
  // amenities
  const amChecks=[...document.querySelectorAll('.amenity-filter:checked')].map(i=>i.value);
  if(amChecks.length) list=list.filter(h=>amChecks.every(a=>h.amenities.includes(a)));
  // search text
  if(!q) q=document.getElementById('destination').value.trim().toLowerCase();
  if(q){ list = list.filter(h=> (h.name+' '+h.location+' '+(h.amenities||[]).join(' ')).toLowerCase().includes(q)); showPage('listings'); }
  // sort
  const sortBy=document.getElementById('sortBy').value;
  if(sortBy==='price-low') list.sort((a,b)=>a.price-b.price);
  else if(sortBy==='price-high') list.sort((a,b)=>b.price-a.price);
  else if(sortBy==='rating') list.sort((a,b)=>b.rating-a.rating);
  displayHotels(list);
}
function resetFilters(){document.getElementById('minPrice').value=0;document.getElementById('maxPrice').value=500;document.querySelectorAll('.star-filter, .amenity-filter').forEach(i=>i.checked=false);document.getElementById('destination').value='';applyFilters();}

// -------------------------- Utils --------------------------
window.showPage=showPage;window.openModal=openModal;window.closeModal=closeModal;window.openHotelForm=openHotelForm;window.showHotelDetails=showHotelDetails;