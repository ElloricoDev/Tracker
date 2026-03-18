const React = require('react');
const { Ionicons } = require('@expo/vector-icons');
const { useTheme } = require('../../hooks/useTheme');
const { iconNames, iconSizes } = require('../../theme/icons');

function AppIcon({
  name,
  size = 'section',
  color,
}) {
  const { theme } = useTheme();
  const resolvedName = iconNames[name] || name;
  const resolvedSize = typeof size === 'number' ? size : (iconSizes[size] || iconSizes.section);
  const resolvedColor = color || theme.colors.icon;

  return (
    <Ionicons
      name={resolvedName}
      size={resolvedSize}
      color={resolvedColor}
    />
  );
}

module.exports = AppIcon;
