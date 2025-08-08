import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

type KeyboardDebugLineProps = {
  tabBarHeight?: number;
};

/**
 * Renders a bright green horizontal line (3px) that follows the keyboard's top edge.
 * When the keyboard is hidden, it sits just above the tab bar.
 */
export const KeyboardDebugLine: React.FC<KeyboardDebugLineProps> = ({ tabBarHeight = 0 }) => {
  const keyboard = useAnimatedKeyboard();

  const animatedStyle = useAnimatedStyle(() => {
    // When keyboard is open/moving, height.value reflects the current keyboard height.
    // When closed, height.value is 0, so we fall back to the tab bar height.
    const bottomOffset = keyboard.height.value > 0 ? keyboard.height.value : tabBarHeight;
    return {
      bottom: bottomOffset,
    };
  }, [tabBarHeight]);

  return <Animated.View pointerEvents="none" style={[styles.line, animatedStyle]} />;
};

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#00FF00',
    zIndex: 9999,
  },
});

export default KeyboardDebugLine;


