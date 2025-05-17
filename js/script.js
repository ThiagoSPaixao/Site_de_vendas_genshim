// Dados das contas (pode ser substituído por uma chamada API)
const accounts = [
  {
    id: 1,
    title: "Conta AR 55",
    description: "Conta nível máximo com personagens e armas raras",
    price: 299.90,
    image: "img/account1.jpg",
    category: "ar55",
    details: {
      adventureRank: 55,
      fiveStarChars: 8,
      fiveStarWeapons: 12,
      primogems: 25000,
      pity: "Garantido"
    }
  },
  {
    id: 2,
    title: "Conta AR 50",
    description: "Conta intermediária com bons personagens",
    price: 199.90,
    image: "img/account2.jpg",
    category: "ar50",
    details: {
      adventureRank: 50,
      fiveStarChars: 5,
      fiveStarWeapons: 7,
      primogems: 15000,
      pity: "50/50"
    }
  },
  {
    id: 3,
    title: "Conta Starter",
    description: "Conta inicial com personagens 5★",
    price: 99.90,
    image: "img/account3.jpg",
    category: "starter",
    details: {
      adventureRank: 20,
      fiveStarChars: 2,
      fiveStarWeapons: 1,
      primogems: 5000,
      pity: "Nenhum"
    }
  },
  {
    id: 4,
    title: "Conta AR 56",
    description: "Conta endgame com todos os personagens",
    price: 499.90,
    image: "img/account1.jpg",
    category: "ar55",
    details: {
      adventureRank: 56,
      fiveStarChars: 15,
      fiveStarWeapons: 20,
      primogems: 30000,
      pity: "Garantido"
    }
  },
  {
    id: 5,
    title: "Conta AR 45",
    description: "Conta para jogadores intermediários",
    price: 149.90,
    image: "img/account2.jpg",
    category: "ar50",
    details: {
      adventureRank: 45,
      fiveStarChars: 3,
      fiveStarWeapons: 4,
      primogems: 10000,
      pity: "50/50"
    }
  },
  {
    id: 6,
    title: "Conta Starter 5★",
    description: "Conta inicial com personagem 5★ específico",
    price: 129.90,
    image: "img/account3.jpg",
    category: "starter",
    details: {
      adventureRank: 10,
      fiveStarChars: 1,
      fiveStarWeapons: 0,
      primogems: 3000,
      pity: "Nenhum"
    }
  }
];

// Variáveis globais
let cart = [];
let swiper;

// Verifica e carrega o carrinho do localStorage com tratamento de erros
try {
  cart = JSON.parse(localStorage.getItem('cart')) || [];
} catch (e) {
  console.error('Erro ao carregar carrinho do localStorage:', e);
  cart = [];
}

// DOM Elements - com verificação de existência
const accountsGrid = document.querySelector('.accounts-grid');
const featuredSlider = document.querySelector('.featured-slider .swiper-wrapper');
const cartIcon = document.getElementById('cartIcon');
const cartModal = document.getElementById('cartModal');
const closeCart = document.querySelector('.close-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const cartCount = document.querySelector('.cart-count');
const subtotalElement = document.querySelector('.subtotal');
const totalElement = document.querySelector('.total-price');
const checkoutBtn = document.querySelector('.checkout-btn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.querySelector('.close-checkout');
const filterButtons = document.querySelectorAll('.filter-btn');

// Verifica se elementos essenciais existem
if (!accountsGrid || !featuredSlider) {
  console.error('Elementos essenciais do DOM não encontrados');
} else {
  // Inicialização quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', initApp);
}

// Função principal de inicialização
function initApp() {
  // Carrega bibliotecas necessárias
  loadDependencies().then(() => {
    loadAccounts();
    initSwiper();
    updateCartCount();
    
    // Carrega o carrinho se existir
    if (cart.length > 0) {
      renderCartItems();
      updateCartSummary();
    }
    
    setupEventListeners();
  }).catch(error => {
    console.error('Erro ao carregar dependências:', error);
  });
}

// Carrega bibliotecas externas
function loadDependencies() {
  return new Promise((resolve, reject) => {
    // Verifica se Swiper está disponível
    if (typeof Swiper === 'undefined') {
      loadScript('https://unpkg.com/swiper@8/swiper-bundle.min.js', () => {
        console.log('Swiper carregado com sucesso');
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Função para carregar scripts dinamicamente
function loadScript(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = callback;
  script.onerror = () => {
    console.error(`Falha ao carregar o script: ${src}`);
  };
  document.head.appendChild(script);
}

// Configura todos os event listeners
function setupEventListeners() {
  // Carrinho
  if (cartIcon) cartIcon.addEventListener('click', openCart);
  if (closeCart) closeCart.addEventListener('click', closeCartModal);
  if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckout);
  if (closeCheckout) closeCheckout.addEventListener('click', closeCheckoutModal);
  
  // Filtros
  if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        filterAccounts(button.dataset.filter);
      });
    });
  }
  
  // Menu hamburguer
  const hamburger = document.getElementById('hamburger');
  const navbar = document.querySelector('.navbar');
  
  if (hamburger && navbar) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navbar.classList.toggle('active');
    });
    
    // Fechar menu ao clicar em um link
    document.querySelectorAll('.navbar a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navbar.classList.remove('active');
      });
    });
  }
  
  // Fecha modais ao clicar fora
  window.addEventListener('click', (e) => {
    if (e.target === cartModal) closeCartModal();
    if (e.target === checkoutModal) closeCheckoutModal();
  });
}

