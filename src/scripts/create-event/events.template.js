import { Timestamp, GeoPoint } from 'firebase/firestore';

export const events = [
  {
    additionalQuestions: [
      {
        key: 'phoneNumber',
        label: 'Número de celular',
        required: true,
        type: 'text',
      },
      {
        key: 'ci',
        label: 'Cédula de identidad',
        required: true,
        type: 'text',
      },
      {
        key: 'gender',
        label: '¿Con qué género te identificas?',
        options: [
          'Femenino',
          'Masculino',
          'Otro',
        ],
        required: false,
        type: 'select',
        multiple: false,
      },
    ],
    additionalRegistrationInfo: 'No olvides llevar tu carnet de identidad y este código QR el día del evento.',
    admins: [
      'natalia.callet@gmail.com',
      'valeriaburgos6@gmail.com',
      'damarismamani27@gmail.com',
      'marcia.andrade.llanos@gmail.com',
      'jhositaf@gmail.com',
      'mauricio.arce.mat@gmail.com'
    ],
    bannerImage:
      'https://firebasestorage.googleapis.com/v0/b/combi-events.appspot.com/o/events%2Fiwd-tarija-2025-banner.webp?alt=media&token=c840eff3-b4fb-4fd6-b3ce-8445bc7cce26',
    capacity: 80,
    count: 0,
    createdAt: Timestamp.fromDate(new Date()),
    date: {
      start: Timestamp.fromDate(new Date('2025-03-22T08:30:00-04:00')),
      end: Timestamp.fromDate(new Date('2025-03-22T12:00:00-04:00')),
    },
    description:
      "🌟 <b>International Women's Day Tarija 2025 - ¡Redefine lo posible!</b> 💜<br><br>Las comunidades <b>WTM y GDG Tarija</b> te invitan a ser parte del <b>IWD Tarija 2025</b>, un evento diseñado para inspirar, conectar y empoderar a mujeres en tecnología.<br><br><b>¿Qué encontrarás en IWD Tarija 2025?</b><br><br>✅ <b>Charlas y paneles</b> con expertas en tecnología y liderazgo.<br>✅ <b>Historias inspiradoras</b> de mujeres que están redefiniendo lo posible.<br>✅ <b>Espacios de networking</b> para conectar con profesionales y entusiastas de la tecnología.<br>✅ <b>Workshops y mentorías</b> para potenciar tu crecimiento profesional.<br><br>💡 <b>No importa si eres estudiante, profesional o simplemente tienes interés en la tecnología, este evento es para ti.</b> Ven a aprender, inspirarte y formar parte de una comunidad que está impactando el futuro.<br><br>📌 <b>¡Reserva la fecha y únete a esta experiencia única!</b> 🚀💜",
    hasMarketplace: false,
    hasSessions: false,
    id: 'iwd-tarija-2025',
    image:
      'https://firebasestorage.googleapis.com/v0/b/combi-events.appspot.com/o/events%2Fiwd-tarija-2025.webp?alt=media&token=0af14cad-9058-4ae2-9f85-4f3dfbc25684',
    listEvent: true,
    location: {
      name: 'Universidad Bolivariana, Tarija, Bolivia',
      geolocation: new GeoPoint(-21.531975640976366, -64.73089971708042),
    },
    maxSessionsPerUser: 0,
    name: 'Angular Meetup | La Paz',
    openMarketplace: false,
    openRegistration: true,
    owner: 'pedro2528anze@gmail.com',
    price: {
      amount: 10,
      currency: 'BOB',
      discount: 0,
      description: 'Registro IWD Tarija 2025',
    },
    shortDescription:
      'IWD Tarija 2025, organizado por Women Techmakers, es un evento que celebra y potencia el rol de las mujeres en tecnología. Se llevará a cabo el 22 de marzo en la Universidad Unión Bolivariana, con 6 speakers locales y nacionales, dinámicas interactivas, premios, regalos y un espacio diseñado para inspirar, conectar y fortalecer la comunidad tecnológica en Tarija.',
    updatedAt: Timestamp.fromDate(new Date()),
  },
];
