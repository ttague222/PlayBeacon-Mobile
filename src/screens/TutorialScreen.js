import React, { useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { radii, shadows } from '../styles/kidTheme';
import { setTutorialCompleted } from '../utils/tutorialStorage';
import { useCollection } from '../context/CollectionContext';
import SoundManager from '../services/SoundManager';

// Lottie animations for tutorial slides
const TUTORIAL_ANIMATIONS = {
  lightbulb: require('../../assets/lottie/onboarding/Lightbulb.json'),
  giftBox: require('../../assets/lottie/onboarding/Gift box.json'),
  trophy: require('../../assets/lottie/onboarding/trophy.json'),
  rocket: require('../../assets/lottie/onboarding/rocket_launch.json'),
};

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    // TEMPORARILY DISABLED: Roblox import feature pending Roblox approval
    // title: 'Connect Your Roblox',
    // text: 'Add your Roblox username to get games you\'ll love, or jump right in!',
    title: 'Welcome to PlayBeacon!',
    emoji: '⭐',
    text: 'Discover amazing games you\'ll love - let\'s get started!',
    backgroundColor: colors.accent.primary,  // Coral pink
  },
  {
    key: '2',
    title: 'Tell Us What You Think!',
    emoji: '🎯',
    text: "Not for you? Tap ✗. Love it? Tap ❤️!",
    interactive: 'rateButtons',
    backgroundColor: colors.accent.secondary,  // Vibrant orange
  },
  {
    key: '3',
    title: 'Save Your Favorites',
    emoji: '📚',
    text: 'Tap + to save games you want to play later!',
    interactive: 'addButton',
    backgroundColor: colors.accent.tertiary,  // Purple-violet (better contrast)
  },
  {
    key: '4',
    title: 'We Get Smarter!',
    emoji: '🤖',
    animation: TUTORIAL_ANIMATIONS.lightbulb,
    text: 'The more you play, the better we get at finding games you\'ll love!',
    backgroundColor: colors.action.info,  // Magenta-pink
  },
  {
    key: '5',
    title: 'Daily Surprise!',
    emoji: '🎁',
    animation: TUTORIAL_ANIMATIONS.giftBox,
    text: 'Open your mystery box every day for a cool new game!',
    backgroundColor: colors.accent.secondary,  // Vibrant orange
  },
  {
    key: '6',
    title: 'Make a Game Plan',
    emoji: '📋',
    text: 'Add games to your to-do list and earn XP when you try them!',
    backgroundColor: colors.action.info,  // Magenta-pink
  },
  {
    key: '7',
    title: 'Collect Badges!',
    emoji: '🏆',
    animation: TUTORIAL_ANIMATIONS.trophy,
    text: 'Earn cool badges and level up as you discover games!',
    backgroundColor: colors.accent.tertiary,  // Purple-violet
  },
  {
    key: '8',
    title: 'Ready to Play?',
    emoji: '🚀',
    animation: TUTORIAL_ANIMATIONS.rocket,
    text: 'Your adventure starts now!',
    backgroundColor: colors.accent.primary,  // Coral pink
  },
];