// Carrega as contas na página
function loadAccounts() {
  // Limpa os containers primeiro
  if (featuredSlider) featuredSlider.innerHTML = '';
  if (accountsGrid) accountsGrid.innerHTML = '';
  
  // Destaques (primeiras 3 contas)
  accounts.slice(0, 3).forEach(account => {
    if (featuredSlider) {
      featuredSlider.appendChild(createAccountCard(account, true));
    }
  });
  
  // Todas as contas
  accounts.forEach(account => {
    if (accountsGrid) {
      accountsGrid.appendChild(createAccountCard(account, false));
    }
  });
  
  // Adiciona event listeners aos botões
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const accountId = parseInt(e.target.dataset.id);
      addToCart(accountId);
    });
  });
}

// Cria um card de conta
function createAccountCard(account, isSlider) {
  const card = document.createElement('div');
  card.className = isSlider ? 'swiper-slide' : 'account-card';
  card.dataset.id = account.id; // Adiciona data-id para filtragem
  
  card.innerHTML = `
    <img src="${account.image}" alt="${account.title}" onerror="this.src='img/placeholder.jpg'">
    <h3>${account.title}</h3>
    <p class="description">${account.description}</p>
    <ul>
      <li><i class="fas fa-level-up-alt"></i> AR ${account.details.adventureRank}</li>
      <li><i class="fas fa-star"></i> ${account.details.fiveStarChars} Personagens 5★</li>
      <li><i class="fas fa-gem"></i> ${account.details.fiveStarWeapons} Armas 5★</li>
      <li><i class="fas fa-coins"></i> ${account.details.primogems.toLocaleString()} Primogems</li>
      <li><i class="fas fa-info-circle"></i> Pity: ${account.details.pity}</li>
    </ul>
    <p class="price">R$ ${account.price.toFixed(2).replace('.', ',')}</p>
    <button class="add-to-cart" data-id="${account.id}">Adicionar ao Carrinho</button>
  `;
  
  return card;
}

// Inicializa o Swiper
function initSwiper() {
  if (typeof Swiper === 'function' && document.querySelector('.featured-slider')) {
    swiper = new Swiper('.featured-slider', {
      loop: true,
      spaceBetween: 30,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
      }
    });
  } else {
    console.warn('Swiper não disponível ou elemento não encontrado');
  }
}

// Filtra as contas por categoria
function filterAccounts(category) {
  const allAccounts = document.querySelectorAll('.account-card');
  
  if (allAccounts.length === 0) return;
  
  allAccounts.forEach(account => {
    account.style.display = 'none';
  });
  
  if (category === 'all') {
    allAccounts.forEach(account => {
      account.style.display = 'block';
    });
  } else {
    const filteredAccounts = accounts.filter(account => account.category === category);
    filteredAccounts.forEach(account => {
      const accountElement = document.querySelector(`.account-card[data-id="${account.id}"]`);
      if (accountElement) {
        accountElement.style.display = 'block';
      }
    });
  }
}

// Adiciona uma conta ao carrinho
function addToCart(accountId) {
  const account = accounts.find(acc => acc.id === accountId);
  if (!account) return;
  
  // Verifica se a conta já está no carrinho
  const existingItem = cart.find(item => item.id === accountId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...account,
      quantity: 1
    });
  }
  
  // Atualiza o localStorage
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
  }
  
  // Atualiza a UI
  updateCartCount();
  renderCartItems();
  updateCartSummary();
  
  // Mostra feedback
  if (typeof Swal === 'object') {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Conta adicionada ao carrinho!',
      showConfirmButton: false,
      timer: 1500
    });
  } else {
    alert('Conta adicionada ao carrinho!');
  }
}

// Remove um item do carrinho
function removeFromCart(accountId) {
  cart = cart.filter(item => item.id !== accountId);
  
  // Atualiza o localStorage
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
  }
  
  // Atualiza a UI
  updateCartCount();
  renderCartItems();
  updateCartSummary();
  
  // Se o carrinho estiver vazio, fecha o modal
  if (cart.length === 0) {
    closeCartModal();
  }
}

