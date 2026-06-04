export type SiteSection = {
  title: string;
  body: string;
  bullets?: string[];
};

export type SitePageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  highlights: string[];
  sections: SiteSection[];
  gallery?: Array<{ src: string; alt: string; badge?: 'popular' | 'nuevo' }>;
  stats: Array<{ label: string; value: string }>;
  cta: { label: string; href: string };
};

export const sitePages: Record<string, SitePageContent> = {
  '/servicios/retratos': {
    eyebrow: 'Servicio',
    title: 'Retratos con estilo editorial y luz impecable',
    intro: 'Creamos retratos pensados para resaltar tu presencia, tu historia y tu personalidad, con una dirección amable y una estética profesional.',
    highlights: ['Sesión guiada', 'Retoque premium', 'Ambiente cómodo', 'Entrega digital'],
    sections: [
      {
        title: 'Ideal para',
        body: 'Personas que quieren una imagen profesional o artística para redes, marca personal, CV, portfolio o recuerdo familiar.',
        bullets: ['Retrato individual', 'Marca personal', 'Retrato familiar'],
      },
      {
        title: 'Cómo trabajamos',
        body: 'Te ayudamos con poses, encuadres y vestuario para que salgas natural, seguro y con una imagen pulida.',
        bullets: ['Dirección de pose', 'Iluminación cuidada', 'Edición fina'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=900', alt: 'Retrato profesional 1', badge: 'popular' },
      { src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=900', alt: 'Retrato profesional 2' },
      { src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=900', alt: 'Retrato profesional 3', badge: 'nuevo' },
    ],
    stats: [
      { label: 'Duración', value: '1 h - 2 h' },
      { label: 'Entrega', value: 'Galería digital' },
      { label: 'Edición', value: 'Premium' },
    ],
    cta: { label: 'Ver paquetes', href: '/#paquetes' },
  },
  '/servicios/eventos': {
    eyebrow: 'Servicio',
    title: 'Cobertura de eventos con enfoque narrativo',
    intro: 'Documentamos momentos importantes con una mirada dinámica y profesional para que tu evento quede bien contado de principio a fin.',
    highlights: ['Cobertura completa', 'Entrega rápida', 'Fotos de ambiente', 'Momentos clave'],
    sections: [
      {
        title: 'Cobertura',
        body: 'Ideal para actividades corporativas, celebraciones privadas, lanzamientos y eventos sociales.',
        bullets: ['Recepción', 'Escenas espontáneas', 'Fotos de grupo'],
      },
      {
        title: 'Beneficio',
        body: 'Recibes una selección organizada para redes, prensa interna o archivo de marca.',
        bullets: ['Selección curada', 'Edición uniforme', 'Uso comercial'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=900', alt: 'Evento corporativo 1', badge: 'popular' },
      { src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=900&sat=-25', alt: 'Evento corporativo 2' },
      { src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=900&sat=-50', alt: 'Evento corporativo 3', badge: 'nuevo' },
    ],
    stats: [
      { label: 'Escala', value: 'Pequeña a grande' },
      { label: 'Formato', value: 'Cobertura total' },
      { label: 'Entrega', value: 'Prioritaria' },
    ],
    cta: { label: 'Solicitar cotización', href: '/contacto' },
  },
  '/servicios/bodas': {
    eyebrow: 'Servicio',
    title: 'Bodas con narrativa elegante y emocional',
    intro: 'Cada boda merece una cobertura sensible, cuidada y con una estética que preserve la emoción del día más importante.',
    highlights: ['Sesión previa', 'Ceremonia', 'Recepción', 'Álbum premium'],
    sections: [
      {
        title: 'Cobertura completa',
        body: 'Acompañamos la ceremonia, retratos, celebración y momentos espontáneos con un estilo documental y editorial.',
        bullets: ['Preparativos', 'Ceremonia', 'Detalles decorativos'],
      },
      {
        title: 'Entregables',
        body: 'Incluimos selección de fotos editadas, galería privada y opciones de álbum físico o digital.',
        bullets: ['Galería privada', 'Álbum', 'Selección premium'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=900', alt: 'Boda 1', badge: 'popular' },
      { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=900&sat=-20', alt: 'Boda 2' },
      { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=900&sat=-45', alt: 'Boda 3', badge: 'nuevo' },
    ],
    stats: [
      { label: 'Cobertura', value: 'Día completo' },
      { label: 'Estilo', value: 'Narrativo' },
      { label: 'Entrega', value: 'Premium' },
    ],
    cta: { label: 'Hablar con el equipo', href: '/contacto' },
  },
  '/paquetes/estandar': {
    eyebrow: 'Paquete',
    title: 'Estándar: claro, práctico y confiable',
    intro: 'Una opción pensada para empezar con una experiencia ordenada, buena cobertura y una edición limpia.',
    highlights: ['Precio accesible', 'Sesión guiada', 'Entrega digital', 'Base profesional'],
    sections: [
      {
        title: 'Qué incluye',
        body: 'Una sesión enfocada en lo esencial con una selección cuidada de fotos editadas.',
        bullets: ['Cobertura breve', 'Edición básica', 'Galería digital'],
      },
      {
        title: 'Para quién es',
        body: 'Para quienes quieren una solución simple, elegante y sin complicaciones.',
        bullets: ['Primera sesión', 'Retrato rápido', 'Contenido para redes'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=900', alt: 'Paquete estándar 1', badge: 'popular' },
      { src: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&q=80&w=900', alt: 'Paquete estándar 2' },
      { src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=900', alt: 'Paquete estándar 3', badge: 'nuevo' },
    ],
    stats: [
      { label: 'Nivel', value: 'Inicial' },
      { label: 'Ideal para', value: 'Presupuesto claro' },
      { label: 'Flexibilidad', value: 'Alta' },
    ],
    cta: { label: 'Ver más paquetes', href: '/#paquetes' },
  },
  '/paquetes/premium': {
    eyebrow: 'Paquete',
    title: 'Premium: más tiempo, más detalle, mejor acabado',
    intro: 'Diseñado para sesiones que necesitan más producción, más imágenes y una presentación superior.',
    highlights: ['Más fotos', 'Retoque avanzado', 'Mejor producción', 'Entrega cuidada'],
    sections: [
      {
        title: 'Incluye',
        body: 'Más tiempo de sesión, más variedad de tomas y un proceso de edición más detallado.',
        bullets: ['Cobertura extendida', 'Retoque premium', 'Galería amplia'],
      },
      {
        title: 'Ventaja',
        body: 'Es la mejor opción cuando buscas una experiencia más completa y con mayor valor visual.',
        bullets: ['Más material', 'Mejor narrativa', 'Acabado profesional'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=900&sat=-20', alt: 'Paquete premium 1', badge: 'popular' },
      { src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=900&sat=-15', alt: 'Paquete premium 2' },
      { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=900', alt: 'Paquete premium 3', badge: 'nuevo' },
    ],
    stats: [
      { label: 'Nivel', value: 'Intermedio' },
      { label: 'Tiempo', value: 'Extendido' },
      { label: 'Resultado', value: 'Premium' },
    ],
    cta: { label: 'Ir al checkout', href: '/checkout' },
  },
  '/paquetes/personalizado': {
    eyebrow: 'Paquete',
    title: 'Personalizado: una propuesta hecha a tu medida',
    intro: 'Si necesitas algo distinto, construimos un plan que encaje con tu evento, objetivo y presupuesto.',
    highlights: ['A medida', 'Escalable', 'Flexible', 'Asesoría'],
    sections: [
      {
        title: 'Cómo funciona',
        body: 'Nos cuentas qué necesitas y armamos una propuesta con alcance, duración y entregables personalizados.',
        bullets: ['Necesidades claras', 'Presupuesto flexible', 'Plan a medida'],
      },
      {
        title: 'Perfecto para',
        body: 'Eventos especiales, marcas, sesiones híbridas o cualquier idea que no encaje en un paquete estándar.',
        bullets: ['Eventos únicos', 'Marcas', 'Sesiones especiales'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&q=80&w=900', alt: 'Personalizado 1', badge: 'popular' },
      { src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=900', alt: 'Personalizado 2' },
      { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=900', alt: 'Personalizado 3', badge: 'nuevo' },
    ],
    stats: [
      { label: 'Formato', value: 'Flexible' },
      { label: 'Cobertura', value: 'A medida' },
      { label: 'Asesoría', value: 'Incluida' },
    ],
    cta: { label: 'Pedir cotización', href: '/contacto' },
  },
  '/galeria/trabajos-recientes': {
    eyebrow: 'Galería',
    title: 'Trabajos recientes seleccionados para inspirarte',
    intro: 'Una muestra de proyectos recientes para que veas el estilo, el cuidado y el nivel de detalle que entregamos.',
    highlights: ['Selección curada', 'Proyectos actuales', 'Estilo consistente', 'Calidad visible'],
    sections: [
      {
        title: 'Qué verás aquí',
        body: 'Momentos reales, composiciones limpias y resultados pensados para mostrar lo mejor de cada sesión.',
        bullets: ['Retratos', 'Eventos', 'Bodas'],
      },
      {
        title: 'Objetivo',
        body: 'Ayudarte a tomar una decisión con confianza viendo ejemplos de trabajos recientes.',
        bullets: ['Referencias reales', 'Estilo de edición', 'Variedad visual'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=900', alt: 'Trabajos recientes 1', badge: 'nuevo' },
      { src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=900', alt: 'Trabajos recientes 2' },
      { src: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=900', alt: 'Trabajos recientes 3', badge: 'popular' },
    ],
    stats: [
      { label: 'Contenido', value: 'Actual' },
      { label: 'Enfoque', value: 'Inspiración' },
      { label: 'Formato', value: 'Visual' },
    ],
    cta: { label: 'Ver portfolio', href: '/portfolio' },
  },
  '/portfolio': {
    eyebrow: 'Galería',
    title: 'Portfolio curado con nuestro mejor trabajo',
    intro: 'Aquí reunimos las piezas que mejor representan nuestra línea visual, la precisión técnica y la atención al detalle.',
    highlights: ['Lo mejor del estudio', 'Selección editorial', 'Consistencia visual', 'Nivel premium'],
    sections: [
      {
        title: 'Selección',
        body: 'Mostramos imágenes que resumen nuestro enfoque: composición, luz, edición y narrativa.',
        bullets: ['Editorial', 'Social', 'Corporativo'],
      },
      {
        title: 'Uso',
        body: 'Sirve como referencia para nuevos clientes y como vitrina del estilo de la marca.',
        bullets: ['Inspiración', 'Confianza', 'Identidad'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=900', alt: 'Portfolio 1', badge: 'popular' },
      { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=900', alt: 'Portfolio 2' },
      { src: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=900', alt: 'Portfolio 3', badge: 'nuevo' },
    ],
    stats: [
      { label: 'Enfoque', value: 'Curado' },
      { label: 'Estilo', value: 'Editorial' },
      { label: 'Objetivo', value: 'Vitrina' },
    ],
    cta: { label: 'Ver exhibiciones', href: '/exhibiciones' },
  },
  '/exhibiciones': {
    eyebrow: 'Galería',
    title: 'Exhibiciones y piezas destacadas',
    intro: 'Un espacio para destacar trabajos especiales, proyectos de marca y piezas que merecen una presentación más formal.',
    highlights: ['Proyectos destacados', 'Presentación elegante', 'Marca visual', 'Curaduría'],
    sections: [
      {
        title: 'Enfoque de exhibición',
        body: 'Seleccionamos imágenes que tienen fuerza visual, relevancia o valor de presentación.',
        bullets: ['Eventos importantes', 'Campañas', 'Sesiones temáticas'],
      },
      {
        title: 'Resultado',
        body: 'Una galería que transmite profesionalismo y eleva la percepción del servicio.',
        bullets: ['Más prestigio', 'Más claridad', 'Mejor presentación'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=900', alt: 'Exhibición 1', badge: 'popular' },
      { src: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=900', alt: 'Exhibición 2' },
      { src: 'https://images.unsplash.com/photo-1519336555923-59661f41bb53?auto=format&fit=crop&q=80&w=900', alt: 'Exhibición 3', badge: 'nuevo' },
    ],
    stats: [
      { label: 'Formato', value: 'Destacado' },
      { label: 'Uso', value: 'Presentación' },
      { label: 'Estética', value: 'Premium' },
    ],
    cta: { label: 'Volver al home', href: '/' },
  },
  '/empresa/quienes-somos': {
    eyebrow: 'Empresa',
    title: 'Quiénes somos y cómo trabajamos',
    intro: 'Somos un estudio enfocado en crear imágenes con intención, cuidando tanto la experiencia del cliente como el resultado final.',
    highlights: ['Equipo cercano', 'Proceso claro', 'Experiencia real', 'Atención personalizada'],
    sections: [
      {
        title: 'Nuestra misión',
        body: 'Hacer fotografía profesional con un trato humano, ordenado y confiable, desde la reserva hasta la entrega.',
        bullets: ['Confianza', 'Calidad', 'Transparencia'],
      },
      {
        title: 'Nuestra visión',
        body: 'Ser un estudio de referencia por la experiencia que damos y por la consistencia de nuestro trabajo.',
        bullets: ['Servicio premium', 'Resultados consistentes', 'Clientes satisfechos'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=900', alt: 'Equipo 1', badge: 'popular' },
      { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=900', alt: 'Equipo 2' },
      { src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=900', alt: 'Equipo 3', badge: 'nuevo' },
    ],
    stats: [
      { label: 'Experiencia', value: '8+ años' },
      { label: 'Enfoque', value: 'Premium' },
      { label: 'Ubicación', value: 'Metetí, Darién' },
    ],
    cta: { label: 'Contactarnos', href: '/contacto' },
  },
  '/contacto': {
    eyebrow: 'Empresa',
    title: 'Contacto directo para cotizar y reservar',
    intro: 'Escríbenos si quieres una sesión, una propuesta especial o resolver cualquier duda antes de reservar.',
    highlights: ['Respuesta clara', 'Atención rápida', 'Cotización', 'Reserva'],
    sections: [
      {
        title: 'Canales',
        body: 'Puedes escribirnos por teléfono, email o usar el formulario de la página principal.',
        bullets: ['Teléfono / Yappy', 'Correo', 'Formulario web'],
      },
      {
        title: 'Para cotizar mejor',
        body: 'Cuéntanos el tipo de sesión, la fecha aproximada y el estilo que buscas.',
        bullets: ['Fecha', 'Tipo de servicio', 'Presupuesto'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=900', alt: 'Contacto 1', badge: 'popular' },
      { src: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=900', alt: 'Contacto 2' },
      { src: 'https://images.unsplash.com/photo-1519336555923-59661f41bb53?auto=format&fit=crop&q=80&w=900', alt: 'Contacto 3', badge: 'nuevo' },
    ],
    stats: [
      { label: 'Horario', value: 'Lun a Sáb' },
      { label: 'Atención', value: 'Personalizada' },
      { label: 'Respuesta', value: 'Rápida' },
    ],
    cta: { label: 'Ir al formulario', href: '/#contacto' },
  },
  '/legal/politica-de-privacidad': {
    eyebrow: 'Legal',
    title: 'Política de privacidad',
    intro: 'Explicamos cómo protegemos la información de tus reservas, contacto y actividad dentro del sitio.',
    highlights: ['Protección de datos', 'Uso responsable', 'Transparencia', 'Seguridad'],
    sections: [
      {
        title: 'Datos que usamos',
        body: 'Solo utilizamos la información necesaria para gestionar tu cuenta, tus pedidos y la comunicación del servicio.',
        bullets: ['Nombre', 'Correo', 'Teléfono'],
      },
      {
        title: 'Compromiso',
        body: 'No compartimos tus datos fuera de los procesos necesarios para brindar el servicio y mantener la plataforma funcionando.',
        bullets: ['Uso limitado', 'Acceso controlado', 'Comunicación segura'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=900', alt: 'Privacidad 1', badge: 'nuevo' },
      { src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=900', alt: 'Privacidad 2' },
      { src: 'https://images.unsplash.com/photo-1519336555923-59661f41bb53?auto=format&fit=crop&q=80&w=900', alt: 'Privacidad 3', badge: 'popular' },
    ],
    stats: [
      { label: 'Documento', value: 'Vigente' },
      { label: 'Objetivo', value: 'Protección' },
      { label: 'Alcance', value: 'Usuarios' },
    ],
    cta: { label: 'Volver al inicio', href: '/' },
  },
  '/legal/terminos-del-servicio': {
    eyebrow: 'Legal',
    title: 'Términos del servicio',
    intro: 'Estas reglas ayudan a que el proceso de reserva, pago y entrega sea claro para ambas partes.',
    highlights: ['Reservas claras', 'Pagos definidos', 'Entrega ordenada', 'Condiciones visibles'],
    sections: [
      {
        title: 'Reservas',
        body: 'La reserva se confirma según disponibilidad y con la información necesaria para coordinar la sesión.',
        bullets: ['Fecha confirmada', 'Datos correctos', 'Comunicación previa'],
      },
      {
        title: 'Servicio',
        body: 'El alcance del trabajo depende del paquete o propuesta acordada antes de la sesión.',
        bullets: ['Alcance definido', 'Ajustes acordados', 'Entrega pactada'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=900', alt: 'Términos 1', badge: 'popular' },
      { src: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=900', alt: 'Términos 2' },
      { src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=900', alt: 'Términos 3', badge: 'nuevo' },
    ],
    stats: [
      { label: 'Estado', value: 'Activo' },
      { label: 'Uso', value: 'Servicios' },
      { label: 'Lectura', value: 'Importante' },
    ],
    cta: { label: 'Ver cookies', href: '/legal/politica-de-cookies' },
  },
  '/legal/politica-de-cookies': {
    eyebrow: 'Legal',
    title: 'Política de cookies',
    intro: 'Utilizamos cookies y almacenamiento local para mejorar la experiencia, mantener tu sesión y recordar tu carrito.',
    highlights: ['Sesión estable', 'Carrito guardado', 'Mejor experiencia', 'Preferencias'],
    sections: [
      {
        title: 'Qué guardamos',
        body: 'Datos técnicos y preferencias básicas necesarias para que la plataforma funcione correctamente.',
        bullets: ['Sesión', 'Carrito', 'Preferencias visuales'],
      },
      {
        title: 'Tu control',
        body: 'Puedes limpiar el almacenamiento del navegador cuando quieras y la app volverá a un estado básico.',
        bullets: ['Control del usuario', 'Sin complicaciones', 'Recuperación fácil'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1519336555923-59661f41bb53?auto=format&fit=crop&q=80&w=900', alt: 'Cookies 1', badge: 'popular' },
      { src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=900', alt: 'Cookies 2' },
      { src: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=900', alt: 'Cookies 3', badge: 'nuevo' },
    ],
    stats: [
      { label: 'Uso', value: 'Navegación' },
      { label: 'Guardado', value: 'Local' },
      { label: 'Impacto', value: 'Bajo' },
    ],
    cta: { label: 'Ir a tu cuenta', href: '/cuenta' },
  },
  '/cuenta': {
    eyebrow: 'Cuenta',
    title: 'Tu cuenta y accesos principales',
    intro: 'Aquí tienes acceso rápido a iniciar sesión, registrarte, ver tu panel y revisar tu carrito.',
    highlights: ['Acceso rápido', 'Panel personal', 'Carrito', 'Registro'],
    sections: [
      {
        title: 'Acciones',
        body: 'Usa esta página como centro para entrar al sistema o continuar tu compra.',
        bullets: ['Iniciar sesión', 'Crear cuenta', 'Ver carrito'],
      },
      {
        title: 'Después de entrar',
        body: 'Desde el panel podrás revisar tu información y desde el carrito podrás continuar el checkout.',
        bullets: ['Mi panel', 'Mis órdenes', 'Continuar compra'],
      },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=900', alt: 'Cuenta 1', badge: 'popular' },
      { src: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=900', alt: 'Cuenta 2' },
      { src: 'https://images.unsplash.com/photo-1519336555923-59661f41bb53?auto=format&fit=crop&q=80&w=900', alt: 'Cuenta 3', badge: 'nuevo' },
    ],
    stats: [
      { label: 'Acceso', value: 'Rápido' },
      { label: 'Flujo', value: 'Simple' },
      { label: 'Objetivo', value: 'Continuar compra' },
    ],
    cta: { label: 'Iniciar sesión', href: '/login' },
  },
};
