import { PrismaClient, OrderStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Função para gerar datas aleatórias nos últimos N dias
function randomDateInLastDays(days: number): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * days);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);
  
  return date;
}

// Usuários falsos para o dashboard
const fakeUsers = [
  { name: 'Maria Silva', email: 'maria.silva@email.com' },
  { name: 'João Santos', email: 'joao.santos@email.com' },
  { name: 'Ana Costa', email: 'ana.costa@email.com' },
  { name: 'Pedro Oliveira', email: 'pedro.oliveira@email.com' },
  { name: 'Julia Ferreira', email: 'julia.ferreira@email.com' },
  { name: 'Carlos Souza', email: 'carlos.souza@email.com' },
  { name: 'Fernanda Lima', email: 'fernanda.lima@email.com' },
  { name: 'Ricardo Alves', email: 'ricardo.alves@email.com' },
  { name: 'Patricia Rocha', email: 'patricia.rocha@email.com' },
  { name: 'Bruno Martins', email: 'bruno.martins@email.com' },
  { name: 'Camila Barbosa', email: 'camila.barbosa@email.com' },
  { name: 'Lucas Pereira', email: 'lucas.pereira@email.com' },
  { name: 'Isabela Gomes', email: 'isabela.gomes@email.com' },
  { name: 'Rafael Dias', email: 'rafael.dias@email.com' },
  { name: 'Larissa Moreira', email: 'larissa.moreira@email.com' },
];

// Endereços de entrega variados
const shippingAddresses = [
  { name: 'Maria Silva', address: 'Rua das Flores, 123 - São Paulo, SP', phone: '(11) 98765-4321' },
  { name: 'João Santos', address: 'Av. Paulista, 1000 - São Paulo, SP', phone: '(11) 91234-5678' },
  { name: 'Ana Costa', address: 'Rua Augusta, 500 - São Paulo, SP', phone: '(11) 99876-5432' },
  { name: 'Pedro Oliveira', address: 'Rua Oscar Freire, 200 - São Paulo, SP', phone: '(11) 91111-2222' },
  { name: 'Julia Ferreira', address: 'Av. Faria Lima, 1500 - São Paulo, SP', phone: '(11) 93333-4444' },
  { name: 'Carlos Souza', address: 'Rua Consolação, 800 - São Paulo, SP', phone: '(11) 95555-6666' },
  { name: 'Fernanda Lima', address: 'Rua Haddock Lobo, 300 - São Paulo, SP', phone: '(11) 97777-8888' },
  { name: 'Ricardo Alves', address: 'Av. Rebouças, 1200 - São Paulo, SP', phone: '(11) 99999-0000' },
  { name: 'Patricia Rocha', address: 'Rua Bela Cintra, 600 - São Paulo, SP', phone: '(11) 92222-3333' },
  { name: 'Bruno Martins', address: 'Av. Brigadeiro, 900 - São Paulo, SP', phone: '(11) 94444-5555' },
];

