const React = require('react');
const { View, Text, StyleSheet, Animated, Easing } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { designTokens } = require('../../theme/tokens');
const NeoModal = require('./Modal');
const Button = require('./Button');
const AppIcon = require('./AppIcon');

function buildMilestoneCopy(streakDays) {
  if (streakDays >= 30) {
    return {
      eyebrow: 'Streak Unlocked',
      title: '30 Days Strong',
      message: 'You kept your streak alive for a full month. That is serious consistency.',
      cta: 'Keep the streak',
    };
  }

  if (streakDays >= 14) {
    return {
      eyebrow: 'Streak Unlocked',
      title: '14 Days Strong',
       message: 'Two weeks in a row. Your routine is looking solid.',
      cta: 'Stay consistent',
    };
  }

  if (streakDays >= 7) {
    return {
      eyebrow: 'Streak Unlocked',
      title: '7 Days Strong',
       message: 'One full week in a row. Great job staying consistent.',
      cta: 'Keep going',
    };
  }

  if (streakDays >= 5) {
    return {
      eyebrow: 'Streak Growing',
      title: '5-Day Streak',
      message: 'You are building a solid rhythm. Keep the streak alive.',
      cta: 'Nice work',
    };
  }

  if (streakDays >= 3) {
    return {
      eyebrow: 'Streak Growing',
      title: '3-Day Streak',
      message: 'Three days in a row. Your momentum is building.',
      cta: 'Keep going',
    };
  }

  return {
    eyebrow: 'Streak Started',
    title: '2-Day Streak',
    message: 'You are off to a strong start. Come back tomorrow and keep it alive.',
    cta: 'Got it',
  };
}

function buildMilestoneVisuals(streakDays, theme) {
  const isDark = theme.name === 'dark';

  if (streakDays >= 30) {
    return {
      primary: isDark ? '#facc15' : '#d97706',
      secondary: isDark ? '#fb7185' : '#db2777',
      accentBackground: isDark ? 'rgba(250, 204, 21, 0.16)' : 'rgba(217, 119, 6, 0.12)',
      warmAccent: isDark ? 'rgba(251, 113, 133, 0.18)' : 'rgba(219, 39, 119, 0.14)',
      softAccent: isDark ? 'rgba(250, 204, 21, 0.12)' : 'rgba(245, 158, 11, 0.10)',
      iconBackground: isDark ? 'rgba(250, 204, 21, 0.18)' : 'rgba(255, 247, 237, 0.96)',
      modalBackground: isDark ? '#1f1820' : '#fff7ed',
      modalBorder: isDark ? '#5b4b12' : '#f59e0b',
    };
  }

  if (streakDays >= 14) {
    return {
      primary: isDark ? '#a78bfa' : '#7c3aed',
      secondary: isDark ? '#67e8f9' : '#0891b2',
      accentBackground: isDark ? 'rgba(167, 139, 250, 0.16)' : 'rgba(124, 58, 237, 0.10)',
      warmAccent: isDark ? 'rgba(103, 232, 249, 0.18)' : 'rgba(8, 145, 178, 0.14)',
      softAccent: isDark ? 'rgba(167, 139, 250, 0.10)' : 'rgba(139, 92, 246, 0.09)',
      iconBackground: isDark ? 'rgba(167, 139, 250, 0.2)' : 'rgba(245, 243, 255, 0.96)',
      modalBackground: isDark ? '#17162a' : '#f6f3ff',
      modalBorder: isDark ? '#54439a' : '#8b5cf6',
    };
  }

  if (streakDays >= 7) {
    return {
      primary: isDark ? '#fb923c' : '#ea580c',
      secondary: isDark ? '#facc15' : '#ca8a04',
      accentBackground: isDark ? 'rgba(251, 146, 60, 0.15)' : 'rgba(234, 88, 12, 0.10)',
      warmAccent: isDark ? 'rgba(250, 204, 21, 0.18)' : 'rgba(202, 138, 4, 0.14)',
      softAccent: isDark ? 'rgba(251, 146, 60, 0.10)' : 'rgba(249, 115, 22, 0.08)',
      iconBackground: isDark ? 'rgba(251, 146, 60, 0.2)' : 'rgba(255, 247, 237, 0.96)',
      modalBackground: isDark ? '#201814' : '#fff7ed',
      modalBorder: isDark ? '#8b4b19' : '#f97316',
    };
  }

  return {
    primary: theme.colors.primary,
    secondary: theme.colors.warning,
    accentBackground: isDark ? 'rgba(125, 166, 255, 0.12)' : 'rgba(47, 95, 167, 0.08)',
    warmAccent: isDark ? 'rgba(251, 191, 36, 0.18)' : 'rgba(245, 158, 11, 0.16)',
    softAccent: isDark ? 'rgba(103, 198, 217, 0.16)' : 'rgba(76, 141, 181, 0.14)',
    iconBackground: theme.colors.infoBg,
    modalBackground: theme.colors.surface,
    modalBorder: theme.colors.border,
  };
}

