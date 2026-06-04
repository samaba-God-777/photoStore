export type SiteLink = {
  name: string;
  href: string;
  description?: string;
};

export type SiteGroup = {
  id: string;
  name: string;
  links: SiteLink[];
};

export const siteNavigation: SiteGroup[] = [
  {
    id: 'services',
    name: 'Servicios',
    links: [
      { name: 'Retratos', href: '/servicios/retratos', description: 'Sesiones personales con estilo editorial' },
      { name: 'Eventos', href: '/servicios/eventos', description: 'Cobertura para celebraciones y marcas' },
      { name: 'Bodas', href: '/servicios/bodas', description: 'Momentos importantes con acabado premium' },
    ],
  },
  {
    id: 'packages',
    name: 'Paquetes',
    links: [
      { name: 'Estándar', href: '/paquetes/estandar', description: 'Una opción clara para empezar' },
      { name: 'Premium', href: '/paquetes/premium', description: 'Más tiempo, más fotos, más detalle' },
      { name: 'Personalizado', href: '/paquetes/personalizado', description: 'Diseñamos una propuesta a medida' },
    ],
  },
  {
    id: 'gallery',
    name: 'Galería',
    links: [
      { name: 'Trabajos recientes', href: '/galeria/trabajos-recientes', description: 'Muestras de proyectos recientes' },
      { name: 'Portfolio', href: '/portfolio', description: 'Selección curada del mejor trabajo' },
      { name: 'Exhibiciones', href: '/exhibiciones', description: 'Piezas destacadas y presentaciones' },
    ],
  },
  {
    id: 'company',
    name: 'Empresa',
    links: [
      { name: 'Quiénes somos', href: '/empresa/quienes-somos', description: 'Nuestra historia y enfoque' },
      { name: 'Contacto', href: '/contacto', description: 'Escríbenos o agenda tu sesión' },
    ],
  },
  {
    id: 'legal',
    name: 'Legal',
    links: [
      { name: 'Política de privacidad', href: '/privacy' },
      { name: 'Términos del servicio', href: '/terms' },
      { name: 'Política de cookies', href: '/cookies' },
    ],
  },
  {
    id: 'account',
    name: 'Cuenta',
    links: [
      { name: 'Cuenta', href: '/cuenta', description: 'Centro de acceso y compra' },
      { name: 'Iniciar sesión', href: '/login' },
      { name: 'Registrarse', href: '/login?mode=register' },
      { name: 'Mi panel', href: '/dashboard' },
      { name: 'Mi carrito', href: '/cart' },
    ],
  },
];
