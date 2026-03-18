/**
 * Progress Circle Component
 * Animated circular progress indicator with neomorphism styling
 */

const React = require('react');
const { View, Text, StyleSheet, Animated } = require('react-native');
const { Svg, Circle } = require('react-native-svg');
const { useTheme } = require('../../hooks/useTheme');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * ProgressCircle component
 * @param {object} props
 * @param {number} props.progress - Progress value (0-1)
 * @param {number} props.size - Circle size in pixels
 * @param {number} props.strokeWidth - Stroke width
 * @param {ReactNode} props.children - Content to display in center
 * @param {object} props.style - Additional container styles
 */
function ProgressCircle({
  progress = 0,
  size = 120,
  strokeWidth = 8,
  children,
  style,
}) {
  const { theme } = useTheme();
  const animatedProgress = React.useRef(new Animated.Value(0)).current;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  React.useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: progress,
      useNativeDriver: true,
      speed: 8,
      bounciness: 4,
    }).start();
  }, [progress, animatedProgress]);
  
  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.surfaceContainerHighest || theme.colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

module.exports = ProgressCircle;
