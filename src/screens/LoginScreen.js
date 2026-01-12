import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import { radii, shadows } from '../styles/kidTheme';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  // TEMPORARILY DISABLED: Google Sign-In pending Apple developer account migration
  // const { login, register, loginWithGoogle } = useAuth();

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    }
  };

  // TEMPORARILY DISABLED: Google Sign-In pending Apple developer account migration
  // Need to implement Sign in with Apple before re-enabling Google Sign-In (Apple Guideline 4.8)
  // const handleGoogleSignIn = async () => {
  //   try {
  //     await loginWithGoogle();
  //   } catch (error) {
  //     Alert.alert(t('common.error'), t('login.errorGoogle'));
  //   }
  // };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isLogin ? t('login.titleSignIn') : t('login.titleSignUp')}
      </Text>

      <TextInput
        style={styles.input}
        placeholder={t('login.emailPlaceholder')}
        placeholderTextColor={colors.text.placeholder}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder={t('login.passwordPlaceholder')}
        placeholderTextColor={colors.text.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>
          {isLogin ? t('login.buttonSignIn') : t('login.buttonSignUp')}
        </Text>
      </TouchableOpacity>

      {/* TEMPORARILY DISABLED: Google Sign-In pending Apple developer account migration */}
      {/* Need to implement Sign in with Apple before re-enabling (Apple Guideline 4.8) */}
      {/* <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{t('login.dividerText')}</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
        <Text style={styles.googleButtonText}>{t('login.googleButton')}</Text>
      </TouchableOpacity> */}

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchText}>
          {isLogin ? t('login.toggleSignUp') : t('login.toggleSignIn')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radii.s,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.accent.primary,
    paddingVertical: 16,
    borderRadius: radii.s,
    alignItems: 'center',
    marginTop: 8,
    ...shadows.medium,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  switchText: {
    color: colors.accent.secondary,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    color: colors.text.tertiary,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: colors.background.secondary,
    paddingVertical: 16,
    borderRadius: radii.s,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.accent.tertiary,
    ...shadows.medium,
  },
  googleButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