async function main() {
  console.log('🌱 Seeding dashboard data...');

  // Hash padrão para senhas
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Criar ou obter categorias
  const category1 = await prisma.category.upsert({
    where: { name: 'Maquiagem' },
    update: {},
    create: {
      name: 'Maquiagem',
      description: 'Produtos de maquiagem',
    },
  });

  const category2 = await prisma.category.upsert({
    where: { name: 'Skincare' },
    update: {},
    create: {
      name: 'Skincare',
      description: 'Produtos de cuidados com a pele',
    },
  });

  const category3 = await prisma.category.upsert({
    where: { name: 'Cabelos' },
    update: {},
    create: {
      name: 'Cabelos',
      description: 'Produtos para cabelos',
    },
  });

  console.log('✅ Categories ready');

  // Criar usuários falsos
  console.log('👥 Creating fake users...');
  const createdUsers = [];
  for (const userData of fakeUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: UserRole.USER,
      },
    });
    createdUsers.push(user);
  }
  console.log(`✅ Created ${createdUsers.length} users`);

  // Garantir que existam produtos (criar alguns básicos se não existirem)
  const existingProducts = await prisma.product.findMany({
    include: { variants: true },
    take: 20,
  });

  // Filtrar apenas produtos com variantes
  let products = existingProducts.filter(p => p.variants.length > 0);

  if (products.length === 0) {
    console.log('📦 Creating sample products...');
    const productData = [
      {
        name: 'Base Líquida HD',
        description: 'Base líquida de alta cobertura',
        basePrice: 89.90,
        brand: 'Olive Beauty',
        categoryId: category1.id,
        variants: [
          { attributes: { color: 'Bege Claro' }, price: 89.90, stock: 50 },
          { attributes: { color: 'Bege Médio' }, price: 89.90, stock: 45 },
        ],
      },
      {
        name: 'Batom Matte',
        description: 'Batom matte longa duração',
        basePrice: 45.90,
        brand: 'Olive Beauty',
        categoryId: category1.id,
        variants: [
          { attributes: { color: 'Vermelho' }, price: 45.90, stock: 60 },
          { attributes: { color: 'Rosa' }, price: 45.90, stock: 55 },
        ],
      },
      {
        name: 'Sérum Vitamina C',
        description: 'Sérum antioxidante',
        basePrice: 149.90,
        brand: 'Olive Beauty',
        categoryId: category2.id,
        variants: [
          { attributes: { size: '30ml' }, price: 149.90, stock: 30 },
          { attributes: { size: '50ml' }, price: 229.90, stock: 25 },
        ],
      },
      {
        name: 'Hidratante Facial',
        description: 'Creme hidratante',
        basePrice: 99.90,
        brand: 'Olive Beauty',
        categoryId: category2.id,
        variants: [
          { attributes: { size: '50ml' }, price: 99.90, stock: 40 },
        ],
      },
      {
        name: 'Shampoo Reparador',
        description: 'Shampoo para cabelos danificados',
        basePrice: 39.90,
        brand: 'Olive Beauty',
        categoryId: category3.id,
        variants: [
          { attributes: { size: '300ml' }, price: 39.90, stock: 50 },
          { attributes: { size: '500ml' }, price: 59.90, stock: 45 },
        ],
      },
    ];

    for (const prodData of productData) {
      const product = await prisma.product.create({
        data: {
          name: prodData.name,
          description: prodData.description,
          basePrice: prodData.basePrice,
          brand: prodData.brand,
          categoryId: prodData.categoryId,
          variants: {
            create: prodData.variants.map((v) => ({
              attributes: JSON.stringify(v.attributes),
              price: v.price,
              stock: v.stock,
            })),
          },
        },
        include: { variants: true },
      });
      products.push(product);
    }
    console.log(`✅ Created ${productData.length} products`);
  } else {
    console.log(`✅ Using ${products.length} existing products`);
  }

  // Criar pedidos com diferentes status
  console.log('📦 Creating orders with various statuses...');

  const statuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'CANCELLED'];
  const ordersToCreate = 80; // Total de pedidos

  // Distribuição de status (mais entregues, alguns pendentes, etc)
  const statusDistribution = {
    DELIVERED: 35, // 35 pedidos entregues
    SENT: 20,      // 20 enviados
    PROCESSING: 12, // 12 em processamento
    PENDING: 8,    // 8 pendentes
    CANCELLED: 5,   // 5 cancelados
  };

  let orderCount = 0;

  for (const [status, count] of Object.entries(statusDistribution)) {
    for (let i = 0; i < count; i++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const shipping = shippingAddresses[Math.floor(Math.random() * shippingAddresses.length)];
      
      // Selecionar produtos aleatórios para o pedido
      const numItems = Math.floor(Math.random() * 3) + 1; // 1 a 3 itens
      const selectedProducts = [];
      const usedProductIds = new Set<string>();
      
      for (let j = 0; j < numItems && products.length > 0; j++) {
        // Garantir que não selecionamos o mesmo produto duas vezes no mesmo pedido
        let product;
        let attempts = 0;
        do {
          product = products[Math.floor(Math.random() * products.length)];
          attempts++;
        } while (usedProductIds.has(product.id) && attempts < 10);
        
        if (product && product.variants.length > 0) {
          const variant = product.variants[Math.floor(Math.random() * product.variants.length)];
          selectedProducts.push({ product, variant, quantity: Math.floor(Math.random() * 2) + 1 });
          usedProductIds.add(product.id);
        }
      }

      if (selectedProducts.length === 0) continue;

      // Calcular total
      const total = selectedProducts.reduce((sum, item) => {
        return sum + (item.variant.price * item.quantity);
      }, 0);

      // Data baseada no status
      let createdAt: Date;
      switch (status as OrderStatus) {
        case 'DELIVERED':
          // Entregues: últimos 60 dias
          createdAt = randomDateInLastDays(60);
          break;
        case 'SENT':
          // Enviados: últimos 30 dias
          createdAt = randomDateInLastDays(30);
          break;
        case 'PROCESSING':
          // Em processamento: últimos 15 dias
          createdAt = randomDateInLastDays(15);
          break;
        case 'PENDING':
          // Pendentes: últimos 7 dias
          createdAt = randomDateInLastDays(7);
          break;
        case 'CANCELLED':
          // Cancelados: últimos 45 dias
          createdAt = randomDateInLastDays(45);
          break;
        default:
          createdAt = randomDateInLastDays(30);
      }

      // Criar pedido
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          status: status as OrderStatus,
          total: total,
          shippingAddress: shipping.address,
          shippingName: shipping.name,
          shippingPhone: shipping.phone,
          createdAt: createdAt,
          updatedAt: createdAt,
          items: {
            create: selectedProducts.map((item) => ({
              productId: item.product.id,
              productVariantId: item.variant.id,
              quantity: item.quantity,
              price: item.variant.price,
            })),
          },
        },
      });

      orderCount++;
      if (orderCount % 10 === 0) {
        console.log(`  Created ${orderCount} orders...`);
      }
    }
  }

  console.log(`✅ Created ${orderCount} orders with various statuses`);
  console.log('📊 Status distribution:');
  console.log(`   - DELIVERED: ${statusDistribution.DELIVERED}`);
  console.log(`   - SENT: ${statusDistribution.SENT}`);
  console.log(`   - PROCESSING: ${statusDistribution.PROCESSING}`);
  console.log(`   - PENDING: ${statusDistribution.PENDING}`);
  console.log(`   - CANCELLED: ${statusDistribution.CANCELLED}`);

  console.log('\n🎉 Dashboard seeding completed!');
  console.log('\n📝 Login credentials for fake users:');
  console.log('   Email: any user email from the list above');
  console.log('   Password: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding dashboard:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

