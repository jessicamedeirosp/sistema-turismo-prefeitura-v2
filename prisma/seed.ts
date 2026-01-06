import { PrismaClient, Status, Category, CommonPageName } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Criar departamentos da cidade
  const cityDepartments = [
    {
      id: 'prefeitura',
      department: 'Prefeitura Municipal de São Sebastião',
      phone: '(12) 3891-2000',
      address: 'Av. Altino Arantes 174 - Centro',
      email: 'gabinete@saosebastiao.sp.gov.br',
      website: 'https://www.saosebastiao.sp.gov.br',
      hours: null,
      details: null,
      active: true,
    },
    {
      id: 'turismo',
      department: 'Secretaria de Turismo',
      phone: '(12) 3892-2620',
      address: 'Av. Altino Arantes 174 - Centro',
      email: 'turismo.setur@saosebastiao.sp.gov.br',
      website: 'https://www.turismosaosebastiao.com.br',
      hours: null,
      details: null,
      active: true,
    },
  ]

  for (const dept of cityDepartments) {
    await prisma.cityDepartment.upsert({
      where: { id: dept.id },
      update: {},
      create: dept,
    })
  }
  console.log('✅ Departamentos da cidade criados')
  console.log('🌱 Seeding database...')

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('vR7!xP@3mZ', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'turismoad.saosebastiao@gmail.com' },
    update: {},
    create: {
      email: 'turismoad.saosebastiao@gmail.com',
      password_hash: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin criado:', admin.email)

  // Criar tags para FOOD
  const foodTags = [
    { name: 'Frutos do Mar', icon: 'Fish' },
    { name: 'Comida Regional', icon: 'Utensils' },
    { name: 'Pizza', icon: 'Pizza' },
    { name: 'Hamburgueria', icon: 'Beef' },
    { name: 'Vegetariano', icon: 'Salad' },
    { name: 'Café', icon: 'Coffee' },
  ]

  for (const tag of foodTags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: {
        name: tag.name,
        category: 'FOOD',
        icon: tag.icon,
      },
    })
  }
  console.log('✅ Tags de alimentação criadas')

  // Criar tags para ACCOMMODATION
  const accommodationTags = [
    { name: 'Hotel', icon: 'Hotel' },
    { name: 'Pousada', icon: 'Home' },
    { name: 'Hostel', icon: 'Building' },
    { name: 'Airbnb', icon: 'Key' },
    { name: 'Pet Friendly', icon: 'Dog' },
    { name: 'Piscina', icon: 'Waves' },
    { name: 'Wi-Fi', icon: 'Wifi' },
  ]

  for (const tag of accommodationTags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: {
        name: tag.name,
        category: 'ACCOMMODATION',
        icon: tag.icon,
      },
    })
  }
  console.log('✅ Tags de acomodação criadas')

  // Criar templates de passeios
  const tourTemplates = [
    {
      name: 'Ilhabela Tour Completo',
      description: 'Conheça as principais praias e pontos turísticos de Ilhabela em um passeio completo de dia inteiro. Incluindo Praia do Bonete, Castelhanos e mirantes panorâmicos.',
      images: [
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800'
      ],
      requires_guide: true,
    },
    {
      name: 'Trilha da Cachoeira',
      description: 'Trilha ecológica até as belas cachoeiras da região. Nível moderado, com paradas para banho e contemplação da natureza. Duração aproximada de 4 horas.',
      images: [
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800'
      ],
      requires_guide: true,
    },
    {
      name: 'Passeio de Escuna',
      description: 'Navegue pelas águas cristalinas em uma tradicional escuna. Visitando ilhas, praias desertas e pontos de mergulho. Inclui almoço a bordo.',
      images: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      requires_guide: false,
    },
    {
      name: 'Tour Histórico Centro',
      description: 'Conheça a história de São Sebastião através de seus monumentos, casarões coloniais e igrejas históricas. Passeio cultural com guia especializado.',
      images: [
        'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800'
      ],
      requires_guide: true,
    },
    {
      name: 'Mergulho com Cilindro',
      description: 'Experiência de mergulho para iniciantes e avançados. Equipamento completo incluso. Explore a rica vida marinha da costa paulista.',
      images: [
        'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800'
      ],
      requires_guide: true,
    },
    {
      name: 'Passeio de Bike - Orla',
      description: 'Pedale pela orla de São Sebastião conhecendo as praias e quiosques locais. Bicicletas e equipamentos de segurança inclusos. Nível fácil.',
      images: [
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800'
      ],
      requires_guide: false,
    },
    {
      name: 'Observação de Baleias',
      description: 'Passeio de barco para observação de baleias jubarte (temporada de julho a novembro). Experiência única e inesquecível com a natureza.',
      images: [
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
      ],
      requires_guide: true,
    },
    {
      name: 'Standup Paddle',
      description: 'Aula e prática de Stand Up Paddle em águas calmas. Ideal para iniciantes e famílias. Equipamento completo fornecido.',
      images: [
        'https://images.unsplash.com/photo-1594717527389-f0a16f74d3a7?w=800'
      ],
      requires_guide: false,
    },
  ]

  for (const template of tourTemplates) {
    await prisma.tourTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: template,
    })
  }
  console.log('✅ Templates de passeios criados')

  // Criar redes sociais
  const socialMedias = [
    {
      name: 'Facebook',
      link: 'https://facebook.com/turismosaosebastiao',
      icon: 'Facebook',
      active: true,
    },
    {
      name: 'Instagram',
      link: 'https://instagram.com/turismosaosebastiao',
      icon: 'Instagram',
      active: true,
    },
    {
      name: 'Twitter / X',
      link: 'https://twitter.com/turismosaoseb',
      icon: 'Twitter',
      active: true,
    },
    {
      name: 'WhatsApp',
      link: 'https://wa.me/5512999999999',
      icon: 'MessageCircle',
      active: true,
    },
    {
      name: 'YouTube',
      link: 'https://youtube.com/@turismosaosebastiao',
      icon: 'Youtube',
      active: false,
    },
  ]

  for (const social of socialMedias) {
    await prisma.socialMedia.upsert({
      where: { name: social.name },
      update: {},
      create: social,
    })
  }
  console.log('✅ Redes sociais criadas')

  // Criar páginas do menu
  const commonPages = [
    {
      page: 'HOME',
      title: 'Home',
      video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      images: [],
      details: 'Página inicial do portal de turismo',
      active: true,
    },
    {
      page: 'TOUR',
      title: 'O Que Fazer?',
      images: [],
      details: 'Conheça os passeios e atividades disponíveis na região',
      active: true,
    },
    {
      page: 'BUSINESS_ACCOMMODATION',
      title: 'Onde Ficar?',
      images: [],
      details: 'Encontre as melhores opções de hospedagem',
      active: true,
    },
    {
      page: 'BUSINESS_FOOD',
      title: 'Onde Comer?',
      images: [],
      details: 'Descubra os melhores restaurantes e bares da região',
      active: true,
    },
    {
      page: 'EVENTS',
      title: 'Calendário de Eventos',
      images: [],
      details: 'Veja os próximos eventos e festivais',
      active: true,
    },
    {
      page: 'BEACH',
      title: 'Praias',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800'
      ],
      details: 'Conheça as praias paradisíacas de São Sebastião',
      active: true,
    },
    {
      page: 'NEWS',
      title: 'Notícias',
      images: [],
      details: 'Fique por dentro das novidades do turismo local',
      active: true,
    },
  ]

  for (const page of commonPages) {
    await prisma.commonPage.upsert({
      where: { page: page.page as any },
      update: {},
      create: page as any,
    })
  }
  console.log('✅ Páginas do menu criadas')

  // Criar praias
  const beaches = [
    {
      name: 'Praia de Maresias',
      address_district: 'Maresias',
      details: '<p>Uma das praias mais famosas do litoral norte paulista, conhecida por suas ondas perfeitas para o surf e vida noturna agitada.</p>',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800' // exemplo extra
      ],
      status: Status.APPROVED,
    },
    {
      name: 'Praia de Juquehy',
      address_district: 'Juquehy',
      details: '<p>Praia extensa com águas calmas, ideal para famílias. Possui ótima infraestrutura com quiosques e restaurantes.</p>',
      images: [
        'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800' // exemplo extra
      ],
      status: Status.APPROVED,
    },
    {
      name: 'Praia de Camburi',
      address_district: 'Camburi',
      details: '<p>Praia paradisíaca com mar cristalino, cercada pela Mata Atlântica. Perfeita para quem busca tranquilidade.</p>',
      images: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      status: Status.APPROVED,
    },
    {
      name: 'Praia de Boiçucanga',
      address_district: 'Boiçucanga',
      details: '<p>Praia familiar com águas calmas e areia clara. Ótima para crianças e esportes náuticos.</p>',
      images: [
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800'
      ],
      status: Status.APPROVED,
    },
  ]

  for (const beach of beaches) {
    await prisma.beach.create({
      data: beach,
    })
  }
  console.log('✅ Praias criadas')

  // Criar estabelecimentos - Restaurantes
  const restaurants = [
    {
      name: 'Restaurante Maré Alta',
      address_street: 'Av. Beira Mar',
      address_number: '123',
      address_district: 'Maresias',
      address_complement: 'Em frente à praia',
      phone_primary: '(12) 3865-1234',
      details: '<p>Especializado em frutos do mar frescos e pratos da culinária caiçara. Vista privilegiada para o mar.</p>',
      cnpj_cpf: '12345678000190',
      category: Category.FOOD,
      images: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800'
      ],
      cadastur: 'CAD123456',
      status: Status.APPROVED,
      user_id: admin.id,
    },
    {
      name: 'Pizzaria Bella Vista',
      address_street: 'Rua das Palmeiras',
      address_number: '456',
      address_district: 'Juquehy',
      phone_primary: '(12) 3865-5678',
      details: '<p>Pizzas artesanais em forno à lenha. Massa fina e crocante com ingredientes selecionados.</p>',
      cnpj_cpf: '98765432000180',
      category: Category.FOOD,
      images: [
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'
      ],
      cadastur: 'CAD789012',
      status: Status.APPROVED,
      user_id: admin.id,
    },
    {
      name: 'Café da Praia',
      address_street: 'Av. Walkir Vergani',
      address_number: '789',
      address_district: 'Camburi',
      phone_primary: '(12) 3865-9012',
      details: '<p>Café colonial e brunch à beira-mar. Ambiente aconchegante com produtos orgânicos.</p>',
      cnpj_cpf: '45678912000170',
      category: Category.FOOD,
      images: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800'
      ],
      cadastur: 'CAD345678',
      status: Status.APPROVED,
      user_id: admin.id,
    },
    {
      name: 'Churrascaria Boi na Brasa',
      address_street: 'Rua Central',
      address_number: '321',
      address_district: 'Centro',
      phone_primary: '(12) 3892-3456',
      details: '<p>Churrasco de primeira qualidade. Rodízio completo com buffet de saladas e acompanhamentos.</p>',
      cnpj_cpf: '78912345000160',
      category: Category.FOOD,
      images: [
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
      ],
      cadastur: 'CAD901234',
      status: Status.APPROVED,
      user_id: admin.id,
    },
  ]

  for (const restaurant of restaurants) {
    await prisma.business.create({
      data: restaurant,
    })
  }
  console.log('✅ Restaurantes criados')

  // Criar estabelecimentos - Acomodações
  const accommodations = [
    {
      name: 'Pousada Vista Mar',
      address_street: 'Rua da Praia',
      address_number: '100',
      address_district: 'Maresias',
      phone_primary: '(12) 3865-2000',
      details: '<p>Pousada charmosa com vista para o mar. Quartos confortáveis, café da manhã incluso e piscina.</p>',
      website: 'https://pousadavistama r.com.br',
      cnpj_cpf: '11222333000144',
      category: Category.ACCOMMODATION,
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      cadastur: 'CAD567890',
      status: Status.APPROVED,
      user_id: admin.id,
    },
    {
      name: 'Hotel Paradise',
      address_street: 'Av. Principal',
      address_number: '500',
      address_district: 'Juquehy',
      phone_primary: '(12) 3865-3000',
      details: '<p>Hotel 4 estrelas com spa, academia e restaurante. Perfeito para férias em família.</p>',
      website: 'https://hotelparadise.com.br',
      cnpj_cpf: '22333444000155',
      category: Category.ACCOMMODATION,
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
      ],
      cadastur: 'CAD678901',
      status: Status.APPROVED,
      user_id: admin.id,
    },
    {
      name: 'Chalés da Mata',
      address_street: 'Estrada da Cachoeira',
      address_number: '250',
      address_district: 'Camburi',
      phone_primary: '(12) 3865-4000',
      details: '<p>Chalés aconchegantes em meio à natureza. Experiência única de conexão com a Mata Atlântica.</p>',
      cnpj_cpf: '33444555000166',
      category: Category.ACCOMMODATION,
      images: [
        'https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=800'
      ],
      cadastur: 'CAD789012',
      status: Status.APPROVED,
      user_id: admin.id,
    },
    {
      name: 'Hostel Praia Hostel',
      address_street: 'Rua dos Surfistas',
      address_number: '75',
      address_district: 'Boiçucanga',
      phone_primary: '(12) 3865-5000',
      details: '<p>Hostel descolado para jovens viajantes. Ambiente animado, quartos compartilhados e privativos.</p>',
      cnpj_cpf: '44555666000177',
      category: Category.ACCOMMODATION,
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
      ],
      cadastur: 'CAD890123',
      status: Status.APPROVED,
      user_id: admin.id,
    },
  ]

  for (const accommodation of accommodations) {
    await prisma.business.create({
      data: accommodation,
    })
  }
  console.log('✅ Acomodações criadas')

  // Criar notícias
  const newsArticles = [
    {
      title: 'Nova temporada de baleias em São Sebastião',
      content: '<p>A temporada de observação de baleias jubarte começou em São Sebastião. Entre julho e novembro, é possível avistar esses mamíferos marinhos durante passeios de barco pela costa. Os animais migram da Antártida para as águas mais quentes do Brasil para se reproduzir.</p><p>Operadoras locais estão oferecendo tours especializados com guias experientes. A prática de observação segue normas ambientais rigorosas para não perturbar os animais em seu habitat natural.</p>',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      author: 'Redação Turismo SS',
      active: true,
    },
    {
      title: 'Novo restaurante inaugurado em Maresias',
      content: '<p>O badalado Restaurante Maré Alta acaba de inaugurar em Maresias, prometendo revolucionar a gastronomia local com pratos contemporâneos inspirados na culinária caiçara.</p><p>O chef renomado combina ingredientes locais frescos com técnicas modernas, criando uma experiência gastronômica única à beira-mar.</p>',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      author: 'Maria Silva',
      active: true,
    },
    {
      title: 'Trilhas ecológicas ganham novas placas de sinalização',
      content: '<p>A Secretaria de Turismo instalou novas placas de sinalização nas principais trilhas ecológicas de São Sebastião. O projeto visa melhorar a segurança e orientação dos visitantes que exploram as belezas naturais da região.</p><p>As trilhas da Cachoeira do Ribeirão, Praia Brava e Costão das Galhetas receberam as melhorias. Mapas interativos também estão disponíveis online.</p>',
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
      author: 'João Santos',
      active: true,
    },
    {
      title: 'Festival de Verão movimenta turismo local',
      content: '<p>O tradicional Festival de Verão de São Sebastião está de volta em janeiro, trazendo shows, gastronomia e atividades para toda a família. O evento acontece na orla de Maresias e espera receber milhares de visitantes.</p><p>A programação inclui apresentações de artistas nacionais, feira de artesanato, food trucks e área kids. A entrada é gratuita.</p>',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
      author: 'Ana Costa',
      active: true,
    },
  ]

  for (const article of newsArticles) {
    await prisma.news.create({
      data: article,
    })
  }
  console.log('✅ Notícias criadas')

  // Criar evento de exemplo
  const event = await prisma.event.upsert({
    where: {
      id: 'clx0001evento0000000001'
    },
    update: {},
    create: {
      id: 'clx0001evento0000000001',
      name: 'Festival de Verão São Sebastião',
      date: new Date('2026-01-15T18:00:00'),
      location: 'Praia de Maresias',
      details: 'Grande festival de verão com shows ao vivo, food trucks e atividades para toda a família. Venha celebrar o verão na melhor praia da região!',
      images: [
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'
      ],
      active: true,
    },
  })
  console.log('✅ Evento criado:', event.name)

  // Criar mais eventos
  const moreEvents = [
    {
      name: 'Campeonato de Surf Maresias Pro',
      date: new Date('2026-02-20T08:00:00'),
      location: 'Praia de Maresias',
      details: 'Etapa do circuito paulista de surf profissional. Surfistas de todo o Brasil competindo nas ondas de Maresias.',
      images: [
        'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800'
      ],
      active: true,
    },
    {
      name: 'Festival Gastronômico - Sabores do Litoral',
      date: new Date('2026-03-10T12:00:00'),
      location: 'Centro Histórico',
      details: 'Degustação de pratos típicos da culinária caiçara. Mais de 20 restaurantes participantes.',
      images: [
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
      ],
      active: true,
    },
    {
      name: 'Corrida Rústica do Litoral Norte',
      date: new Date('2026-04-15T07:00:00'),
      location: 'Orla de Juquehy',
      details: 'Corrida de 5km e 10km pela orla. Para atletas e amadores. Paisagens deslumbrantes.',
      images: [
        'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800'
      ],
      active: true,
    },
  ]

  for (const evt of moreEvents) {
    await prisma.event.create({
      data: evt,
    })
  }
  console.log('✅ Mais eventos criados')

  // Criar estacionamento de exemplo
  const parking = await prisma.parking.upsert({
    where: {
      id: 'clx0001parking0000000001'
    },
    update: {},
    create: {
      id: 'clx0001parking0000000001',
      company: 'Estacionamento Central Maresias',
      address: 'Av. Dr. Francisco Loup, 1234',
      address_district: 'Maresias',
      phone: '(12) 3862-1234',
      email: 'contato@centralmaresias.com.br',
      route_link: 'https://maps.google.com/?q=-23.8008,-45.5565',
      van: true,
      micro: true,
      onibus: true,
      active: true,
    },
  })
  console.log('✅ Estacionamento criado:', parking.company)

  // Criar bairros de São Sebastião
  const districts = [
    { name: 'Centro' },
    { name: 'Maresias' },
    { name: 'Juquehy' },
    { name: 'Camburi' },
    { name: 'Cambury' },
    { name: 'Boiçucanga' },
    { name: 'Barra do Sahy' },
    { name: 'Barra do Una' },
    { name: 'Guaecá' },
    { name: 'Toque Toque Grande' },
    { name: 'Toque Toque Pequeno' },
    { name: 'Paúba' },
    { name: 'Barequeçaba' },
    { name: 'São Francisco' },
    { name: 'Enseada' },
    { name: 'Cigarras' },
    { name: 'Porto Grande' },
    { name: 'Pontal da Cruz' },
  ]

  for (const district of districts) {
    await prisma.district.upsert({
      where: { name: district.name },
      update: {},
      create: district,
    })
  }
  console.log('✅ Bairros criados')

  // Páginas do rodapé
  const footerPages = [
    {
      title: 'Condições das Estradas',
      only_footer: true,
      link_externo: 'https://www.der.sp.gov.br/WebSite/Servicos/ServicosOnline/CondicaoRodovias.aspx',
      details: '',
      images: [],
      active: true,
      page: CommonPageName.RODOVIAS,
    },
    {
      title: 'Política de Privacidade',
      only_footer: true,
      link_externo: null,
      details: '',
      images: [],
      active: true,
      page: CommonPageName.PRIVACIDADE,
    },
    {
      title: 'Informações úteis',
      only_footer: true,
      link_externo: null,
      details: '',
      images: [],
      active: true,
      page: CommonPageName.USEFULLINFO,
    },
    {
      title: 'Observatório de Turismo',
      only_footer: true,
      link_externo: null,
      details: '',
      images: [],
      active: true,
      page: CommonPageName.OBSERVATORY,
    },
    {
      title: 'Autorizações para entrada de veículos',
      only_footer: true,
      link_externo: null,
      details: '',
      images: [],
      active: true,
      page: CommonPageName.VEHICLE,
    },
    {
      title: 'Agências Credenciadas',
      only_footer: true,
      link_externo: null,
      details: '',
      images: [],
      active: true,
      page: CommonPageName.AGENCIES,
    },
    {
      title: 'Case-se na praia',
      only_footer: true,
      link_externo: null,
      details: `São Sebastião possui diversas opções de espaços para casamentos, desde os mais íntimos até os mais glamorosos. São diversas opções de hotéis, pousadas, espaços para festas e restaurantes, tudo com uma vista paradisíaca para tornar esse momento ainda mais inesquecível.<br><br>O primeiro passo para quem quer casar na praia é conversar com um dos especialistas locais, que poderão orientá-lo sobre locais, fornecedores, etc. Ou, se preferir, entre em contato direto com alguns espaços e hotéis disponíveis em nosso portal.<br><br><strong>AUTORIZAÇÃO PARA EVENTOS OU CASAMENTO NA PRAIA</strong><br>Caso opte por realizar o evento em uma área pública, será necessário solicitar autorização à Prefeitura de São Sebastião com 30 dias de antecedência através da Central de Serviços.<br><br><strong>Solicitar Autorização</strong> Documentos Necessários<br><br><strong>Documentos necessários:</strong><ul><li>Requerimento com descrição do evento;</li><li>Croqui do Evento;</li><li>Cópia do CPF e RG dos noivos ou, no caso de empresa, CNPJ e Contrato Social;</li><li>Comprovante de endereço com CEP;</li><li>Plantas das estruturas que serão montadas, com indicação do responsável técnico e ART;</li><li>Declaração dos Serviços tomados para realização do evento;</li><li>Contrato de todos os prestadores de serviço do evento (buffet, segurança, decoração, etc);</li><li>Termo de compromisso para montagem, desmontagem e limpeza do evento;</li><li>Termo de responsabilidade por danos ao meio ambiente e a terceiros;</li><li>Pagamento das taxas de ocupação e fiscalização (após deferimento da Comissão de Eventos).</li></ul>Em caso de dúvidas, entre em contato pelo telefone (12) 3892-2620 ou pelo e-mail <a href='mailto:turismo.casamentos@saosebastiao.sp.gov.br'>turismo.casamentos@saosebastiao.sp.gov.br</a><br><br><strong>PARA DEMAIS EVENTOS E AÇÕES PROMOCIONAIS:</strong><br><a href="#">Clique aqui para visualizar e baixar a relação de documentos necessários para ações promocionais</a><br><br>Em caso de dúvidas, entre em contato pelo telefone (12) 3892-2620 ou pelo e-mail <a href='mailto:turismo.casamentos@saosebastiao.sp.gov.br'>turismo.casamentos@saosebastiao.sp.gov.br</a>`,
      images: [],
      active: true,
      page: CommonPageName.MARRIAGE,
    },
    {
      title: 'Política de Privacidade',
      only_footer: false,
      link_externo: null,
      details: `PRIVACIDADE<br><br>Última atualização: 13/11/2024<br><br><strong>1. Dados que Coletamos</strong><br>Coletamos dados pessoais fornecidos voluntariamente, como nome, telefone, e outros dados de contato que você nos fornecer.<br><br><strong>2. Como Utilizamos seus Dados</strong><br>Utilizamos seus dados para prestar serviços e responder a solicitações. Seus dados também podem ser usados para melhorar a experiência do usuário.<br><br><strong>3. Compartilhamento de Dados</strong><br>Não compartilhamos seus dados com terceiros, exceto conforme exigido por lei ou para proteger nossos direitos.<br><br><strong>4. Armazenamento e Segurança dos Dados</strong><br>Mantemos medidas de segurança apropriadas para proteger seus dados contra acesso não autorizado.<br><br><strong>5. Seus Direitos</strong><br>Você pode acessar, corrigir ou excluir seus dados pessoais, e revogar seu consentimento quando desejar.<br><br><strong>6. Alterações nesta Política</strong><br>Podemos atualizar esta Política de Privacidade. A versão mais recente estará sempre disponível nesta página.<br><br><strong>7. Contato</strong><br>Para dúvidas ou solicitações, entre em contato conosco:<br><br>Prefeitura Municipal de São Sebastião<br>Telefone: (12) 3891 2000<br>Endereço: Rua Sebastião Silvestre Neves, 214 - Centro`,
      images: [],
      active: true,
      page: CommonPageName.PRIVACIDADE,
    },
    {
      title: 'Guias de Turismo Credenciados',
      only_footer: true,
      link_externo: null,
      details: '',
      images: [],
      active: true,
      page: CommonPageName.GUIDE,
    },
    {
      title: 'Arquivos disponiveís para downloads',
      only_footer: true,
      link_externo: null,
      details: '',
      images: [],
      active: true,
      page: CommonPageName.DOWNLOAD,
    },
    {
      title: 'COMTUR',
      only_footer: true,
      link_externo: null,
      details: '',
      images: [],
      active: true,
      page: CommonPageName.COMTUR,
    },
    {
      title: 'Informações Turísticas',
      only_footer: true,
      link_externo: null,
      details: '',
      images: [],
      active: true,
      page: CommonPageName.INFOS,
    },
    {
      title: 'Cadastre o seu Estabelecimento',
      only_footer: true,
      link_externo: null,
      details: '',
      images: [],
      active: true,
      page: CommonPageName.CAD_ESTAB,
    },
    {
      title: 'Cadastro de Guia de turismo',
      only_footer: true,
      link_externo: null,
      details: '',
      images: [],
      active: true,
      page: CommonPageName.CAD_GUIA,
    },
    {
      title: 'Previsão do Tempo',
      only_footer: true,
      link_externo: 'https://www.cptec.inpe.br/cidades/5051',
      details: '',
      images: [],
      active: true,
      page: CommonPageName.TEMPO,
    },
    {
      title: 'Transporte Municipal e Intermunicipal',
      only_footer: true,
      link_externo: 'https://www.emtu.sp.gov.br/emtu/redes-de-transporte/corredores-terminais/linhas-intermunicipais/encontre-uma-linha/pela-rua-do-itinerario.fss',
      details: '',
      images: [],
      active: true,
      page: CommonPageName.TRANSPORTE,
    },
  ]

  for (const page of footerPages) {
    await prisma.commonPage.upsert({
      where: { page: page.page },
      update: {
        only_footer: true,
        link_externo: page.link_externo,
        title: page.title,
        details: page.details,
        images: page.images,
        active: true,
      },
      create: {
        ...page,
        details: page.details,
        images: page.images,
        active: true,
      },
    })
  }
  console.log('✅ Páginas do rodapé criadas')

  console.log('🎉 Seeding concluído!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