export default function TutorialScreen({ navigation, onComplete }) {
  const sliderRef = useRef(null);
  const { triggerEvent } = useCollection();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [practiceComplete, setPracticeComplete] = useState({});

  // Animation refs for interactive elements
  const dislikeScale = useRef(new Animated.Value(1)).current;
  const likeScale = useRef(new Animated.Value(1)).current;
  const addScale = useRef(new Animated.Value(1)).current;

  // Handle slide change - play swipe sound
  const handleSlideChange = useCallback((index) => {
    setCurrentIndex(index);
    SoundManager.play('ui.swipe');
  }, []);

  const handleDone = async () => {
    // Play celebration sound for completing tutorial
    SoundManager.play('rewards.confetti');
    await setTutorialCompleted(true);
    // Trigger badge event for completing tutorial
    triggerEvent('COMPLETE_TUTORIAL');
    // Trigger AppNavigator re-render
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = async () => {
    SoundManager.play('ui.tap');
    await setTutorialCompleted(true);
    // Trigger AppNavigator re-render
    if (onComplete) {
      onComplete();
    }
  };

  // Handle practice button presses
  const handlePracticeDislike = () => {
    SoundManager.play('ui.dislike');
    Animated.sequence([
      Animated.timing(dislikeScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(dislikeScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setPracticeComplete(prev => ({ ...prev, dislike: true }));
  };

  const handlePracticeLike = () => {
    SoundManager.play('ui.like');
    Animated.sequence([
      Animated.timing(likeScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(likeScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setPracticeComplete(prev => ({ ...prev, like: true }));
  };

  const handlePracticeAdd = () => {
    SoundManager.play('ui.tap');
    Animated.sequence([
      Animated.timing(addScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(addScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setPracticeComplete(prev => ({ ...prev, add: true }));
  };

  // Render interactive practice buttons for rating slide
  const renderRateButtons = () => {
    const dislikePressed = practiceComplete.dislike;
    const likePressed = practiceComplete.like;
    const allDone = dislikePressed && likePressed;

    return (
      <View style={styles.practiceContainer}>
        <Text style={styles.practiceLabel}>
          {allDone ? 'Great job! 🎉' : 'Try it out!'}
        </Text>
        <View style={styles.practiceButtons}>
          <Animated.View style={{ transform: [{ scale: dislikeScale }] }}>
            <TouchableOpacity
              style={[
                styles.practiceButton,
                styles.dislikeButton,
                dislikePressed && styles.practiceButtonDone,
              ]}
              onPress={handlePracticeDislike}
              activeOpacity={0.8}
            >
              <Ionicons
                name="close"
                size={32}
                color={colors.text.primary}
              />
              {dislikePressed && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <TouchableOpacity
              style={[
                styles.practiceButton,
                styles.likeButton,
                likePressed && styles.practiceButtonDone,
              ]}
              onPress={handlePracticeLike}
              activeOpacity={0.8}
            >
              <Ionicons
                name="heart"
                size={28}
                color={colors.text.primary}
              />
              {likePressed && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  };

  // Render interactive add button for favorites slide
  const renderAddButton = () => {
    const addPressed = practiceComplete.add;

    return (
      <View style={styles.practiceContainer}>
        <Text style={styles.practiceLabel}>
          {addPressed ? 'Saved! 🎉' : 'Try it out!'}
        </Text>
        <Animated.View style={{ transform: [{ scale: addScale }] }}>
          <TouchableOpacity
            style={[
              styles.practiceButton,
              styles.addButton,
              addPressed && styles.practiceButtonDone,
            ]}
            onPress={handlePracticeAdd}
            activeOpacity={0.8}
          >
            <Ionicons
              name={addPressed ? 'checkmark' : 'add'}
              size={32}
              color={colors.text.primary}
            />
            {addPressed && <Text style={styles.checkMark}>✓</Text>}
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderSlide = ({ item, index }) => {
    const isLastSlide = item.key === '8';
    const slideIndex = parseInt(item.key) - 1;

    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {item.key} of {slides.length}
          </Text>
        </View>

        <View style={styles.contentContainer}>
          {item.animation ? (
            <View style={styles.animationContainer}>
              <LottieView
                source={item.animation}
                autoPlay
                loop
                style={styles.animation}
              />
            </View>
          ) : (
            <Text style={styles.emoji}>{item.emoji}</Text>
          )}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.text}>{item.text}</Text>

          {/* Interactive practice elements */}
          {item.interactive === 'rateButtons' && renderRateButtons()}
          {item.interactive === 'addButton' && renderAddButton()}

          {isLastSlide && (
            <TouchableOpacity
              style={styles.inlineButton}
              onPress={handleDone}
              activeOpacity={0.8}
            >
              <Text style={styles.inlineButtonText}>Start Exploring</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderNextButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Ionicons name="arrow-forward" color="white" size={28} />
      </View>
    );
  };

  const renderDoneButton = () => {
    // Hide the default done button since we're using inline button
    return null;
  };

  const renderSkipButton = () => {
    return (
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppIntroSlider
        ref={sliderRef}
        data={slides}
        renderItem={renderSlide}
        onDone={handleDone}
        onSlideChange={handleSlideChange}
        renderNextButton={renderNextButton}
        renderDoneButton={renderDoneButton}
        showSkipButton={true}
        renderSkipButton={renderSkipButton}
        activeDotStyle={styles.activeDot}
        dotStyle={styles.dot}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  progressContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  progressText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 340,
  },
  emoji: {
    fontSize: 100,
    marginBottom: 30,
    textAlign: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  text: {
    fontSize: 20,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: '500',
  },
  inlineButton: {
    backgroundColor: colors.text.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: radii.pill,
    marginTop: 40,
    ...shadows.large,
    alignSelf: 'center',
  },
  inlineButtonText: {
    color: colors.background.primary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonCircle: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: radii.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  doneButtonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  doneButton: {
    backgroundColor: colors.text.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: radii.pill,
    ...shadows.large,
  },
  doneButtonText: {
    color: colors.background.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 20,
  },
  skipButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  activeDot: {
    backgroundColor: colors.text.primary,
    width: 10,
    height: 10,
    borderRadius: radii.circle,
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: 8,
    height: 8,
    borderRadius: radii.circle,
  },
  // Practice button styles
  practiceContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  practiceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  practiceButtons: {
    flexDirection: 'row',
    gap: 40,
    alignItems: 'center',
  },
  practiceButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dislikeButton: {
    backgroundColor: colors.action.dislike,
  },
  likeButton: {
    backgroundColor: colors.action.like,
  },
  addButton: {
    backgroundColor: colors.action.info,
  },
  practiceButtonDone: {
    opacity: 0.7,
  },
  checkMark: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: colors.success,
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    overflow: 'hidden',
  },
});
