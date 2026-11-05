
    // --- WINTER CATALOG DATASET (Strictly from the provided pricelist) ---
    const CATALOG = window.SHOP_DATA.products;

    // --- APPLICATION STATE ---
    let state = {
      currentRoute: 'home', search: '', favorites: [],
      activeCategoryFilter: 'all',
      appliedCoupon: null,
      couponDiscount: 0,
      cart: []
    };

    // --- ROUTER ENGINE ---
    function navigate(route) {
      if (!ROUTES.includes(route.split('/')[0])) route = 'home';
      state.currentRoute = route.split('/')[0];
      if (location.hash !== '#' + route) location.hash = route;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      renderApp();
      updateNavHighlight();
    }

    function updateNavHighlight() {
      const routes = ['stores','home', 'clothing', 'tzitzit', 'sales', 'arrangements', 'about'];
      routes.forEach(r => {
        const btn = document.getElementById(`nav-btn-${r}`);
        if (!btn) return;
        if (state.currentRoute === r) {
          btn.className = "text-primary font-bold border-b-2 border-primary pb-1 transition-all duration-200";
        } else {
          btn.className = "text-on-surface-variant font-normal hover:text-primary pb-1 transition-all duration-200";
        }
      });
    }

    // --- CART ACTIONS & PERSISTENCE ---
    function addToCart(itemId) {
      const product = CATALOG.find(p => p.id === itemId);
      if (!product) return;

      const existingIndex = state.cart.findIndex(i => i.id === itemId);
      if (existingIndex > -1) {
        state.cart[existingIndex].qty += 1;
      } else {
        state.cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          badge: product.badge,
          category: product.category
        });
      }
      showToast(`נוסף לסל: ${product.name}`);
      updateCartUI();
      if (state.currentRoute === 'cart') renderCartView();
    }

    function addBundleToCart(bundleName, bundlePrice, bundleId) {
      const existing = state.cart.find(i => i.id === bundleId);
      if (existing) { existing.qty++; updateCartUI(); showToast('המארז נוסף לסל'); return; }
      state.cart.push({
        id: bundleId,
        name: bundleName,
        price: bundlePrice,
        qty: 1,
        badge: 'מארז מוזל',
        category: 'bundle'
      });
      showToast(`המארז נוסף לסל: ${bundleName}`);
      updateCartUI();
      if (state.currentRoute === 'cart') renderCartView();
    }

    function updateCartQty(id, delta) {
      const item = state.cart.find(i => i.id === id);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) {
        removeFromCart(id);
      } else {
        updateCartUI();
        if (state.currentRoute === 'cart') renderCartView();
      }
    }

    function removeFromCart(id) {
      const item = state.cart.find(i => i.id === id);
      const name = item ? item.name : 'הפריט';
      state.cart = state.cart.filter(i => i.id !== id);
      showToast(`${name} הוסר מהסל`);
      updateCartUI();
      if (state.currentRoute === 'cart') renderCartView();
    }

    function clearEntireCart() {
      state.cart = [];
      updateCartUI();
      if (state.currentRoute === 'cart') renderCartView();
      showToast('הסל רוקן לחלוטין');
    }

    function calculateCartTotals() {
      const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
      const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const discount = state.appliedCoupon ? Math.round(subtotal * state.couponDiscount) : 0;
      const total = Math.max(0, subtotal - discount);
      return { count, subtotal, discount, total };
    }

    function updateCartUI() {
      persist();
      const { count, total } = calculateCartTotals();
      
      // Update Navbar Cart Badge
      const badge = document.getElementById('nav-cart-badge');
      if (badge) {
        badge.innerText = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      }

      // Update Drawer
      const drawerCount = document.getElementById('drawer-items-count');
      const drawerTotal = document.getElementById('drawer-total-price');
      if (drawerCount) drawerCount.innerText = `${count} פריטים`;
      if (drawerTotal) drawerTotal.innerText = `${total} ₪`;

      renderDrawerItems();
    }

    function renderDrawerItems() {
      const container = document.getElementById('drawer-items-list');
      if (!container) return;

      if (state.cart.length === 0) {
        container.innerHTML = `
          <div class="h-64 flex flex-col items-center justify-center text-center text-on-surface-variant">
            <span class="material-symbols-outlined text-4xl text-outline mb-2">shopping_bag</span>
            <p class="text-body-md font-body-md">עגלת הקניות שלך ריקה כעת</p>
            <button onclick="toggleCartDrawer(false); navigate('clothing');" class="mt-4 text-primary text-body-sm underline font-semibold">
              למעבר לחדר ביגוד
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = state.cart.map(item => `
        <div class="flex items-center justify-between p-3 border border-outline-variant/30 bg-surface-container-lowest">
          <div class="space-y-1">
            <div class="text-body-sm font-semibold">${item.name}</div>
            <div class="text-[12px] font-num text-on-surface-variant">${item.price} ₪ ליחידה</div>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center border border-outline-variant/60">
              <button onclick="updateCartQty('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center hover:bg-surface-container">-</button>
              <span class="w-6 text-center text-body-sm font-num">${item.qty}</span>
              <button onclick="updateCartQty('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center hover:bg-surface-container">+</button>
            </div>
            <span class="font-bold font-num text-body-sm">${item.price * item.qty} ₪</span>
            <button onclick="removeFromCart('${item.id}')" class="text-outline hover:text-error">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      `).join('');
    }

    // --- TOAST HELPER ---
    let toastTimer;
    function showToast(msg) {
      const toast = document.getElementById('toast');
      const message = document.getElementById('toast-message');
      if (!toast || !message) return;
      message.innerText = msg;
      toast.classList.remove('translate-y-20', 'opacity-0');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
      }, 2500);
    }

    // --- DRAWER TOGGLE ---
    function toggleCartDrawer(open) {
      const drawer = document.getElementById('cart-drawer');
      const scrim = document.getElementById('cart-drawer-scrim');
      drawer.inert = !open;
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        drawer.classList.remove('-translate-x-full');
        scrim.classList.remove('hidden');
        updateCartUI();
      } else {
        drawer.classList.add('-translate-x-full');
        scrim.classList.add('hidden');
      }
    }

    // --- MOBILE MENU ---
    function toggleMobileNav() {
      const nav = document.getElementById('mobile-nav');
      if (nav) nav.classList.toggle('hidden');
    }

    // --- MODALS ---
    function openCheckoutModal() {
      const modal = document.getElementById('checkout-modal');
      const { count, total } = calculateCartTotals();
      if (count === 0) {
        showToast('הסל ריק, הוסף פריטים טרם ביצוע הזמנה');
        return;
      }
      document.getElementById('modal-summary-count').innerText = `${count} פריטים`;
      document.getElementById('modal-summary-total').innerText = `${total} ₪`;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeCheckoutModal() {
      const modal = document.getElementById('checkout-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function showAuthModal() {
      const modal = document.getElementById('auth-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeAuthModal() {
      const modal = document.getElementById('auth-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function handleAuthLogin(e) {
      e.preventDefault();
      closeAuthModal();
      showToast('זוהי הדגמת התחברות בלבד — לא נפתח חשבון');
    }

    function handleCheckoutSubmit(e) {
      e.preventDefault();
      closeCheckoutModal();
      const code = 'YSH-' + Math.floor(100000 + Math.random() * 900000);
      state.cart = [];
      updateCartUI();
      showToast('ההזמנה הודגמה בהצלחה. לא בוצע חיוב ולא נשלחה הזמנה');
      navigate('home');
    }

    function applyVaadCoupon() {
      const input = document.getElementById('coupon-input');
      const val = input ? input.value.trim() : '';
      if (val === 'ועד_חברון' || val === 'ועד_פוניבז\'' || val === 'ועד_מיר') {
        state.appliedCoupon = val;
        state.couponDiscount = 0.15; // 15% discount for yeshiva vaad
        showToast(`קופון ${val} הוחל בהצלחה (15% הנחת ועד)`);
        updateCartUI(); renderCartView();
      } else if (val) {
        showToast('קוד ועד אינו תקין');
      }
    }

    function handleSearch(val) { state.search = val.trim(); if (state.currentRoute !== 'search') navigate('search'); else renderApp(); }

    // ==========================================
    // VIEW TEMPLATES (RENDER SYSTEM)
    // ==========================================

    function renderApp() {
      const viewContainer = document.getElementById('app-view');
      switch (state.currentRoute) {
        case 'product': viewContainer.innerHTML = getProductViewHTML(); break;
        case 'stores': viewContainer.innerHTML = getStoresViewHTML(); break;
        case 'search': viewContainer.innerHTML = getSearchView(); break;
        case 'favorites': viewContainer.innerHTML = getFavoritesView(); break;
        case 'home':
          viewContainer.innerHTML = getHomeViewHTML();
          initCountdown();
          break;
        case 'clothing':
          viewContainer.innerHTML = getClothingViewHTML();
          break;
        case 'tzitzit':
          viewContainer.innerHTML = getTzitzitViewHTML();
          break;
        case 'sales':
          viewContainer.innerHTML = getSalesViewHTML();
          initCountdown();
          break;
        case 'arrangements':
          viewContainer.innerHTML = getArrangementsViewHTML();
          break;
        case 'about':
          viewContainer.innerHTML = getAboutViewHTML();
          break;
        case 'cart':
          viewContainer.innerHTML = getCartViewHTML();
          break;
        default:
          viewContainer.innerHTML = getHomeViewHTML();
      }
    }

    // --- VIEW: HOME ---
    function getHomeViewHTML() {
      return `
        <div class="space-y-16">
          
          <!-- Editorial Hero Section -->
          <section class="relative bg-surface-container-low border border-outline-variant/30 overflow-hidden">
            <div class="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] items-stretch">
              
              <!-- Content Column (RTL Right side) -->
              <div class="lg:col-span-7 p-8 md:p-14 flex flex-col justify-between space-y-6">
                <div class="space-y-2">
                  <div class="inline-flex items-center gap-2 px-3 py-1 bg-surface-container border border-outline-variant/40 text-[11px] font-label-caps font-bold">
                    <span>קולקציית חורף תשפ״ז</span>
                    <span class="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    <span>BESPOCUT SARTORIAL</span>
                  </div>
                  <h1 class="text-display-hero-mobile md:text-display-hero font-display-hero text-on-surface leading-tight mt-2">
                    איכות ואלגנטיות לבני תורה.
                  </h1>
                  <p class="text-body-lg font-body-lg text-on-surface-variant max-w-xl">
                    סדרת חולצות Non-Iron 100% כותנה מצרית, מכנסי לייקרה בגזרה ישיבתית מוקפדת, וטליתות ישתבח מובחרות. מיוצר בסטנדרט חייטות אירופאי עילי בחלוקה בלעדית ישירות לישיבות.
                  </p>
                </div>

                <!-- Action Links -->
                <div class="space-y-4">
                  <div class="flex flex-wrap gap-4">
                    <button onclick="navigate('clothing')" class="bg-primary text-on-primary px-8 py-4 text-body-md font-bold hover:bg-inverse-surface transition-all flex items-center gap-2">
                      <span>לצפייה בחדר ביגוד</span>
                      <span class="material-symbols-outlined text-[18px]">arrow_back</span>
                    </button>
                    <button onclick="navigate('tzitzit')" class="border border-primary text-primary px-8 py-4 text-body-md font-bold hover:bg-primary hover:text-on-primary transition-all">
                      <span>חדר צצ"א וטליתות</span>
                    </button>
                  </div>

                  <div class="flex items-center gap-6 pt-4 border-t border-outline-variant/20 text-body-sm font-body-sm text-on-surface-variant">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-primary text-[18px]">verified</span>
                      <span>חייט מומחה בהיכל הישיבה</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
                      <span>איסוף עצמי מרוכז בלבד</span>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Visual Editorial Column -->
              <div class="lg:col-span-5 relative bg-primary flex items-center justify-center overflow-hidden min-h-[380px] lg:min-h-full">
                <img src="assets/editorial-0.jpg" alt="חליפה שחורה וחולצה לבנה — קולקציית BESPOCUT" 
                     data-alt="An ultra-sharp high-fashion editorial photo of an impeccably tailored, crisp pure white non-iron dress shirt and deep obsidian black wool suit fabric for a contemporary Yeshiva scholar. The lighting is bright and architectural with soft natural daylight, emphasizing clean razor-sharp seams, pristine Egyptian cotton texture, and serene intellectual minimalism." 
                     class="w-full h-full object-cover grayscale contrast-125 opacity-90 hover:scale-105 transition-transform duration-700">
                <div class="absolute bottom-4 right-4 bg-surface/90 backdrop-blur-md p-3 border border-outline-variant/30 text-right">
                  <div class="text-[10px] font-label-caps uppercase text-on-surface-variant">LOOK 01 // BESPOKE CUT</div>
                  <div class="text-body-sm font-bold">חולצת ואצ'י + מכנסי לייקרה</div>
                </div>
              </div>

            </div>
          </section>

          <!-- CATEGORY CHAPTERS (Bento Grid Navigation) -->
          <section class="space-y-6">
            <div class="flex items-end justify-between border-b border-outline-variant/40 pb-4">
              <div>
                <span class="text-label-caps font-label-caps text-on-surface-variant">עמודי התווך</span>
                <h2 class="text-headline-lg font-headline-lg">מחלקות המלתחה</h2>
              </div>
              <span class="text-body-sm text-on-surface-variant">חורף תשפ״ז</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <!-- Card 1: חדר ביגוד -->
              <div onclick="navigate('clothing')" class="group cursor-pointer bg-surface border border-outline-variant/30 p-6 flex flex-col justify-between h-72 hover:border-primary transition-all duration-300">
                <div class="flex justify-between items-start">
                  <span class="text-[12px] font-label-caps font-bold">01 // CLOTHING</span>
                  <span class="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_outward</span>
                </div>
                <div class="space-y-1">
                  <h3 class="text-headline-md font-headline-md group-hover:underline">חדר ביגוד</h3>
                  <p class="text-body-sm text-on-surface-variant">חולצות ואצ'י ואקסוס, מכנסי לייקרה אלגנטיות, הלבשה תחתונה, ונעליים.</p>
                </div>
                <div class="text-[12px] font-num text-primary font-bold">מ-85 ₪ לחולצה</div>
              </div>

              <!-- Card 2: חדר צצ"א -->
              <div onclick="navigate('tzitzit')" class="group cursor-pointer bg-surface border border-outline-variant/30 p-6 flex flex-col justify-between h-72 hover:border-primary transition-all duration-300">
                <div class="flex justify-between items-start">
                  <span class="text-[12px] font-label-caps font-bold">02 // TZITZIT</span>
                  <span class="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_outward</span>
                </div>
                <div class="space-y-1">
                  <h3 class="text-headline-md font-headline-md group-hover:underline">חדר צצ"א</h3>
                  <p class="text-body-sm text-on-surface-variant">טליתות ישתבח ממידה 55 עד 80, ציצית כותנה קשורה, פתילים בעבודת יד ותיקים.</p>
                </div>
                <div class="text-[12px] font-num text-primary font-bold">טלית ישתבח החל מ-275 ₪</div>
              </div>

              <!-- Card 3: מכירות ומארזים -->
              <div onclick="navigate('sales')" class="group cursor-pointer bg-primary-container text-on-primary border border-outline-variant/30 p-6 flex flex-col justify-between h-72 hover:bg-primary transition-all duration-300">
                <div class="flex justify-between items-start">
                  <span class="text-[12px] font-label-caps font-bold text-on-primary-container">03 // BUNDLES</span>
                  <span class="material-symbols-outlined text-white">bolt</span>
                </div>
                <div class="space-y-1">
                  <h3 class="text-headline-md font-headline-md text-white group-hover:underline">מכירות מיוחדות</h3>
                  <p class="text-body-sm text-on-primary-container">מארז סדר מלא, חבילות פנימייה, וקודי הנחה מרוכזים לוועדי ישיבות.</p>
                </div>
                <div class="text-[12px] font-num text-white font-bold">מארז סדר מלא ב-205 ₪</div>
              </div>

              <!-- Card 4: הסדרי ישיבות -->
              <div onclick="navigate('arrangements')" class="group cursor-pointer bg-surface border border-outline-variant/30 p-6 flex flex-col justify-between h-72 hover:border-primary transition-all duration-300">
                <div class="flex justify-between items-start">
                  <span class="text-[12px] font-label-caps font-bold">04 // YESHIVA VAAD</span>
                  <span class="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_outward</span>
                </div>
                <div class="space-y-1">
                  <h3 class="text-headline-md font-headline-md group-hover:underline">הסדרי ישיבות</h3>
                  <p class="text-body-sm text-on-surface-variant">תיאום חלוקות בישיבות (חברון, מיר, פוניבז'), סבסוד גבאים והצרות במקום.</p>
                </div>
                <div class="text-[12px] font-body-sm text-on-surface-variant">סניפים ועמדות פריסה</div>
              </div>

            </div>
          </section>

          <!-- PROMINENT POPULAR CATALOG HIGHLIGHTS (Direct Add to Cart) -->
          <section class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-label-caps font-label-caps text-on-surface-variant">נבחרת החורף</span>
                <h2 class="text-headline-lg font-headline-lg">פריטי יסוד לבחור ישיבה</h2>
              </div>
              <button onclick="navigate('clothing')" class="text-body-sm font-semibold underline underline-offset-4 hover:text-secondary">
                לכל המחירון הרשמי
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              ${CATALOG.slice(0, 4).map(product => `
                <div class="group border border-outline-variant/30 bg-surface flex flex-col justify-between transition-all duration-200 hover:border-primary">
                  ${productVisual(product)}
                  <div class="p-4 space-y-3">
                    <div class="flex justify-between items-start">
                      <span class="px-2 py-0.5 bg-surface-container text-[11px] font-label-caps font-bold text-on-surface">${product.badge}</span>
                      <span class="text-headline-sm font-label-price font-num font-bold">${product.price} ₪</span>
                    </div>
                    <div>
                      <h4 class="text-body-lg font-headline-sm font-semibold">${product.name}</h4>
                      <p class="text-body-sm font-body-sm text-on-surface-variant mt-1 line-clamp-2">${product.desc}</p>
                    </div>
                  </div>
                  <div class="p-4 pt-0">
                    <button onclick="addToCart('${product.id}')" class="w-full bg-primary text-on-primary py-2.5 text-body-sm font-bold hover:bg-inverse-surface transition-colors flex items-center justify-center gap-1.5">
                      <span class="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                      <span>הוסף לסל</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>

          <!-- WHY BESPOCUT / EDITORIAL COMMITMENTS -->
          <section class="bg-surface-container-high p-8 md:p-12 border border-outline-variant/30">
            <div class="max-w-3xl space-y-6">
              <span class="text-label-caps font-label-caps text-on-surface-variant">אמנת השירות והחזון</span>
              <h3 class="text-headline-lg font-headline-lg">מותאם ללוח הזמנים של היכלי התורה.</h3>
              <p class="text-body-lg font-body-lg text-on-surface-variant">
                אנו מבינים את ערך הזמן של בן ישיבה. לכן, אין צורך בבזבוז שעות בחיפושים בקניונים או המתנה למשלוחים ביתיים. 
                מערך החלוקה של BESPOCUT מגיע ישירות למתחם הישיבה בזמני ההפסקות, בליווי חייט מומחה המבצע מדידה והתאמת מכפלת מידית.
              </p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-outline-variant/40">
                <div class="space-y-1">
                  <div class="font-bold text-body-md">ללא שליחים חיצוניים</div>
                  <div class="text-body-sm text-on-surface-variant">איסוף מסודר מההיכל ללא הפרעה לסדרים.</div>
                </div>
                <div class="space-y-1">
                  <div class="font-bold text-body-md">חייט במקום</div>
                  <div class="text-body-sm text-on-surface-variant">הצרות ומכפלות מדויקות ללא תשלום נוסף.</div>
                </div>
                <div class="space-y-1">
                  <div class="font-bold text-body-md">איכות מובטחת Non-Iron</div>
                  <div class="text-body-sm text-on-surface-variant">עמידות לכביסות הפנימייה לאורך כל הזמן.</div>
                </div>
              </div>
            </div>
          </section>

          <!-- COUNTDOWN BANNER -->
          <section class="bg-primary text-on-primary p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="space-y-1 text-center md:text-right">
              <span class="text-[11px] font-label-caps text-on-primary-container">מכירת זמן חורף המרוכזת</span>
              <div class="text-headline-md font-headline-md text-white">החלוקה המרכזית הבאה נסגרת בעוד:</div>
            </div>
            <div id="home-timer-grid" class="flex items-center gap-3 font-num text-center">
              <div class="bg-surface/10 p-3 w-16">
                <div id="days" class="text-headline-md font-bold text-white">03</div>
                <div class="text-[10px] text-on-primary-container uppercase font-label-caps">ימים</div>
              </div>
              <span class="text-xl font-bold">:</span>
              <div class="bg-surface/10 p-3 w-16">
                <div id="hours" class="text-headline-md font-bold text-white">14</div>
                <div class="text-[10px] text-on-primary-container uppercase font-label-caps">שעות</div>
              </div>
              <span class="text-xl font-bold">:</span>
              <div class="bg-surface/10 p-3 w-16">
                <div id="minutes" class="text-headline-md font-bold text-white">28</div>
                <div class="text-[10px] text-on-primary-container uppercase font-label-caps">דקות</div>
              </div>
              <span class="text-xl font-bold">:</span>
              <div class="bg-surface/10 p-3 w-16">
                <div id="seconds" class="text-headline-md font-bold text-white">45</div>
                <div class="text-[10px] text-on-primary-container uppercase font-label-caps">שניות</div>
              </div>
            </div>
            <button onclick="navigate('sales')" class="bg-white text-primary px-6 py-3 text-body-sm font-bold hover:bg-surface-container transition-colors">
              הבטח מקומך בחלוקה
            </button>
          </section>

        </div>
      `;
    }

    // --- VIEW: CLOTHING DEPARTMENT (חורף תשפ"ה PRICELIST) ---
    function getClothingViewHTML() {
      const items = state.activeCategoryFilter === 'all' 
        ? CATALOG.filter(i => i.category === 'clothing')
        : CATALOG.filter(i => i.category === 'clothing' && i.subcat === state.activeCategoryFilter);

      return `
        <div class="space-y-8">
          
          <!-- Header and Filters -->
          <div class="space-y-4">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-4">
              <div>
                <span class="text-label-caps font-label-caps text-on-surface-variant">מחלקת הלבשה רשמית</span>
                <h1 class="text-headline-lg font-headline-lg">חדר ביגוד — מחירון חורף תשפ״ז</h1>
              </div>
              <div class="text-body-sm text-on-surface-variant">
                <span>מציג ${items.length} פריטים</span>
              </div>
            </div>

            <!-- Filter Pills -->
            <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              <button onclick="filterClothing('all')" class="px-4 py-2 text-body-sm font-medium border ${state.activeCategoryFilter === 'all' ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant/40 hover:border-primary'} transition-all">
                הכל
              </button>
              <button onclick="filterClothing('shirts_pants')" class="px-4 py-2 text-body-sm font-medium border ${state.activeCategoryFilter === 'shirts_pants' ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant/40 hover:border-primary'} transition-all">
                חולצות ומכנסיים
              </button>
              <button onclick="filterClothing('underwear')" class="px-4 py-2 text-body-sm font-medium border ${state.activeCategoryFilter === 'underwear' ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant/40 hover:border-primary'} transition-all">
                גופיות והלבשה תחתונה
              </button>
              <button onclick="filterClothing('socks')" class="px-4 py-2 text-body-sm font-medium border ${state.activeCategoryFilter === 'socks' ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant/40 hover:border-primary'} transition-all">
                גרביים
              </button>
              <button onclick="filterClothing('accessories')" class="px-4 py-2 text-body-sm font-medium border ${state.activeCategoryFilter === 'accessories' ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant/40 hover:border-primary'} transition-all">
                עניבות ואביזרים
              </button>
            </div>
          </div>

          <!-- Product Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${items.map(product => `
              <div class="group border border-outline-variant/30 bg-surface flex flex-col justify-between hover:border-primary transition-all duration-300">
                ${productVisual(product)}<div class="p-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-label-caps font-bold px-2.5 py-0.5 bg-surface-container text-on-surface">${product.badge}</span>
                    <span class="text-headline-sm font-label-price font-num font-bold text-primary">${product.price} ₪</span>
                  </div>
                  <div>
                    <h3 class="text-headline-sm font-headline-sm font-semibold">${product.name}</h3>
                    <p class="text-body-sm font-body-sm text-on-surface-variant mt-2 leading-relaxed">${product.desc}</p>
                  </div>
                </div>

                <div class="p-6 pt-0 border-t border-outline-variant/15 flex items-center justify-between gap-4">
                  <span class="text-[12px] text-on-surface-variant">איסוף בהיכל הישיבה</span>
                  <button onclick="addToCart('${product.id}')" class="bg-primary text-on-primary px-5 py-2.5 text-body-sm font-bold hover:bg-inverse-surface transition-colors flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                    <span>הוסף לסל</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Tailor Service Note -->
          <div class="bg-surface-container p-6 border-r-4 border-primary flex items-start gap-4">
            <span class="material-symbols-outlined text-primary text-2xl">straighten</span>
            <div>
              <h4 class="font-bold text-body-md">שירות חייטות צמוד בעת החלוקה</h4>
              <p class="text-body-sm text-on-surface-variant mt-1">
                כל המכנסיים נמסרים עם חייט במקום המבצע מדידת אורך מדויקת ומכפלת איכותית במקום ללא תשלום נוסף.
                שימו לב: אין שירותי חייטות אישית או תפירה בהזמנה אישית – שירות ההתאמה מיועד למכפלות והצרות של מוצרינו בלבד.
              </p>
            </div>
          </div>

        </div>
      `;
    }

    function filterClothing(subcat) {
      state.activeCategoryFilter = subcat;
      renderApp();
    }

    // --- VIEW: TZITZIT DEPARTMENT (חדר צצ"א) ---
    function getTzitzitViewHTML() {
      const items = CATALOG.filter(i => i.category === 'tzitzit');

      return `
        <div class="space-y-12">
          
          <div class="border-b border-outline-variant/30 pb-4">
            <span class="text-label-caps font-label-caps text-on-surface-variant">הידור מצווה לבני ישיבות</span>
            <h1 class="text-headline-lg font-headline-lg">חדר צצ"א — טליתות, ציציות ותשמישי קדושה</h1>
            <p class="text-body-md text-on-surface-variant mt-1">צמר רחלין נקי, קשירות מהודרות לפי מנהגי כל העדות, ותיקי טלית איכותיים לחיי הפנימייה.</p>
          </div>

          <!-- Halachic Guide & Sizing Selector Box -->
          <div class="bg-surface-container-low p-6 md:p-8 border border-outline-variant/40 space-y-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">menu_book</span>
              <h3 class="text-headline-sm font-headline-sm">מדריך מידות טלית ישתבח והתאמת קשירה</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-body-sm">
              <div class="p-4 bg-surface border border-outline-variant/20 space-y-1">
                <div class="font-bold text-on-surface">מידות 70 ו-80 (הנפוץ בישיבות)</div>
                <div class="text-on-surface-variant">מתאים לבחורים מגובה 1.70 מ' ומעלה. רוחב מספיק לכיסוי הראש והגוף בהידור רב.</div>
              </div>
              <div class="p-4 bg-surface border border-outline-variant/20 space-y-1">
                <div class="font-bold text-on-surface">מידות 55 ו-60</div>
                <div class="text-on-surface-variant">אידיאלי לתפילות ימי החול ולישיבות קטנות / שיעור א'. משקל קליל ונוחות מרבית.</div>
              </div>
              <div class="p-4 bg-surface border border-outline-variant/20 space-y-1">
                <div class="font-bold text-on-surface">מנהגי קשירת פתילים</div>
                <div class="text-on-surface-variant">ניתן לבחור קשירה אשכנזית קלאסית, קשירת ספרדית (עשרה שבעה שמונה שש) או מנהג חב"ד.</div>
              </div>
            </div>
          </div>

          <!-- Tzitzit Products -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${items.map(item => `
              <div class="border border-outline-variant/30 bg-surface flex flex-col justify-between hover:border-primary transition-all duration-300">
                ${productVisual(item)}<div class="p-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-label-caps font-bold px-2.5 py-0.5 bg-surface-container text-on-surface">${item.badge}</span>
                    <span class="text-headline-sm font-label-price font-num font-bold text-primary">${item.price} ₪</span>
                  </div>
                  <div>
                    <h3 class="text-headline-sm font-headline-sm font-semibold">${item.name}</h3>
                    <p class="text-body-sm font-body-sm text-on-surface-variant mt-2 leading-relaxed">${item.desc}</p>
                  </div>
                </div>

                <div class="p-6 pt-0 border-t border-outline-variant/15 flex items-center justify-between gap-4">
                  <span class="text-[12px] text-on-surface-variant">מהדרין מן המהדרין</span>
                  <button onclick="addToCart('${item.id}')" class="bg-primary text-on-primary px-5 py-2.5 text-body-sm font-bold hover:bg-inverse-surface transition-colors flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                    <span>הוסף לסל</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

        </div>
      `;
    }

    // --- VIEW: SALES & BUNDLES (מכירות מיוחדות) ---
    function getSalesViewHTML() {
      return `
        <div class="space-y-12">
          
          <div class="border-b border-outline-variant/30 pb-4">
            <span class="text-label-caps font-label-caps text-on-surface-variant">מבצעי זמן חורף</span>
            <h1 class="text-headline-lg font-headline-lg">מארזים מרוכזים ומבצעי ועדים</h1>
            <p class="text-body-md text-on-surface-variant mt-1">חיסכון מרוכז לרכישת סדרת חולצות, סטים שלמים לחיי הפנימייה וסבסוד ועדי תלמידים.</p>
          </div>

          <!-- Featured Bundle Rack -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <!-- Bundle 1 -->
            <div class="border-2 border-primary bg-surface p-8 flex flex-col justify-between space-y-6">
              <div class="space-y-4">
                <div class="inline-block bg-primary text-on-primary px-3 py-1 text-label-caps font-label-caps font-bold">
                  מארז סדר מלא — החיסכון הישיבתי
                </div>
                <h3 class="text-headline-md font-headline-md">חולצת ואצ'י + מכנסי לייקרה + עניבת רקורד</h3>
                <p class="text-body-md text-on-surface-variant leading-relaxed">
                  השילוב המושלם ליומיום ולשבת. חולצת Non-Iron כותנה מצרית איכותית, מכנסיים גמישות עם מכפלת חינם, ועניבת משי במרקם יוקרתי.
                </p>
                <div class="p-4 bg-surface-container space-y-1 text-body-sm">
                  <div class="flex justify-between">
                    <span>מחיר פריטים בנפרד:</span>
                    <span class="line-through font-num text-on-surface-variant">215 ₪</span>
                  </div>
                  <div class="flex justify-between font-bold text-headline-sm">
                    <span>מחיר במארז מרוכז:</span>
                    <span class="font-num text-primary">205 ₪</span>
                  </div>
                </div>
              </div>

              <button onclick="addBundleToCart('מארז סדר מלא (חולצה + מכנסי לייקרה + עניבה)', 205, 'b_seder')" class="w-full bg-primary text-on-primary py-4 text-body-md font-bold hover:bg-inverse-surface transition-colors flex items-center justify-center gap-2">
                <span class="material-symbols-outlined">add_shopping_cart</span>
                <span>הוסף מארז סדר מלא לסל (205 ₪)</span>
              </button>
            </div>

            <!-- Bundle 2 -->
            <div class="border border-outline-variant/40 bg-surface-container-low p-8 flex flex-col justify-between space-y-6">
              <div class="space-y-4">
                <div class="inline-block bg-surface-container-high border border-outline-variant px-3 py-1 text-label-caps font-label-caps font-bold">
                  מארז פנימייה חורפי
                </div>
                <h3 class="text-headline-md font-headline-md">3 גופיות לייקרה + 5 זוגות גרביים לורנס</h3>
                <p class="text-body-md text-on-surface-variant leading-relaxed">
                  כל מה שצריך לרענון ארון הפנימייה לעונת החורף. בדי כותנה נעימים וסריגים נושמים המותאמים לכביסה ישיבתית מרוכזת.
                </p>
                <div class="p-4 bg-surface space-y-1 text-body-sm border border-outline-variant/20">
                  <div class="flex justify-between">
                    <span>מחיר פריטים בנפרד:</span>
                    <span class="line-through font-num text-on-surface-variant">135 ₪</span>
                  </div>
                  <div class="flex justify-between font-bold text-headline-sm">
                    <span>מחיר במארז מרוכז:</span>
                    <span class="font-num text-primary">120 ₪</span>
                  </div>
                </div>
              </div>

              <button onclick="addBundleToCart('מארז פנימייה חורפי (3 גופיות + 5 גרביים)', 120, 'b_pnimya')" class="w-full bg-surface-container-highest text-on-surface py-4 text-body-md font-bold hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-2">
                <span class="material-symbols-outlined">add_shopping_cart</span>
                <span>הוסף מארז פנימייה לסל (120 ₪)</span>
              </button>
            </div>

          </div>

          <!-- Vaad Discount Callout -->
          <div class="bg-primary text-on-primary p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="space-y-2 text-right">
              <div class="text-label-caps font-label-caps text-on-primary-container">ועדי ישיבות בלבד</div>
              <h3 class="text-headline-md font-headline-md">קוד הנחה מרוכז: 15% הנחה לנציגי הוועד</h3>
              <p class="text-body-sm text-on-primary-container max-w-xl">
                תלמידי ישיבות חברון, פוניבז' ומיר – הזינו בעגלת הקניות את קוד הוועד הרשמי (לדוג׳: "ועד_חברון", "ועד_פוניבז'") לקבלת סבסוד ישיר.
              </p>
            </div>
            <button onclick="navigate('cart')" class="bg-white text-primary px-6 py-3 text-body-sm font-bold hover:bg-surface-container transition-colors whitespace-nowrap">
              מעבר לעגלה להזנת קוד
            </button>
          </div>

        </div>
      `;
    }

    // --- VIEW: ARRANGEMENTS (הסדרי ישיבות) ---
    function getArrangementsViewHTML() {
      return `
        <div class="space-y-12">
          
          <div class="border-b border-outline-variant/30 pb-4">
            <span class="text-label-caps font-label-caps text-on-surface-variant">מערך הפריסה הרשמי</span>
            <h1 class="text-headline-lg font-headline-lg">הסדרי ישיבות ותחנות חלוקה</h1>
            <p class="text-body-md text-on-surface-variant mt-1">מערך לוגיסטי ייחודי המביא את הביגוד והחייטות ישירות למתחם הישיבה.</p>
          </div>

          <!-- 3 Tracks Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 border border-outline-variant/30 bg-surface space-y-3">
              <div class="w-10 h-10 bg-surface-container flex items-center justify-center font-bold font-num">01</div>
              <h3 class="text-headline-sm font-headline-sm">מסלול ועד ישיבה</h3>
              <p class="text-body-sm text-on-surface-variant">
                תיאום מרוכז מול גבאי הישיבה לקבלת יום חלוקה ייעודי ברחבת הפנימייה או אולם הספחים, כולל סבסוד מרוכז והנחות ועד.
              </p>
            </div>
            <div class="p-6 border border-outline-variant/30 bg-surface space-y-3">
              <div class="w-10 h-10 bg-surface-container flex items-center justify-center font-bold font-num">02</div>
              <h3 class="text-headline-sm font-headline-sm">תווי קנייה וסבסוד</h3>
              <p class="text-body-sm text-on-surface-variant">
                כיבוד תווי קנייה של קרנות עזר לנישואין, קמחא דפסחא, וועדי סיוע לבני תורה בישיבות המובילות בארץ.
              </p>
            </div>
            <div class="p-6 border border-outline-variant/30 bg-surface space-y-3">
              <div class="w-10 h-10 bg-surface-container flex items-center justify-center font-bold font-num">03</div>
              <h3 class="text-headline-sm font-headline-sm">עמדת חייט בהיכל</h3>
              <p class="text-body-sm text-on-surface-variant">
                בכל יום חלוקה מוצב חייט מקצועי מטעם BESPOCUT עם מכונת תפירה ייעודית למכפלות והצרות מידיות של המכנסיים.
              </p>
            </div>
          </div>

          <!-- Stations List -->
          <div class="space-y-4">
            <h3 class="text-headline-md font-headline-md">תחנות חלוקה מרכזיות לשבוע הקרוב</h3>
            <div class="divide-y divide-outline-variant/20 border border-outline-variant/30 bg-surface">
              <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div class="font-bold text-body-lg">ישיבת חברון — כנסת ישראל (גבעת מרדכי, ירושלים)</div>
                  <div class="text-body-sm text-on-surface-variant">מיקום: רחבת חדר האוכל הישן • שעות פעילות: 14:00 - 18:30</div>
                </div>
                <span class="px-3 py-1 bg-surface-container text-body-sm font-medium">יום ראשון | י״ח חשוון</span>
              </div>
              <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div class="font-bold text-body-lg">ישיבת מיר (בית ישראל, ירושלים)</div>
                  <div class="text-body-sm text-on-surface-variant">מיקום: מתחם פרידמן • שעות פעילות: 13:30 - 20:00</div>
                </div>
                <span class="px-3 py-1 bg-surface-container text-body-sm font-medium">יום שני | י״ט חשוון</span>
              </div>
              <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div class="font-bold text-body-lg">ישיבת פוניבז' (גבעת הישיבה, בני ברק)</div>
                  <div class="text-body-sm text-on-surface-variant">מיקום: כניסה לבית ברזיל • שעות פעילות: 14:00 - 19:00</div>
                </div>
                <span class="px-3 py-1 bg-surface-container text-body-sm font-medium">יום שלישי | כ׳ חשוון</span>
              </div>
              <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div class="font-bold text-body-lg">ישיבת תושיה — תפרח</div>
                  <div class="text-body-sm text-on-surface-variant">מיקום: מבואת הפנימייה המרכזית • שעות פעילות: 13:00 - 16:30</div>
                </div>
                <span class="px-3 py-1 bg-surface-container text-body-sm font-medium">יום חמישי | כ״ב חשוון</span>
              </div>
            </div>
          </div>

          <!-- Gabbaim Contact Form -->
          <div class="bg-surface-container-low p-8 border border-outline-variant/30 max-w-2xl">
            <h3 class="text-headline-sm font-headline-sm mb-2">פניית גבאי / נציג ועד לתיאום חלוקה</h3>
            <p class="text-body-sm text-on-surface-variant mb-6">מלא את הפרטים ונציג קשרי ישיבות יחזור אליך תוך יום עסקים לתיאום מועד.</p>
            <form onsubmit="handleGabbaiForm(event)" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-body-sm mb-1">שם הגבאי / הנציג</label>
                  <input type="text" required class="w-full bg-surface border border-outline-variant px-3 py-2 text-body-sm focus:border-primary focus:outline-none">
                </div>
                <div>
                  <label class="block text-body-sm mb-1">שם הישיבה והעיר</label>
                  <input type="text" required class="w-full bg-surface border border-outline-variant px-3 py-2 text-body-sm focus:border-primary focus:outline-none">
                </div>
              </div>
              <div>
                <label class="block text-body-sm mb-1">טלפון ליצירת קשר</label>
                <input type="tel" required class="w-full bg-surface border border-outline-variant px-3 py-2 text-body-sm focus:border-primary focus:outline-none text-right">
              </div>
              <button type="submit" class="bg-primary text-on-primary px-6 py-3 text-body-sm font-bold hover:bg-inverse-surface transition-colors">
                שלח בקשת תיאום חלוקה
              </button>
            </form>
          </div>

        </div>
      `;
    }

    function handleGabbaiForm(e) {
      e.preventDefault();
      showToast('הטופס הודגם בהצלחה. המידע לא נשלח לשרת');
      e.target.reset();
    }

    // --- VIEW: ABOUT (אודות והחזון) ---
    function getAboutViewHTML() {
      return `
        <div class="space-y-12 max-w-4xl mx-auto">
          
          <div class="border-b border-outline-variant/30 pb-4 text-center">
            <span class="text-label-caps font-label-caps text-on-surface-variant">SARTORIAL PHILOSOPHY</span>
            <h1 class="text-headline-lg font-headline-lg mt-1">מלבושי כבוד לבני תורה</h1>
            <p class="text-body-lg text-on-surface-variant max-w-xl mx-auto mt-2">
              האיזון המושלם בין גזרת הלבוש המסורתית המכבדת לבין איכות טקסטיל מודרנית ברמת פרימיום.
            </p>
          </div>

          <div class="space-y-6 text-body-lg font-body-lg text-on-surface leading-relaxed">
            <p>
              מותג <strong>מעמד ישיבתי | BESPOCUT</strong> נוסד מתוך הבנה עמוקה של צורכי בן הישיבה בימינו. תלמיד חכם ראוי שיהא מלבושו נקי ומכובד, כראוי לנושאי כלי ה׳. 
            </p>
            <p>
              אנו בוחרים בקפידה בדי כותנה מצרית איכותיים בעלי תכונות <strong>Non-Iron אמיתיות</strong>, כך שהחולצה שומרת על מראה מגוהץ, מתוח ורענן לאורך כל ימי השבוע, גם בתנאי הפנימייה המאתגרים.
            </p>
          </div>

          <!-- Service Rules Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-low p-8 border border-outline-variant/30">
            <div class="space-y-3">
              <div class="flex items-center gap-2 font-bold text-headline-sm">
                <span class="material-symbols-outlined text-primary">storefront</span>
                <span>איסוף עצמי מרוכז בישיבות</span>
              </div>
              <p class="text-body-sm text-on-surface-variant">
                אנו פועלים ללא חנויות ראווה מנקרות עיניים וללא משלוחים יקרים עד הבית. החיסכון הלוגיסטי מגולגל ישירות למחיר הצרכן לבחורי הישיבות.
              </p>
            </div>
            <div class="space-y-3">
              <div class="flex items-center gap-2 font-bold text-headline-sm">
                <span class="material-symbols-outlined text-primary">content_cut</span>
                <span>חייטות התאמה בלבד</span>
              </div>
              <p class="text-body-sm text-on-surface-variant">
                שירות החייט המלווה את החלוקה נועד אך ורק להצרות קלות והתאמת אורך מכפלת למכנסיים שנרכשו אצלנו, על מנת להבטיח הופעה נקייה ומכובדת.
              </p>
            </div>
          </div>

          <div class="text-center pt-6">
            <button onclick="navigate('clothing')" class="bg-primary text-on-primary px-8 py-3.5 text-body-md font-bold hover:bg-inverse-surface transition-colors">
              למעבר למחירון הרשמי
            </button>
          </div>

        </div>
      `;
    }

    // --- VIEW: CART (עגלת קניות מלאה) ---
    function getCartViewHTML() {
      const { count, subtotal, discount, total } = calculateCartTotals();

      if (state.cart.length === 0) {
        return `
          <div class="py-20 text-center space-y-4 max-w-md mx-auto">
            <span class="material-symbols-outlined text-6xl text-outline">shopping_bag</span>
            <h2 class="text-headline-md font-headline-md">עגלת הקניות שלך ריקה</h2>
            <p class="text-body-sm text-on-surface-variant">לא נמצאו פריטים בסל. בחר פריטים מחדר הביגוד או מחדר צצ״א לקראת החלוקה הקרובה.</p>
            <div class="pt-4 flex justify-center gap-4">
              <button onclick="navigate('clothing')" class="bg-primary text-on-primary px-6 py-3 text-body-sm font-bold hover:bg-inverse-surface transition-colors">
                לחדר ביגוד
              </button>
              <button onclick="navigate('tzitzit')" class="border border-primary text-primary px-6 py-3 text-body-sm font-bold hover:bg-primary hover:text-on-primary transition-colors">
                לחדר צצ"א
              </button>
            </div>
          </div>
        `;
      }

      return `
        <div class="space-y-8">
          
          <div class="border-b border-outline-variant/30 pb-4 flex items-center justify-between">
            <div>
              <span class="text-label-caps font-label-caps text-on-surface-variant">סיכום הזמנה</span>
              <h1 class="text-headline-lg font-headline-lg">סל הקניות הישיבתי</h1>
            </div>
            <button onclick="clearEntireCart()" class="text-body-sm text-error hover:underline flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">delete_sweep</span>
              <span>רוקן סל</span>
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- Items Table (Cols 8) -->
            <div class="lg:col-span-8 space-y-4">
              <div class="border border-outline-variant/30 bg-surface divide-y divide-outline-variant/20">
                ${state.cart.map(item => `
                  <div class="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 bg-surface-container text-[10px] font-label-caps font-bold">${item.badge || 'ביגוד'}</span>
                        <h4 class="text-body-lg font-bold">${item.name}</h4>
                      </div>
                      <div class="text-body-sm text-on-surface-variant font-num">${item.price} ₪ ליחידה</div>
                    </div>

                    <div class="flex items-center justify-between sm:justify-end gap-6">
                      <!-- Quantity Adjuster -->
                      <div class="flex items-center border border-outline-variant">
                        <button onclick="updateCartQty('${item.id}', -1)" class="w-8 h-8 flex items-center justify-center hover:bg-surface-container text-body-lg font-bold">-</button>
                        <span class="w-10 text-center font-num text-body-md font-bold">${item.qty}</span>
                        <button onclick="updateCartQty('${item.id}', 1)" class="w-8 h-8 flex items-center justify-center hover:bg-surface-container text-body-lg font-bold">+</button>
                      </div>

                      <!-- Subtotal for item -->
                      <div class="text-left min-w-[70px]">
                        <span class="text-headline-sm font-num font-bold text-primary">${item.price * item.qty} ₪</span>
                      </div>

                      <!-- Delete -->
                      <button onclick="removeFromCart('${item.id}')" class="text-outline hover:text-error p-1">
                        <span class="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>

              <div class="bg-surface-container-low p-4 border border-outline-variant/30 flex items-center justify-between text-body-sm">
                <span>רוצה להוסיף עוד פריטים?</span>
                <button onclick="navigate('clothing')" class="text-primary font-bold underline">המשך בקניות בחדר ביגוד</button>
              </div>
            </div>

            <!-- Order Summary Sidebar (Cols 4) -->
            <div class="lg:col-span-4 border border-outline-variant/40 bg-surface p-6 space-y-6 sticky top-28">
              <h3 class="text-headline-sm font-headline-sm border-b border-outline-variant/20 pb-3">סיכום לתשלום</h3>
              
              <!-- Coupon Area -->
              <div class="space-y-2">
                <label class="block text-body-sm font-medium">קוד ועד ישיבה / סבסוד</label>
                <div class="flex gap-2">
                  <input type="text" id="coupon-input" placeholder="לדוג׳: ועד_חברון" value="${state.appliedCoupon || ''}" class="flex-grow bg-surface-container-low border border-outline-variant px-3 py-2 text-body-sm focus:border-primary focus:outline-none">
                  <button onclick="applyVaadCoupon()" class="bg-primary text-on-primary px-4 text-body-sm font-semibold hover:bg-inverse-surface transition-colors">
                    החל
                  </button>
                </div>
                <div class="text-[11px] text-on-surface-variant">קודי ועדים פעילים לדוגמה: ועד_חברון, ועד_פוניבז', ועד_מיר</div>
              </div>

              <!-- Price Breakdown -->
              <div class="space-y-2 border-t border-outline-variant/20 pt-4 text-body-sm">
                <div class="flex justify-between">
                  <span>סה״כ פריטים (${count}):</span>
                  <span class="font-num">${subtotal} ₪</span>
                </div>
                ${discount > 0 ? `
                  <div class="flex justify-between text-error font-medium">
                    <span>הנחת ועד ישיבה (15%):</span>
                    <span class="font-num">-${discount} ₪</span>
                  </div>
                ` : ''}
                <div class="flex justify-between">
                  <span>משלוח והפצה:</span>
                  <span class="font-bold text-primary">חינם (איסוף ישיבתי)</span>
                </div>
                <div class="flex justify-between">
                  <span>התאמת מכפלת חייט:</span>
                  <span class="font-bold text-primary">חינם במקום</span>
                </div>

                <div class="border-t border-outline-variant/30 pt-3 flex justify-between items-center text-headline-sm font-headline-sm font-bold">
                  <span>לתשלום:</span>
                  <span class="font-num text-headline-md text-primary">${total} ₪</span>
                </div>
              </div>

              <!-- Checkout Trigger -->
              <button onclick="openCheckoutModal()" class="w-full bg-primary text-on-primary py-4 text-body-md font-bold hover:bg-inverse-surface transition-colors flex items-center justify-center gap-2">
                <span>המשך להדגמת הזמנה</span>
                <span class="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>

              <div class="text-[11px] text-on-surface-variant leading-relaxed text-center">
                אב־טיפוס עיצובי · ההזמנה והתשלום להדגמה בלבד.
              </div>
            </div>

          </div>

        </div>
      `;
    }

    function renderCartView() {
      const container = document.getElementById('app-view');
      if (container && state.currentRoute === 'cart') {
        container.innerHTML = getCartViewHTML();
      }
    }

    // --- COUNTDOWN TIMER LOGIC ---
    let timerInterval;
    function initCountdown() {
      clearInterval(timerInterval);
      const deadline = Date.now() + (3 * 86400 + 14 * 3600 + 28 * 60 + 45) * 1000;
      let storedDeadline;
      try { storedDeadline = Number(sessionStorage.getItem('bespocut-deadline')) || deadline; sessionStorage.setItem('bespocut-deadline', storedDeadline); } catch { storedDeadline = deadline; }
      let totalSeconds = Math.max(0, Math.floor((storedDeadline - Date.now()) / 1000));

      timerInterval = setInterval(() => {
        totalSeconds--;
        if (totalSeconds <= 0) {
          clearInterval(timerInterval);
          return;
        }

        const d = Math.floor(totalSeconds / 86400);
        const h = Math.floor((totalSeconds % 86400) / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        const dEl = document.getElementById('days');
        const hEl = document.getElementById('hours');
        const mEl = document.getElementById('minutes');
        const sEl = document.getElementById('seconds');

        if (dEl) dEl.innerText = String(d).padStart(2, '0');
        if (hEl) hEl.innerText = String(h).padStart(2, '0');
        if (mEl) mEl.innerText = String(m).padStart(2, '0');
        if (sEl) sEl.innerText = String(s).padStart(2, '0');
      }, 1000);
    }

    // --- INITIALIZE APPLICATION ON LOAD ---
    document.addEventListener('DOMContentLoaded', () => {
      restore();
      // Check hash route if any
      const hash = window.location.hash.replace('#', '').split('/')[0];
      if (ROUTES.includes(hash)) {
        state.currentRoute = hash;
      }
      renderApp();
      updateCartUI();
      updateNavHighlight();
    });
const ROUTES = ['product','stores','home','clothing','tzitzit','sales','arrangements','about','cart','search','favorites'];
function persist() { try { localStorage.setItem('tomchei-torah-v1', JSON.stringify({cart:state.cart,favorites:state.favorites})); } catch {} }
function restore() {
  try { const saved=JSON.parse(localStorage.getItem('tomchei-torah-v1')); if(saved) { state.cart=Array.isArray(saved.cart)?saved.cart.filter(i=>typeof i.id==='string' && Number.isFinite(i.price)&&Number.isInteger(i.qty)&&i.qty>0):[]; state.favorites=Array.isArray(saved.favorites)?saved.favorites:[]; } } catch {}
}
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function productVisual(p) {
  const images = {c1:5,c2:5,c3:9,c4:8,c5:3,c6:3,c7:3,c8:3,c9:3,c10:3,c11:10,c12:10,c13:11,c14:11};
  const image=images[p.id] ?? (p.category==='tzitzit'?2:1);
  return `<div class="product-visual"><img src="assets/editorial-${image}.jpg" alt="${escapeHTML(p.name)} — תמונת המחשה" loading="lazy"><button class="save-product ${state.favorites.includes(p.id)?'saved':''}" aria-label="שמירת ${escapeHTML(p.name)}" aria-pressed="${state.favorites.includes(p.id)}" onclick="toggleFavorite('${p.id}',this)"><span class="material-symbols-outlined">favorite</span></button></div>`;
}
function toggleFavorite(id,button) { state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id]; persist(); if(state.currentRoute==='favorites')renderApp(); else { button.classList.toggle('saved',state.favorites.includes(id));button.setAttribute('aria-pressed',state.favorites.includes(id)); } showToast(state.favorites.includes(id)?'הפריט נשמר למועדפים':'הפריט הוסר מהמועדפים'); }
function resultCards(items) {
  return items.length?`<div class="results-grid">${items.map(p=>`<article class="result-card">${productVisual(p)}<div class="result-copy"><span class="eyebrow">${p.badge}</span><h2>${p.name}</h2><p>${p.desc}</p><div class="result-bottom"><strong>${p.price} ₪</strong><button class="solid-button" onclick="addToCart('${p.id}')">הוספה לסל</button></div></div></article>`).join('')}</div>`:'<div class="empty-state"><span class="material-symbols-outlined">search_off</span><h2>לא נמצאו פריטים</h2><p>אפשר לנסות מילה אחרת או לעבור לקטלוג המלא.</p><button class="solid-button" onclick="navigate(\'clothing\')">לכל הפריטים</button></div>';
}
function getSearchView() { const items=CATALOG.filter(p=>(p.name+' '+p.desc).toLowerCase().includes(state.search.toLowerCase())); return `<div class="page-heading"><span class="eyebrow">THE COLLECTION</span><h1>חיפוש בקטלוג</h1><p>${state.search?`תוצאות עבור ״${escapeHTML(state.search)}״ · `:''}${items.length} פריטים</p></div>${resultCards(items)}`; }
function getFavoritesView() { return `<div class="page-heading"><span class="eyebrow">YOUR EDIT</span><h1>הפריטים ששמרת</h1><p>המועדפים שלך, במקום אחד.</p></div>${resultCards(CATALOG.filter(p=>state.favorites.includes(p.id)))}`; }
window.addEventListener('hashchange',()=>{ const route=location.hash.slice(1).split('/')[0]; state.currentRoute=ROUTES.includes(route)?route:'home';renderApp();updateNavHighlight(); });
document.addEventListener('keydown',e=>{if(e.key==='Escape'){toggleCartDrawer(false);closeAuthModal();closeCheckoutModal();document.getElementById('mobile-nav').classList.add('hidden');}});
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelector('.skip-link').addEventListener('click',e=>{e.preventDefault();document.getElementById('app-view').focus();});
 document.querySelectorAll('label').forEach((label,index)=>{const control=label.nextElementSibling;if(control && /INPUT|SELECT|TEXTAREA/.test(control.tagName)){control.id=control.id||'field-'+index;label.htmlFor=control.id;}});
 document.querySelectorAll('#auth-modal input').forEach(i=>i.autocomplete='off');
 document.querySelector('button[onclick="toggleCartDrawer(true)"]').setAttribute('aria-label','פתיחת סל קניות');
 document.querySelectorAll('button').forEach(b=>{if(!b.getAttribute('aria-label') && !b.innerText.trim().replace(/favorite|shopping_bag|menu|close/g,''))b.setAttribute('aria-label',({favorite:'מועדפים',shopping_bag:'פתיחת סל קניות',menu:'פתיחת תפריט',close:'סגירה'})[b.innerText.trim()]||'סגירה');});
 ['auth-modal','checkout-modal'].forEach(id=>{const m=document.getElementById(id);m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label',id==='auth-modal'?'הדגמת התחברות':'הדגמת הזמנה');const note=document.createElement('p');note.className='demo-note';note.textContent='מצב הדגמה בלבד · הפרטים לא נשלחים לשרת';m.querySelector('form').prepend(note);});
});

