import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { setTutorialCompleted } from '../utils/tutorialStorage';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Welcome to PlayBeacon!',
    emoji: '🎮✨',
    text: 'Discover fun new Roblox games picked just for you!',
    backgroundColor: colors.accent.tertiary,  // Purple-violet
  },
  {
    key: '2',
    title: 'Import Your Games',
    emoji: '⭐',
    text: 'Just type your Roblox username to get started.',
    backgroundColor: colors.accent.primary,  // Coral pink
  },
  {
    key: '3',
    title: 'Swipe to Explore',
    emoji: '🔍',
    text: 'Scroll to find awesome new games you might love!',
    backgroundColor: colors.accent.secondary,  // Vibrant orange
  },
  {
    key: '4',
    title: 'Save Games to Collections',
    emoji: '✨',
    text: 'Tap the star to save games you like!',
    backgroundColor: colors.action.like,  // Golden orange
  },
  {
    key: '5',
    title: 'Smart AI Picks',
    emoji: '🤖',
    text: 'PlayBeacon learns what you like and finds better games over time!',
    backgroundColor: colors.action.info,  // Magenta-pink
  },
  {
    key: '6',
    title: 'Earn Badges & Level Up',
    emoji: '🏆',
    text: 'Unlock achievements as you explore!',
    backgroundColor: colors.accent.tertiary,  // Purple-violet
  },
  {
    key: '7',
    title: 'Let\'s Go!',
    emoji: '🚀',
    text: 'You\'re all set to start your adventure!',
    backgroundColor: colors.accent.primary,  // Coral pink
  },
];

export default function TutorialScreen({ navigation, onComplete }) {
  const sliderRef = useRef(null);

  const handleDone = async () => {
    await setTutorialCompleted(true);
    // Trigger AppNavigator re-render
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = async () => {
    await setTutorialCompleted(true);
    // Trigger AppNavigator re-render
    if (onComplete) {
      onComplete();
    }
  };

  const renderSlide = ({ item }) => {
    const isLastSlide = item.key === '7';
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <View style={styles.contentContainer}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.text}>{item.text}</Text>
          {isLastSlide && (
            <TouchableOpacity style={styles.inlineButton} onPress={handleDone}>
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
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
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
    borderRadius: 30,
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
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
    borderRadius: 25,
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
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
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
    borderRadius: 5,
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
