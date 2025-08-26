import { useEffect } from 'react';
import { Keyboard, Dimensions, Platform } from 'react-native';
import { useSharedValue, withTiming, withSpring, Easing } from 'react-native-reanimated';

// Web-specific keyboard class management
declare global {
  interface Window {
    webKeyboardHandler?: {
      setKeyboardOpen: (open: boolean) => void;
    };
  }
}

export const useKeyboardHandler = () => {
  const keyboardHeight = useSharedValue(0);
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    // Web-specific keyboard detection
    if (typeof Platform !== 'undefined' && Platform.OS === 'web') {
      let currentKeyboardHeight = 0;

      // Set up global handler for HTML script to call
      window.webKeyboardHandler = {
        setKeyboardOpen: (open: boolean) => {
          if (open && currentKeyboardHeight === 0) {
            currentKeyboardHeight = 250; // Default keyboard height
            keyboardHeight.value = withSpring(currentKeyboardHeight, {
              damping: 15,
              stiffness: 150,
              mass: 1,
            });
          } else if (!open && currentKeyboardHeight > 0) {
            currentKeyboardHeight = 0;
            keyboardHeight.value = withTiming(0, {
              duration: 300,
              easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            });
          }
        }
      };

      return () => {
        if (window.webKeyboardHandler) {
          delete window.webKeyboardHandler;
        }
      };
    } else {
      // Native platform keyboard detection
      const showSubscription = Keyboard.addListener('keyboardWillShow', (e) => {
        keyboardHeight.value = withSpring(e.endCoordinates.height, {
          damping: 15,
          stiffness: 150,
          mass: 1,
        });
      });

      const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
        keyboardHeight.value = withTiming(0, {
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        });
      });

      // For Android, use keyboardDidShow/Hide since keyboardWillShow/Hide might not be available
      const didShowSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
        if (keyboardHeight.value === 0) {
          keyboardHeight.value = withSpring(e.endCoordinates.height, {
            damping: 15,
            stiffness: 150,
            mass: 1,
          });
        }
      });

      const didHideSubscription = Keyboard.addListener('keyboardDidHide', () => {
        keyboardHeight.value = withTiming(0, {
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        });
      });

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
        didShowSubscription.remove();
        didHideSubscription.remove();
      };
    }
  }, [keyboardHeight]);

  return {
    keyboardHeight,
    screenHeight,
  };
};