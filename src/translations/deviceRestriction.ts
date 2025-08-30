import { SupportedLanguage } from '~/hooks/useLanguageDetection';

export interface DeviceRestrictionTranslations {
  title: string;
  subtitle: string;
  qrLabel: string;
  instructionTitle: string;
  instructionText: string;
}

const englishTranslations: DeviceRestrictionTranslations = {
  title: 'Mobile Only App',
  subtitle: 'This application is optimized exclusively for mobile phones. For the best experience, please access it using your smartphone.',
  qrLabel: 'Scan this QR code with your phone',
  instructionTitle: '📋 How to access:',
  instructionText: '1. Open your phone\'s camera app\n2. Point it at the QR code above\n3. Tap the notification to open the app\n\nOr simply visit this page on your mobile browser.',
};

const frenchTranslations: DeviceRestrictionTranslations = {
  title: 'Application Mobile Uniquement',
  subtitle: 'Cette application est optimisée exclusivement pour les téléphones mobiles. Pour une meilleure expérience, veuillez y accéder avec votre smartphone.',
  qrLabel: 'Scannez ce code QR avec votre téléphone',
  instructionTitle: '📋 Comment accéder :',
  instructionText: '1. Ouvrez l\'application appareil photo de votre téléphone\n2. Pointez-le vers le code QR ci-dessus\n3. Appuyez sur la notification pour ouvrir l\'application\n\nOu visitez simplement cette page sur votre navigateur mobile.',
};

export const getDeviceRestrictionTranslations = (language: SupportedLanguage): DeviceRestrictionTranslations => {
  switch (language) {
    case 'fr':
      return frenchTranslations;
    case 'en':
    default:
      return englishTranslations;
  }
};