function StreakCelebrationModal({
  visible,
  streakDays = 0,
  onClose,
}) {
  const { theme } = useTheme();
  const copy = buildMilestoneCopy(streakDays);
  const visuals = buildMilestoneVisuals(streakDays, theme);
  const entranceOpacity = React.useRef(new Animated.Value(0)).current;
  const entranceTranslate = React.useRef(new Animated.Value(18)).current;
  const heroScale = React.useRef(new Animated.Value(0.9)).current;
  const numberScale = React.useRef(new Animated.Value(0.82)).current;
  const copyOpacity = React.useRef(new Animated.Value(0)).current;
  const copyTranslate = React.useRef(new Animated.Value(12)).current;
  const haloScale = React.useRef(new Animated.Value(1)).current;
  const haloOpacity = React.useRef(new Animated.Value(0.22)).current;
  const pulseAnimationRef = React.useRef(null);

  React.useEffect(() => {
    if (!visible) {
      entranceOpacity.setValue(0);
      entranceTranslate.setValue(18);
      heroScale.setValue(0.9);
      numberScale.setValue(0.82);
      copyOpacity.setValue(0);
      copyTranslate.setValue(12);
      haloScale.setValue(1);
      haloOpacity.setValue(0.22);
      if (pulseAnimationRef.current) {
        pulseAnimationRef.current.stop();
        pulseAnimationRef.current = null;
      }
      return;
    }

    Animated.parallel([
      Animated.timing(entranceOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(entranceTranslate, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(heroScale, {
        toValue: 1,
        friction: 7,
        tension: 58,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(70),
        Animated.spring(numberScale, {
          toValue: 1.06,
          friction: 5,
          tension: 110,
          useNativeDriver: true,
        }),
        Animated.spring(numberScale, {
          toValue: 1,
          friction: 7,
          tension: 90,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(110),
        Animated.parallel([
          Animated.timing(copyOpacity, {
            toValue: 1,
            duration: 200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(copyTranslate, {
            toValue: 0,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    if (pulseAnimationRef.current) {
      pulseAnimationRef.current.stop();
      pulseAnimationRef.current = null;
    }

    if (streakDays >= 14) {
      pulseAnimationRef.current = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(haloScale, {
              toValue: 1.08,
              duration: 900,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(haloOpacity, {
              toValue: 0.34,
              duration: 900,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(haloScale, {
              toValue: 1,
              duration: 900,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(haloOpacity, {
              toValue: 0.22,
              duration: 900,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseAnimationRef.current.start();
    }

    return () => {
      if (pulseAnimationRef.current) {
        pulseAnimationRef.current.stop();
        pulseAnimationRef.current = null;
      }
    };
  }, [
    visible,
    streakDays,
    entranceOpacity,
    entranceTranslate,
    heroScale,
    numberScale,
    copyOpacity,
    copyTranslate,
    haloScale,
    haloOpacity,
  ]);

  return (
    <NeoModal
      visible={visible}
      onClose={onClose}
      style={[
        styles.modalCard,
        {
          backgroundColor: visuals.modalBackground,
          borderColor: visuals.modalBorder,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: entranceOpacity,
            transform: [{ translateY: entranceTranslate }],
          },
        ]}
      >
        <View
          style={[
            styles.backdropOrb,
            styles.backdropOrbLeft,
            { backgroundColor: visuals.accentBackground, borderColor: visuals.primary },
          ]}
        />
        <View
          style={[
            styles.backdropOrb,
            styles.backdropOrbRight,
            { backgroundColor: visuals.warmAccent, borderColor: visuals.secondary },
          ]}
        />
        <View
          style={[
            styles.ribbon,
            styles.ribbonLeft,
            { backgroundColor: visuals.primary },
          ]}
        />
        <View
          style={[
            styles.ribbon,
            styles.ribbonRight,
            { backgroundColor: visuals.secondary },
          ]}
        />
        <View
          style={[
            styles.spark,
            styles.sparkTopLeft,
            { backgroundColor: visuals.primary },
          ]}
        />
        <View
          style={[
            styles.spark,
            styles.sparkTopRight,
            { backgroundColor: visuals.secondary },
          ]}
        />
        <View
          style={[
            styles.spark,
            styles.sparkLowerLeft,
            { backgroundColor: visuals.secondary },
          ]}
        />
        <View
          style={[
            styles.spark,
            styles.sparkLowerRight,
            { backgroundColor: visuals.primary },
          ]}
        />

        <Animated.View
          style={[
            styles.hero,
            {
              transform: [{ scale: heroScale }],
            },
          ]}
        >
          <View
            style={[
              styles.heroGlow,
              {
                backgroundColor: visuals.accentBackground,
                borderColor: visuals.primary,
              },
            ]}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                styles.heroHalo,
                {
                  borderColor: visuals.primary,
                  opacity: haloOpacity,
                  transform: [{ scale: haloScale }],
                },
              ]}
            />
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: visuals.iconBackground,
                  borderColor: visuals.primary,
                },
              ]}
            >
              <AppIcon name="streak" size={36} color={visuals.primary} />
            </View>
          </View>
          <View style={styles.streakStack}>
            <Text style={[styles.eyebrow, { color: visuals.primary }]}>{copy.eyebrow}</Text>
            <Animated.Text
              style={[
                styles.streakNumber,
                {
                  color: theme.colors.text,
                  transform: [{ scale: numberScale }],
                },
              ]}
            >
              {streakDays}
            </Animated.Text>
            <Text style={[styles.streakUnit, { color: theme.colors.textSecondary }]}>day streak</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.copyCard,
            {
              backgroundColor: visuals.softAccent,
              borderColor: theme.colors.borderLight || theme.colors.border,
              opacity: copyOpacity,
              transform: [{ translateY: copyTranslate }],
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>{copy.title}</Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{copy.message}</Text>
        </Animated.View>

        <Button
          onPress={onClose}
          style={styles.cta}
          icon={<AppIcon name="success" size="inline" color="#ffffff" />}
        >
          {copy.cta}
        </Button>
      </Animated.View>
    </NeoModal>
  );
}

const styles = StyleSheet.create({
  modalCard: {
    paddingTop: designTokens.spacing.lg,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    gap: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.sm,
    paddingBottom: designTokens.spacing.sm,
    position: 'relative',
  },
  backdropOrb: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 999,
  },
  backdropOrbLeft: {
    width: 120,
    height: 120,
    top: 18,
    left: -14,
  },
  backdropOrbRight: {
    width: 88,
    height: 88,
    top: 58,
    right: -8,
  },
  ribbon: {
    position: 'absolute',
    width: 56,
    height: 6,
    borderRadius: 999,
    top: 18,
    opacity: 0.9,
  },
  ribbonLeft: {
    left: 28,
    transform: [{ rotate: '-18deg' }],
  },
  ribbonRight: {
    right: 28,
    transform: [{ rotate: '18deg' }],
  },
  spark: {
    position: 'absolute',
    borderRadius: 999,
  },
  sparkTopLeft: {
    width: 10,
    height: 10,
    top: 32,
    left: 28,
  },
  sparkTopRight: {
    width: 12,
    height: 12,
    top: 42,
    right: 36,
  },
  sparkLowerLeft: {
    width: 8,
    height: 8,
    top: 148,
    left: 52,
  },
  sparkLowerRight: {
    width: 10,
    height: 10,
    top: 166,
    right: 58,
  },
  hero: {
    alignItems: 'center',
    gap: designTokens.spacing.md,
    marginTop: designTokens.spacing.sm,
  },
  heroGlow: {
    width: 132,
    height: 132,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroHalo: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 999,
    borderWidth: 2,
  },
  iconWrap: {
    width: 92,
    height: 92,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakStack: {
    alignItems: 'center',
    gap: 2,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  streakNumber: {
    fontSize: 54,
    fontWeight: '900',
    lineHeight: 58,
  },
  streakUnit: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  copyCard: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: designTokens.borderRadius.xl,
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.lg,
    gap: designTokens.spacing.sm,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  cta: {
    alignSelf: 'stretch',
  },
});

module.exports = StreakCelebrationModal;
