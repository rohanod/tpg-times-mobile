import { useEffect } from 'react';
import { Keyboard, Dimensions } from 'react-native';
import { useSharedValue, withTiming, withSpring, Easing } from 'react-native-reanimated';

export const useKeyboardHandler = () => {
  const keyboardHeight = useSharedValue(0);
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
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
  }, [keyboardHeight]);

  return {
    keyboardHeight,
    screenHeight,
  };
};