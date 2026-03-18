/**
 * Neomorphism Animation Hook
 * Provides smooth press animations and transitions for neomorphism UI
 */

const React = require('react');
const { Animated } = require('react-native');
const { designTokens } = require('../theme/tokens');

/**
 * Hook for press animation effect
 * Creates a smooth scale animation for press interactions
 * @returns {object} Animation value and press handlers
 * @example
 * const { animatedValue, handlePressIn, handlePressOut, animatedStyle } = useNeomorphismPress();
 */
function useNeomorphismPress(scaleAmount = 0.98) {
  const animatedValue = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = React.useCallback(() => {
    Animated.spring(animatedValue, {
      toValue: scaleAmount,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  }, [animatedValue, scaleAmount]);
  
  const handlePressOut = React.useCallback(() => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [animatedValue]);
  
  const animatedStyle = React.useMemo(
    () => ({
      transform: [{ scale: animatedValue }],
    }),
    [animatedValue]
  );
  
  return {
    animatedValue,
    handlePressIn,
    handlePressOut,
    animatedStyle,
  };
}

/**
 * Hook for fade animation
 * Creates opacity animation for show/hide transitions
 * @param {boolean} visible - Whether element should be visible
 * @param {number} duration - Animation duration in ms
 * @returns {object} Animated opacity value and style
 */
function useNeomorphismFade(visible = true, duration = designTokens.animation.normal) {
  const animatedValue = React.useRef(new Animated.Value(visible ? 1 : 0)).current;
  
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: visible ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [visible, animatedValue, duration]);
  
  const animatedStyle = React.useMemo(
    () => ({
      opacity: animatedValue,
    }),
    [animatedValue]
  );
  
  return {
    animatedValue,
    animatedStyle,
  };
}

/**
 * Hook for pulse animation
 * Creates a looping pulse effect for loading states
 * @param {boolean} active - Whether animation should be active
 * @returns {object} Animated value and style
 */
function useNeomorphismPulse(active = true) {
  const animatedValue = React.useRef(new Animated.Value(0.5)).current;
  
  React.useEffect(() => {
    if (!active) {
      animatedValue.setValue(1);
      return;
    }
    
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.5,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulseAnimation.start();
    
    return () => {
      pulseAnimation.stop();
      animatedValue.setValue(1);
    };
  }, [active, animatedValue]);
  
  const animatedStyle = React.useMemo(
    () => ({
      opacity: animatedValue,
    }),
    [animatedValue]
  );
  
  return {
    animatedValue,
    animatedStyle,
  };
}

/**
 * Hook for slide animation
 * Creates slide in/out animation from specified direction
 * @param {boolean} visible - Whether element should be visible
 * @param {string} direction - 'up', 'down', 'left', or 'right'
 * @param {number} distance - Distance to slide in pixels
 * @returns {object} Animated value and style
 */
function useNeomorphismSlide(visible = true, direction = 'up', distance = 50) {
  const animatedValue = React.useRef(new Animated.Value(visible ? 0 : distance)).current;
  
  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: visible ? 0 : distance,
      useNativeDriver: true,
      speed: 12,
      bounciness: 6,
    }).start();
  }, [visible, animatedValue, distance]);
  
  const animatedStyle = React.useMemo(() => {
    const transforms = {
      up: { translateY: animatedValue },
      down: { translateY: animatedValue.interpolate({
        inputRange: [0, distance],
        outputRange: [0, -distance],
      }) },
      left: { translateX: animatedValue },
      right: { translateX: animatedValue.interpolate({
        inputRange: [0, distance],
        outputRange: [0, -distance],
      }) },
    };
    
    return {
      transform: [transforms[direction] || transforms.up],
    };
  }, [animatedValue, direction, distance]);
  
  return {
    animatedValue,
    animatedStyle,
  };
}

module.exports = {
  useNeomorphismPress,
  useNeomorphismFade,
  useNeomorphismPulse,
  useNeomorphismSlide,
};
