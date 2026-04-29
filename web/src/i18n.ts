import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    lng: 'es', // Force Spanish as default
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      es: {
        translation: {
          app_name: "AcuaCore AI",
          welcome: "Bienvenido al Sistema Operativo Inteligente para Acuacultura",
          technical_support: "Soporte Técnico",
          biologists: "Biólogos",
          don_juan_camaron: "Don Juan Camarón",
          dashboard: "Tablero",
          tenants: "Empresas",
          skills: "Habilidades",
          hitl: "Validación Humana",
          logout: "Cerrar Sesión",
        },
      },
      en: {
        translation: {
          app_name: "AcuaCore AI",
          welcome: "Welcome to the Intelligent Operating System for Aquaculture",
          technical_support: "Technical Support",
          biologists: "Biologists",
          don_juan_camaron: "Don Juan Camaron",
          dashboard: "Dashboard",
          tenants: "Tenants",
          skills: "Skills",
          hitl: "Human-in-the-Loop",
          logout: "Logout",
        },
      },
    },
  });

export default i18n;
