/**
 * Kid Theme Tests
 *
 * Tests for the kid-friendly theme system ensuring proper
 * structure, values, and accessibility compliance.
 */

import {
  radii,
  spacing,
  typography,
  kidColors,
  shadows,
  touchTargets,
  animations,
  componentSizes,
  zIndex,
  responsive,
  kidTheme,
} from '../../styles/kidTheme';

describe('Kid Theme', () => {
  describe('radii', () => {
    it('should define all radius values', () => {
      expect(radii.xs).toBe(8);
      expect(radii.s).toBe(12);
      expect(radii.m).toBe(16);
      expect(radii.l).toBe(20);
      expect(radii.xl).toBe(28);
      expect(radii.xxl).toBe(40);
      expect(radii.pill).toBe(999);
      expect(radii.circle).toBe(9999);
    });

    it('should have increasing radius values', () => {
      expect(radii.xs).toBeLessThan(radii.s);
      expect(radii.s).toBeLessThan(radii.m);
      expect(radii.m).toBeLessThan(radii.l);
      expect(radii.l).toBeLessThan(radii.xl);
      expect(radii.xl).toBeLessThan(radii.xxl);
    });
  });

  describe('spacing', () => {
    it('should define all spacing values', () => {
      expect(spacing.xxs).toBe(4);
      expect(spacing.xs).toBe(8);
      expect(spacing.s).toBe(12);
      expect(spacing.m).toBe(16);
      expect(spacing.l).toBe(20);
      expect(spacing.xl).toBe(24);
      expect(spacing.xxl).toBe(32);
      expect(spacing.xxxl).toBe(40);
    });

    it('should have increasing spacing values', () => {
      expect(spacing.xxs).toBeLessThan(spacing.xs);
      expect(spacing.xs).toBeLessThan(spacing.s);
      expect(spacing.s).toBeLessThan(spacing.m);
      expect(spacing.m).toBeLessThan(spacing.l);
      expect(spacing.l).toBeLessThan(spacing.xl);
      expect(spacing.xl).toBeLessThan(spacing.xxl);
      expect(spacing.xxl).toBeLessThan(spacing.xxxl);
    });

    it('should define responsive spacing values', () => {
      expect(spacing.edgePadding).toBeDefined();
      expect(spacing.elementGap).toBeDefined();
      expect(spacing.cardPadding).toBeDefined();
    });

    it('should have minimum spacing for kid-friendly UI', () => {
      // Minimum gap should be at least 16px for kids
      expect(spacing.elementGap).toBeGreaterThanOrEqual(16);
    });
  });

  describe('typography', () => {
    it('should define font families', () => {
      expect(typography.fontFamily.regular).toBe('System');
      expect(typography.fontFamily.medium).toBe('System');
      expect(typography.fontFamily.bold).toBe('System');
    });

    it('should define all font sizes', () => {
      expect(typography.fontSize.tiny).toBeDefined();
      expect(typography.fontSize.small).toBeDefined();
      expect(typography.fontSize.caption).toBeDefined();
      expect(typography.fontSize.body).toBeDefined();
      expect(typography.fontSize.bodyLarge).toBeDefined();
      expect(typography.fontSize.button).toBeDefined();
      expect(typography.fontSize.subtitle).toBeDefined();
      expect(typography.fontSize.title).toBeDefined();
      expect(typography.fontSize.header).toBeDefined();
      expect(typography.fontSize.hero).toBeDefined();
    });

    it('should have sizes alias for TypeScript compatibility', () => {
      expect(typography.sizes).toEqual(typography.fontSize);
    });

    it('should define line heights', () => {
      expect(typography.lineHeight.tight).toBe(1.2);
      expect(typography.lineHeight.normal).toBe(1.4);
      expect(typography.lineHeight.relaxed).toBe(1.6);
    });

    it('should define font weights', () => {
      expect(typography.fontWeight.regular).toBe('400');
      expect(typography.fontWeight.medium).toBe('500');
      expect(typography.fontWeight.semibold).toBe('600');
      expect(typography.fontWeight.bold).toBe('700');
      expect(typography.fontWeight.extrabold).toBe('800');
    });

    it('should have kid-friendly minimum body font size (16px)', () => {
      expect(typography.fontSize.body).toBeGreaterThanOrEqual(16);
    });
  });

  describe('kidColors', () => {
    it('should define primary colors', () => {
      expect(kidColors.primary.blue).toBe('#4DABF7');
      expect(kidColors.primary.purple).toBe('#9775FA');
      expect(kidColors.primary.pink).toBe('#F783AC');
      expect(kidColors.primary.red).toBe('#E64545');
    });

    it('should define secondary colors', () => {
      expect(kidColors.secondary.yellow).toBe('#FFD43B');
      expect(kidColors.secondary.orange).toBe('#FF922B');
      expect(kidColors.secondary.mint).toBe('#63E6BE');
      expect(kidColors.secondary.teal).toBe('#38D9A9');
    });

    it('should define background colors', () => {
      expect(kidColors.background.light).toBe('#F8F6FF');
      expect(kidColors.background.card).toBe('#FFFFFF');
      expect(kidColors.background.elevated).toBe('#F1EEFF');
      expect(kidColors.background.warm).toBe('#FFF8F0');
      expect(kidColors.background.cool).toBe('#F0F8FF');
    });

    it('should define dark mode backgrounds', () => {
      expect(kidColors.backgroundDark.primary).toBe('#1A1625');
      expect(kidColors.backgroundDark.secondary).toBe('#2E2440');
      expect(kidColors.backgroundDark.tertiary).toBe('#3A2F4D');
      expect(kidColors.backgroundDark.card).toBe('#362B4A');
    });

    it('should define text colors', () => {
      expect(kidColors.text.primary).toBe('#2D2A3E');
      expect(kidColors.text.secondary).toBe('#6B6580');
      expect(kidColors.text.tertiary).toBe('#9B95AD');
      expect(kidColors.text.light).toBe('#FFFFFF');
      expect(kidColors.text.lightSecondary).toBe('#F3D2C1');
    });

    it('should define action colors', () => {
      expect(kidColors.action.like).toBe('#FF6B6B');
      expect(kidColors.action.favorite).toBe('#FFD43B');
      expect(kidColors.action.add).toBe('#63E6BE');
      expect(kidColors.action.play).toBe('#4DABF7');
      expect(kidColors.action.info).toBe('#9775FA');
    });

    it('should define feedback colors', () => {
      expect(kidColors.feedback.success).toBe('#51CF66');
      expect(kidColors.feedback.warning).toBe('#FFD43B');
      expect(kidColors.feedback.error).toBe('#FF6B6B');
      expect(kidColors.feedback.info).toBe('#4DABF7');
    });

    it('should define bear palette colors', () => {
      expect(kidColors.bear.brown).toBe('#8B6914');
      expect(kidColors.bear.darkBrown).toBe('#5D4E37');
      expect(kidColors.bear.cream).toBe('#F5E6D3');
      expect(kidColors.bear.bandana).toBe('#E64545');
      expect(kidColors.bear.nose).toBe('#2D2A3E');
    });

    it('should define gradient arrays', () => {
      expect(kidColors.gradients.primary).toEqual(['#4DABF7', '#9775FA']);
      expect(kidColors.gradients.secondary).toEqual(['#FF922B', '#F783AC']);
      expect(kidColors.gradients.success).toEqual(['#51CF66', '#63E6BE']);
      expect(kidColors.gradients.warm).toEqual(['#FFD43B', '#FF922B']);
      expect(kidColors.gradients.cool).toEqual(['#38D9A9', '#4DABF7']);
      expect(kidColors.gradients.bear).toEqual(['#E64545', '#F783AC']);
    });

    it('should have valid hex color format', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(kidColors.primary.blue).toMatch(hexRegex);
      expect(kidColors.text.primary).toMatch(hexRegex);
      expect(kidColors.feedback.success).toMatch(hexRegex);
    });
  });

  describe('shadows', () => {
    it('should define none shadow', () => {
      expect(shadows.none.shadowOpacity).toBe(0);
      expect(shadows.none.elevation).toBe(0);
    });

    it('should define shadow levels with increasing intensity', () => {
      expect(shadows.small.elevation).toBeLessThan(shadows.medium.elevation);
      expect(shadows.medium.elevation).toBeLessThan(shadows.large.elevation);
      expect(shadows.large.elevation).toBeLessThan(shadows.xlarge.elevation);
    });

    it('should have required shadow properties', () => {
      const shadowKeys = ['shadowColor', 'shadowOffset', 'shadowOpacity', 'shadowRadius', 'elevation'];

      shadowKeys.forEach(key => {
        expect(shadows.small).toHaveProperty(key);
        expect(shadows.medium).toHaveProperty(key);
        expect(shadows.large).toHaveProperty(key);
        expect(shadows.xlarge).toHaveProperty(key);
      });
    });

    it('should provide colored shadow functions', () => {
      const coloredSmall = shadows.coloredSmall('#FF0000');
      expect(coloredSmall.shadowColor).toBe('#FF0000');
      expect(coloredSmall.shadowOpacity).toBe(0.25);
      expect(coloredSmall.elevation).toBe(3);

      const coloredMedium = shadows.coloredMedium('#00FF00');
      expect(coloredMedium.shadowColor).toBe('#00FF00');
      expect(coloredMedium.shadowOpacity).toBe(0.35);
      expect(coloredMedium.elevation).toBe(5);
    });
  });

  describe('touchTargets', () => {
    it('should meet kid accessibility minimum (48dp)', () => {
      expect(touchTargets.minimum).toBeGreaterThanOrEqual(48);
      expect(touchTargets.standard).toBeGreaterThanOrEqual(48);
      expect(touchTargets.large).toBeGreaterThanOrEqual(48);
      expect(touchTargets.xlarge).toBeGreaterThanOrEqual(48);
    });

    it('should have increasing touch target sizes', () => {
      expect(touchTargets.minimum).toBeLessThanOrEqual(touchTargets.standard);
      expect(touchTargets.standard).toBeLessThanOrEqual(touchTargets.large);
      expect(touchTargets.large).toBeLessThanOrEqual(touchTargets.xlarge);
    });

    it('should define icon button sizes', () => {
      expect(touchTargets.iconSmall).toBeDefined();
      expect(touchTargets.iconMedium).toBeDefined();
      expect(touchTargets.iconLarge).toBeDefined();
    });

    it('should have icon medium meet accessibility minimum', () => {
      expect(touchTargets.iconMedium).toBeGreaterThanOrEqual(48);
    });
  });

  describe('animations', () => {
    it('should define animation durations', () => {
      expect(animations.duration.instant).toBe(100);
      expect(animations.duration.fast).toBe(150);
      expect(animations.duration.normal).toBe(250);
      expect(animations.duration.slow).toBe(400);
      expect(animations.duration.verySlow).toBe(600);
    });

    it('should have increasing duration values', () => {
      expect(animations.duration.instant).toBeLessThan(animations.duration.fast);
      expect(animations.duration.fast).toBeLessThan(animations.duration.normal);
      expect(animations.duration.normal).toBeLessThan(animations.duration.slow);
      expect(animations.duration.slow).toBeLessThan(animations.duration.verySlow);
    });

    it('should define spring configurations', () => {
      expect(animations.spring.bouncy).toHaveProperty('tension');
      expect(animations.spring.bouncy).toHaveProperty('friction');
      expect(animations.spring.gentle).toHaveProperty('tension');
      expect(animations.spring.gentle).toHaveProperty('friction');
      expect(animations.spring.stiff).toHaveProperty('tension');
      expect(animations.spring.stiff).toHaveProperty('friction');
    });

    it('should define button press animation', () => {
      expect(animations.buttonPress.scale).toBe(0.94);
      expect(animations.buttonPress.duration).toBe(120);
    });

    it('should define card press animation', () => {
      expect(animations.cardPress.scale).toBe(1.04);
      expect(animations.cardPress.duration).toBe(200);
    });
  });

  describe('componentSizes', () => {
    it('should define button sizes', () => {
      expect(componentSizes.button.small).toBe(44);
      expect(componentSizes.button.medium).toBe(52);
      expect(componentSizes.button.large).toBe(56);
      expect(componentSizes.button.xlarge).toBe(64);
    });

    it('should define card dimensions', () => {
      expect(componentSizes.card.smallWidth).toBeDefined();
      expect(componentSizes.card.mediumWidth).toBeDefined();
      expect(componentSizes.card.largeWidth).toBeDefined();
      expect(componentSizes.card.padding).toBe(spacing.cardPadding);
      expect(componentSizes.card.borderRadius).toBe(radii.xxl);
    });

    it('should define avatar sizes', () => {
      expect(componentSizes.avatar.small).toBe(32);
      expect(componentSizes.avatar.medium).toBe(48);
      expect(componentSizes.avatar.large).toBe(64);
      expect(componentSizes.avatar.xlarge).toBe(96);
    });

    it('should define icon sizes', () => {
      expect(componentSizes.icon.tiny).toBe(16);
      expect(componentSizes.icon.small).toBe(20);
      expect(componentSizes.icon.medium).toBe(24);
      expect(componentSizes.icon.large).toBe(32);
      expect(componentSizes.icon.xlarge).toBe(40);
    });

    it('should define bear mascot sizes', () => {
      expect(componentSizes.bear.tiny).toBe(60);
      expect(componentSizes.bear.small).toBe(100);
      expect(componentSizes.bear.medium).toBe(140);
      expect(componentSizes.bear.large).toBe(180);
      expect(componentSizes.bear.xlarge).toBe(240);
    });

    it('should define navbar dimensions', () => {
      expect(componentSizes.navbar.height).toBeDefined();
      expect(componentSizes.navbar.iconSize).toBeDefined();
      expect(componentSizes.navbar.labelSize).toBeDefined();
    });
  });

  describe('zIndex', () => {
    it('should define all z-index layers', () => {
      expect(zIndex.base).toBe(0);
      expect(zIndex.card).toBe(1);
      expect(zIndex.dropdown).toBe(10);
      expect(zIndex.sticky).toBe(20);
      expect(zIndex.navbar).toBe(30);
      expect(zIndex.modal).toBe(40);
      expect(zIndex.toast).toBe(50);
      expect(zIndex.tooltip).toBe(60);
      expect(zIndex.bear).toBe(100);
    });

    it('should have increasing z-index values', () => {
      expect(zIndex.base).toBeLessThan(zIndex.card);
      expect(zIndex.card).toBeLessThan(zIndex.dropdown);
      expect(zIndex.dropdown).toBeLessThan(zIndex.sticky);
      expect(zIndex.sticky).toBeLessThan(zIndex.navbar);
      expect(zIndex.navbar).toBeLessThan(zIndex.modal);
      expect(zIndex.modal).toBeLessThan(zIndex.toast);
      expect(zIndex.toast).toBeLessThan(zIndex.tooltip);
      expect(zIndex.tooltip).toBeLessThan(zIndex.bear);
    });

    it('should have bear at highest z-index', () => {
      const maxZIndex = Math.max(...Object.values(zIndex));
      expect(zIndex.bear).toBe(maxZIndex);
    });
  });

  describe('responsive', () => {
    it('should define screen dimensions', () => {
      expect(responsive.screenWidth).toBeDefined();
      expect(responsive.screenHeight).toBeDefined();
      expect(typeof responsive.screenWidth).toBe('number');
      expect(typeof responsive.screenHeight).toBe('number');
    });

    it('should define isTablet boolean', () => {
      expect(typeof responsive.isTablet).toBe('boolean');
    });

    it('should provide responsive value helper function', () => {
      const result = responsive.value(10, 20);
      expect(result).toBe(responsive.isTablet ? 20 : 10);
    });

    it('should define grid columns based on device', () => {
      expect(responsive.columns).toBe(responsive.isTablet ? 3 : 2);
    });
  });

  describe('kidTheme (unified export)', () => {
    it('should export all theme sections', () => {
      expect(kidTheme.radii).toBe(radii);
      expect(kidTheme.spacing).toBe(spacing);
      expect(kidTheme.typography).toBe(typography);
      expect(kidTheme.colors).toBe(kidColors);
      expect(kidTheme.shadows).toBe(shadows);
      expect(kidTheme.touchTargets).toBe(touchTargets);
      expect(kidTheme.animations).toBe(animations);
      expect(kidTheme.componentSizes).toBe(componentSizes);
      expect(kidTheme.zIndex).toBe(zIndex);
      expect(kidTheme.responsive).toBe(responsive);
    });

    it('should be a complete theme object', () => {
      const expectedKeys = [
        'radii',
        'spacing',
        'typography',
        'colors',
        'shadows',
        'touchTargets',
        'animations',
        'componentSizes',
        'zIndex',
        'responsive',
      ];

      expectedKeys.forEach(key => {
        expect(kidTheme).toHaveProperty(key);
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have minimum touch target size of 48dp', () => {
      expect(touchTargets.minimum).toBeGreaterThanOrEqual(48);
    });

    it('should have kid-friendly body text size (16px+)', () => {
      expect(typography.fontSize.body).toBeGreaterThanOrEqual(16);
    });

    it('should have button height meeting touch target requirements', () => {
      expect(componentSizes.button.small).toBeGreaterThanOrEqual(44);
      expect(componentSizes.button.medium).toBeGreaterThanOrEqual(48);
    });

    it('should have adequate spacing between elements', () => {
      expect(spacing.elementGap).toBeGreaterThanOrEqual(16);
    });
  });
});
