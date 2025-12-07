import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_COMPLETED_KEY = '@playbeacon_tutorial_completed';

export const getTutorialCompleted = async () => {
  try {
    const value = await AsyncStorage.getItem(TUTORIAL_COMPLETED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error reading tutorial completion status:', error);
    return false;
  }
};

export const setTutorialCompleted = async (completed) => {
  try {
    await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, completed ? 'true' : 'false');
    return true;
  } catch (error) {
    console.error('Error setting tutorial completion status:', error);
    return false;
  }
};

export const resetTutorial = async () => {
  try {
    await AsyncStorage.removeItem(TUTORIAL_COMPLETED_KEY);
    return true;
  } catch (error) {
    console.error('Error resetting tutorial:', error);
    return false;
  }
};