// Atualiza a quantidade de um item no carrinho
function updateQuantity(accountId, newQuantity) {
  const item = cart.find(item => item.id === accountId);
  
  if (item) {
    item.quantity = parseInt(newQuantity);
    
    // Se a quantidade for 0, remove o item
    if (item.quantity <= 0) {
      removeFromCart(accountId);
      return;
    }
    
    // Atualiza o localStorage
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
    
    // Atualiza a UI
    updateCartSummary();
  }
}

// Atualiza o contador do carrinho
function updateCartCount() {
  if (!cartCount) return;
  
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = totalItems;
}

// Renderiza os itens do carrinho
function renderCartItems() {
  if (!cartItemsContainer || !checkoutBtn) return;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Seu carrinho está vazio</p>
      </div>
    `;
    checkoutBtn.disabled = true;
    return;
  }
  
  checkoutBtn.disabled = false;
  cartItemsContainer.innerHTML = '';
  
  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.title}" class="cart-item-img" onerror="this.src='img/placeholder.jpg'">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.title}</h4>
        <p class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
        <div class="quantity-controls">
          <button class="quantity-btn minus" data-id="${item.id}">-</button>
          <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}">
          <button class="quantity-btn plus" data-id="${item.id}">+</button>
        </div>
        <span class="cart-item-remove" data-id="${item.id}">
          <i class="fas fa-trash"></i> Remover
        </span>
      </div>
    `;
    
    cartItemsContainer.appendChild(cartItem);
  });
  
  // Adiciona event listeners aos controles de quantidade
  document.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const accountId = parseInt(e.target.dataset.id);
      const input = document.querySelector(`.quantity-input[data-id="${accountId}"]`);
      if (!input) return;
      
      let newQuantity = parseInt(input.value);
      
      if (e.target.classList.contains('minus')) {
        newQuantity -= 1;
      } else {
        newQuantity += 1;
      }
      
      input.value = newQuantity;
      updateQuantity(accountId, newQuantity);
    });
  });
  
  // Adiciona event listeners aos inputs de quantidade
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const accountId = parseInt(e.target.dataset.id);
      const newQuantity = parseInt(e.target.value);
      
      if (isNaN(newQuantity)) {
        e.target.value = 1;
        updateQuantity(accountId, 1);
      } else {
        updateQuantity(accountId, newQuantity);
      }
    });
  });
  
  // Adiciona event listeners aos botões de remover
  document.querySelectorAll('.cart-item-remove').forEach(button => {
    button.addEventListener('click', (e) => {
      const accountId = parseInt(e.target.dataset.id);
      removeFromCart(accountId);
    });
  });
}

// Atualiza o resumo do carrinho
function updateCartSummary() {
  if (!subtotalElement || !totalElement) return;
  
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  subtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  totalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  
  // Atualiza o QR Code PIX com o valor total
  if (document.getElementById('pixQrCode') && typeof QRCode === 'function') {
    document.getElementById('pixQrCode').innerHTML = '';
    new QRCode(document.getElementById('pixQrCode'), {
      text: `PIX: R$ ${subtotal.toFixed(2)}`,
      width: 180,
      height: 180,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
  
  // Atualiza o valor das criptomoedas
  if (document.querySelector('.crypto-amount')) {
    const btcValue = subtotal / 200000; // Valor fictício do BTC
    document.querySelector('.crypto-amount').textContent = `${btcValue.toFixed(8)} BTC`;
  }
  
  // Atualiza as parcelas no cartão
  if (document.querySelector('.credit-form select')) {
    const select = document.querySelector('.credit-form select');
    select.innerHTML = '';
    
    for (let i = 1; i <= 12; i++) {
      const option = document.createElement('option');
      const installmentValue = subtotal / i;
      option.value = i;
      option.textContent = `${i}x de R$ ${installmentValue.toFixed(2).replace('.', ',')} ${i > 1 ? 'sem juros' : ''}`;
      select.appendChild(option);
    }
  }
}

// Abre o modal do carrinho
function openCart() {
  if (!cartModal) return;
  
  cartModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Fecha o modal do carrinho
function closeCartModal() {
  if (!cartModal) return;
  
  cartModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Abre o modal de checkout
function openCheckout() {
  if (!checkoutModal) return;
  
  closeCartModal();
  checkoutModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Gera o QR Code PIX
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  if (document.getElementById('pixQrCode') && typeof QRCode === 'function') {
    document.getElementById('pixQrCode').innerHTML = '';
    new QRCode(document.getElementById('pixQrCode'), {
      text: `PIX: R$ ${subtotal.toFixed(2)}`,
      width: 180,
      height: 180,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
  
  // Gera o QR Code BTC
  if (document.getElementById('btcQr') && typeof QRCode === 'function') {
    document.getElementById('btcQr').innerHTML = '';
    new QRCode(document.getElementById('btcQr'), {
      text: 'bc1qxy2kgdygjrsqtzq2n0yrf2493w83k4fj5g6h4d',
      width: 150,
      height: 150,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

// Fecha o modal de checkout
function closeCheckoutModal() {
  if (!checkoutModal) return;
  
  checkoutModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}