import { Timestamp } from 'firebase/firestore';

export const sessions = [
  {
    count: 0,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
    date: {
      start: Timestamp.fromDate(new Date('2025-08-02T09:00:00-04:00')),
      end: Timestamp.fromDate(new Date('2025-08-02T18:00:00-04:00')),
    },
    description:
      '¿Quieres darle vida a tus aplicaciones móviles? En este taller aprenderás los conceptos fundamentales para implementar animaciones en Android utilizando Kotlin y Jetpack Compose. Exploraremos desde transiciones básicas hasta efectos dinámicos que mejoran la experiencia de usuario. Ideal para desarrolladores que están dando sus primeros pasos en Compose o buscan enriquecer sus interfaces con animaciones fluidas y modernas. A lo largo del taller construiremos ejemplos prácticos para que te lleves herramientas listas para aplicar en tus proyectos.',
    eventId: 'io-tarija-2025',
    isActive: true,
    limit: 25,
    name: 'Animaciones en Android con Compose',
    overlapsWith: [],
    requirements: 'Computadora portátil',
    speaker: {
      email: '',
      name: 'Irvin Cossion Chavalier',
      photoUrl:
        'https://firebasestorage.googleapis.com/v0/b/combi-events.appspot.com/o/events%2Ftaller-irvin-io-tarija-2025.webp?alt=media&token=c42d7afe-9261-42da-9c76-c3bcc254646d',
    },
  },
  {
    count: 0,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
    date: {
      start: Timestamp.fromDate(new Date('2025-08-02T09:00:00-04:00')),
      end: Timestamp.fromDate(new Date('2025-08-02T18:00:00-04:00')),
    },
    description:
      '¿Puede una herramienta en tu terminal entenderte, ayudarte a escribir código, responder preguntas, generar imágenes y automatizar tareas sin complicaciones? Con Gemini CLI, todo esto es posible: solo indica lo que necesitas y observa cómo tu terminal cobra vida. En este taller aprenderás a utilizar esta poderosa herramienta basada en inteligencia artificial para potenciar tu flujo de trabajo desde la línea de comandos. Descubrirás comandos útiles, flujos automatizados y tips para aprovechar al máximo esta nueva forma de interactuar con la tecnología desde tu terminal.',
    eventId: 'io-tarija-2025',
    isActive: true,
    limit: 25,
    name: 'Conversando con tu Terminal: Gemini CLI',
    overlapsWith: [],
    requirements: 'Computadora portátil',
    speaker: {
      email: '',
      name: 'Esther Romero Aguilar y Gabriel Pantoja Bustamante',
      photoUrl:
        'https://firebasestorage.googleapis.com/v0/b/combi-events.appspot.com/o/events%2Ftaller-esther-gabriel-io-tarija-2025.webp?alt=media&token=e10bec84-b89d-475f-aeda-930bc485139a',
    },
  },
  {
    count: 0,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
    date: {
      start: Timestamp.fromDate(new Date('2025-08-02T09:00:00-04:00')),
      end: Timestamp.fromDate(new Date('2025-08-02T18:00:00-04:00')),
    },
    description:
      'En este taller aprenderás a construir funciones con Firebase desde cero y a llevarlas al siguiente nivel integrando inteligencia artificial con GenKit, el nuevo framework de Google para desarrollar experiencias generativas directamente desde tu backend. Comenzaremos con una introducción práctica a Firebase Functions y Firestore, para luego crear endpoints inteligentes capaces de generar respuestas, resumir textos o interactuar con usuarios de forma dinámica. No necesitas experiencia previa en backend: este taller es ideal tanto para quienes quieren dar su primer paso con Firebase, como para desarrolladores que buscan integrar IA en sus apps sin complicaciones. Si alguna vez soñaste con que tu API piense, este es el momento de hacerlo realidad.',
    eventId: 'io-tarija-2025',
    isActive: true,
    limit: 25,
    name: '¿Y si tu backend pensara? Bienvenido a GenKit.',
    overlapsWith: [],
    requirements: 'Computadora portátil',
    speaker: {
      email: '',
      name: 'Sebastian Gonzales Tito',
      photoUrl:
        'https://firebasestorage.googleapis.com/v0/b/combi-events.appspot.com/o/events%2Ftaller-sebastian-io-tarija-2025.webp?alt=media&token=5301ffd8-20b2-4db9-a986-be497c3f75c1',
    },
  },
];
