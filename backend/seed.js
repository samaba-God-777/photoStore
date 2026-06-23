const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const prisma = require('./lib/prisma');

const seed = async () => {
  // Limpiar tablas (orden importa por las relaciones)
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🗑️  Base de datos limpiada');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@olmedo.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin123!';

  const admin = await prisma.user.create({
    data: {
      name: 'Admin PhotoStudio',
      email: adminEmail,
      password: await bcrypt.hash(adminPass, 12),
      role: 'admin',
      phone: '507-6000-0000'
    }
  });

  const user1 = await prisma.user.create({
    data: {
      name: 'María García',
      email: 'maria@email.com',
      password: await bcrypt.hash('password123', 12),
      phone: '507-6111-2222'
    }
  });

  console.log('👥 Usuarios creados');

  const packagesData = [
    {
      name: 'Paquete Bronce', price: 45,
      description: 'Sesión básica ideal para retratos individuales rápidos y profesionales.',
      category: 'studio',
      features: ['30 minutos de sesión', '5 fotos editadas', '1 fondo', 'Entrega digital en 3 días'],
      duration: '30 min', photos: 5, popular: false, image: '/imagen/bronce.jpeg'
    },
    {
      name: 'Paquete Plata', price: 65,
      description: 'Perfecto para parejas o retratos más detallados con variaciones de estilo.',
      category: 'studio',
      features: ['1 hora de sesión', '10 fotos editadas', '2 fondos', '1 cambio de ropa', 'Entrega digital en 4 días'],
      duration: '1 hora', photos: 10, popular: true, image: '/imagen/plata.jpeg'
    },
    {
      name: 'Paquete Oro', price: 90,
      description: 'Una experiencia completa en exteriores o estudio con resultados excepcionales.',
      category: 'both',
      features: ['1.5 horas de sesión', '20 fotos editadas', 'Exteriores o Estudio', '2 cambios de ropa', 'Entrega digital en 5 días'],
      duration: '1.5 horas', photos: 20, popular: true, image: '/imagen/oro.jpeg'
    },
    {
      name: 'Paquete Diamante', price: 120,
      description: 'Ideal para grupos familiares pequeños o books profesionales completos.',
      category: 'both',
      features: ['2 horas de sesión', '30 fotos editadas', 'Exteriores y Estudio', '3 cambios de ropa', 'Entrega digital e impresa (10 fotos)'],
      duration: '2 horas', photos: 30, popular: false, image: '/imagen/diamante.jpeg'
    },
    {
      name: 'Paquete VIP', price: 180,
      description: 'La experiencia fotográfica definitiva con maquillaje, múltiples locaciones y cobertura total.',
      category: 'both',
      features: ['4 horas de sesión', '60 fotos editadas', 'Múltiples locaciones', 'Cambios de ropa ilimitados', 'Maquillaje y peinado', 'Álbum impreso premium'],
      duration: '4 horas', photos: 60, popular: false, image: '/imagen/vip.jpeg'
    }
  ];

  const packages = [];
  for (const data of packagesData) {
    packages.push(await prisma.package.create({ data }));
  }

  console.log(`📦 ${packages.length} paquetes creados`);

  await prisma.order.create({
    data: {
      orderNumber: `PS-${Date.now().toString().slice(-6)}001`,
      userId: user1.id,
      customerName: user1.name,
      customerEmail: user1.email,
      customerPhone: user1.phone,
      total: packages[1].price,
      paymentMethod: 'yappy',
      yappyPhone: '6111-2222',
      status: 'confirmed',
      confirmedAt: new Date(),
      items: {
        create: [{ packageId: packages[1].id, name: packages[1].name, price: packages[1].price, quantity: 1 }]
      }
    }
  });

  console.log('📋 Orden de ejemplo creada');
  console.log('\n✅ Seed completado exitosamente!\n');
  console.log(`👤 Admin: ${adminEmail} / ${adminPass}`);
  console.log('👤 Usuario: maria@email.com / password123\n');

  await prisma.$disconnect();
};

seed().catch(async (err) => {
  console.error('Error en seed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
