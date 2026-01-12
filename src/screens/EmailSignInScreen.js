/**
 * PlayBeacon Email Sign In Screen
 *
 * Allows users to sign in or sign up with email and password.
 * Includes password reset functionality.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const EmailSignInScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { signInWithEmail, signUpWithEmail, resetPassword, loading } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError(t('emailSignIn.errorEmailPassword'));
      return;
    }
    if (!validateEmail(email)) {
      setError(t('emailSignIn.errorInvalidEmail'));
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await signInWithEmail(email, password);
      // Navigate back to main app, closing all modals
      navigation.navigate('Main');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError(t('emailSignIn.errorNoAccount'));
      } else if (err.code === 'auth/wrong-password') {
        setError(t('emailSignIn.errorWrongPassword'));
      } else if (err.code === 'auth/invalid-credential') {
        setError(t('emailSignIn.errorInvalidCredential'));
      } else {
        setError(t('emailSignIn.errorSignInFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError(t('emailSignIn.errorFillAllFields'));
      return;
    }
    if (!validateEmail(email)) {
      setError(t('emailSignIn.errorInvalidEmail'));
      return;
    }
    if (password.length < 6) {
      setError(t('emailSignIn.errorPasswordLength'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('emailSignIn.errorPasswordMismatch'));
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await signUpWithEmail(email, password);
      // Navigate back to main app, closing all modals
      navigation.navigate('Main');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError(t('emailSignIn.errorEmailInUse'));
      } else if (err.code === 'auth/weak-password') {
        setError(t('emailSignIn.errorWeakPassword'));
      } else {
        setError(t('emailSignIn.errorSignUpFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError(t('emailSignIn.errorEnterEmail'));
      return;
    }
    if (!validateEmail(email)) {
      setError(t('emailSignIn.errorInvalidEmail'));
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await resetPassword(email);
      Alert.alert(
        t('emailSignIn.checkEmailTitle'),
        t('emailSignIn.checkEmailMessage'),
        [{ text: t('common.ok'), onPress: () => setMode('signin') }]
      );
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError(t('emailSignIn.errorNoAccount'));
      } else {
        setError(t('emailSignIn.errorResetFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup':
        return t('emailSignIn.titleCreateAccount');
      case 'reset':
        return t('emailSignIn.titleResetPassword');
      default:
        return t('emailSignIn.titleSignIn');
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup':
        return t('emailSignIn.subtitleCreateAccount');
      case 'reset':
        return t('emailSignIn.subtitleResetPassword');
      default:
        return t('emailSignIn.subtitleSignIn');
    }
  };

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#ffffff" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>Play<Text style={styles.logoAccent}>Beacon</Text></Text>
              <Text style={styles.title}>{getTitle()}</Text>
              <Text style={styles.subtitle}>{getSubtitle()}</Text>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning-outline" size={18} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#a0a0a0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('emailSignIn.emailPlaceholder')}
                  placeholderTextColor="#606080"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input (not shown in reset mode) */}
              {mode !== 'reset' && (
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#a0a0a0" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('emailSignIn.passwordPlaceholder')}
                    placeholderTextColor="#606080"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#a0a0a0"
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Confirm Password (only in signup mode) */}
              {mode === 'signup' && (
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#a0a0a0" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('emailSignIn.confirmPasswordPlaceholder')}
                    placeholderTextColor="#606080"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
              )}

              {/* Forgot Password Link (only in signin mode) */}
              {mode === 'signin' && (
                <TouchableOpacity onPress={() => { setMode('reset'); setError(null); }}>
                  <Text style={styles.forgotPassword}>{t('emailSignIn.forgotPassword')}</Text>
                </TouchableOpacity>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={
                  mode === 'signin' ? handleSignIn :
                  mode === 'signup' ? handleSignUp :
                  handleResetPassword
                }
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {mode === 'signin' ? t('emailSignIn.buttonSignIn') :
                     mode === 'signup' ? t('emailSignIn.buttonCreateAccount') :
                     t('emailSignIn.buttonSendResetLink')}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Mode Toggle */}
              <View style={styles.toggleContainer}>
                {mode === 'signin' && (
                  <>
                    <Text style={styles.toggleText}>{t('emailSignIn.noAccount')} </Text>
                    <TouchableOpacity onPress={() => { setMode('signup'); setError(null); }}>
                      <Text style={styles.toggleLink}>{t('emailSignIn.signUpLink')}</Text>
                    </TouchableOpacity>
                  </>
                )}
                {mode === 'signup' && (
                  <>
                    <Text style={styles.toggleText}>{t('emailSignIn.hasAccount')} </Text>
                    <TouchableOpacity onPress={() => { setMode('signin'); setError(null); }}>
                      <Text style={styles.toggleLink}>{t('emailSignIn.signInLink')}</Text>
                    </TouchableOpacity>
                  </>
                )}
                {mode === 'reset' && (
                  <>
                    <Text style={styles.toggleText}>{t('emailSignIn.rememberPassword')} </Text>
                    <TouchableOpacity onPress={() => { setMode('signin'); setError(null); }}>
                      <Text style={styles.toggleLink}>{t('emailSignIn.signInLink')}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 100 : 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 20,
    letterSpacing: -1,
  },
  logoAccent: {
    color: '#4ade80',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  eyeButton: {
    padding: 16,
  },
  forgotPassword: {
    color: '#4ade80',
    fontSize: 14,
    textAlign: 'right',
    marginTop: -8,
  },
  submitButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  toggleText: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  toggleLink: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EmailSignInScreen;
