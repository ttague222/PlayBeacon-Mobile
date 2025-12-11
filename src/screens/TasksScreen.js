import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Animated,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import SoundManager from '../services/SoundManager';
import SkeletonLoader from '../components/SkeletonLoader';
import ProfileButton from '../components/ProfileButton';
import { PlayBeaconBannerAd } from '../components/ads';
import { useCollection } from '../context/CollectionContext';
import { colors } from '../styles/colors';
import logger from '../utils/logger';
import { typography, radii, shadows } from '../styles/kidTheme';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
];

const PRIORITY_LABELS = ['Low', 'Medium', 'High'];
const PRIORITY_COLORS = [colors.text.tertiary, colors.warning, colors.error];

export default function TasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState('one_time');
  const [newTaskPriority, setNewTaskPriority] = useState(0);
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // XP popup state
  const [xpPopup, setXpPopup] = useState({ visible: false, xp: 0 });
  const xpOpacity = useState(new Animated.Value(0))[0];

  // Badge collection hook for task completion tracking
  const { triggerEvent } = useCollection();

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const filters = {};
      if (activeTab !== 'all') {
        filters.taskType = activeTab;
      }
      const data = await api.getTasks(filters);
      setTasks(data.tasks || []);
    } catch (error) {
      logger.error('Failed to fetch tasks:', error);
      setError('Failed to load tasks. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [fetchTasks]);

  const showXpPopup = (xp) => {
    setXpPopup({ visible: true, xp });
    Animated.sequence([
      Animated.timing(xpOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(xpOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setXpPopup({ visible: false, xp: 0 });
    });
  };

  const handleCreateTask = async () => {
    SoundManager.play('ui.tap');
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      setCreating(true);
      await api.createTask({
        title: newTaskTitle.trim(),
        taskType: newTaskType,
        priority: newTaskPriority,
        notes: newTaskNotes.trim() || null,
      });

      setNewTaskTitle('');
      setNewTaskType('one_time');
      setNewTaskPriority(0);
      setNewTaskNotes('');
      setCreateModalVisible(false);
      await fetchTasks();
    } catch (error) {
      logger.error('Failed to create task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleComplete = async (task) => {
    SoundManager.play('ui.tap');
    // Optimistically update UI first
    const wasCompleted = task.completed;
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.taskId === task.taskId
          ? { ...t, completed: !wasCompleted, completedAt: !wasCompleted ? new Date().toISOString() : null }
          : t
      )
    );

    try {
      if (wasCompleted) {
        await api.uncompleteTask(task.taskId);
      } else {
        const result = await api.completeTask(task.taskId);

        // Track task completion for badges
        triggerEvent('COMPLETE_TASK');

        // Show XP popup
        if (result.xp_gained > 0) {
          showXpPopup(result.xp_gained);
        }

        // Show achievement notifications
        if (result.new_achievements && result.new_achievements.length > 0) {
          result.new_achievements.forEach(achievement => {
            setTimeout(() => {
              Alert.alert(
                'Achievement Unlocked!',
                `${achievement.title}: ${achievement.description}\n+${achievement.xp_reward} XP`
              );
            }, 2000);
          });
        }
      }
    } catch (error) {
      logger.error('Failed to toggle task completion:', error);

      // Check if it's a sync issue (task already in desired state)
      const errorDetail = error.response?.data?.detail || '';
      if (errorDetail.includes('already completed') || errorDetail.includes('not completed')) {
        // Task state was out of sync, refresh to get current state
        fetchTasks();
      } else {
        // Revert optimistic update on other errors
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.taskId === task.taskId
              ? { ...t, completed: wasCompleted, completedAt: wasCompleted ? task.completedAt : null }
              : t
          )
        );
        Alert.alert('Error', 'Failed to update task. Please try again.');
      }
    }
  };

  const handleDeleteTask = (task) => {
    SoundManager.play('ui.tap');
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteTask(task.taskId);
              setTasks(prevTasks => prevTasks.filter(t => t.taskId !== task.taskId));
            } catch (error) {
              logger.error('Failed to delete task:', error);
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderTaskItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.taskItem,
        item.completed && styles.taskItemCompleted,
      ]}
      onLongPress={() => handleDeleteTask(item)}
      onPress={() => handleToggleComplete(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          item.completed && styles.checkboxChecked,
        ]}
      >
        {item.completed && (
          <Ionicons name="checkmark" size={18} color={colors.text.primary} />
        )}
      </View>

      <View style={styles.taskContent}>
        <Text
          style={[
            styles.taskTitle,
            item.completed && styles.taskTitleCompleted,
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <View style={styles.taskMeta}>
          {item.taskType !== 'one_time' && (
            <View style={[styles.taskBadge, styles.typeBadge]}>
              <Text style={styles.taskBadgeText}>
                {item.taskType === 'daily' ? 'Daily' : 'Weekly'}
              </Text>
            </View>
          )}

          {item.priority > 0 && (
            <View style={[styles.taskBadge, { backgroundColor: PRIORITY_COLORS[item.priority] + '30' }]}>
              <Text style={[styles.taskBadgeText, { color: PRIORITY_COLORS[item.priority] }]}>
                {PRIORITY_LABELS[item.priority]}
              </Text>
            </View>
          )}

          {item.gameName && (
            <View style={[styles.taskBadge, styles.gameBadge]}>
              <Ionicons name="game-controller" size={12} color={colors.accent.tertiary} />
              <Text style={[styles.taskBadgeText, { color: colors.accent.tertiary, marginLeft: 4 }]} numberOfLines={1}>
                {item.gameName}
              </Text>
            </View>
          )}
        </View>

        {item.notes && (
          <Text style={styles.taskNotes} numberOfLines={1}>
            {item.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  ), [handleDeleteTask, handleToggleComplete]);

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            activeTab === tab.key && styles.tabActive,
          ]}
          onPress={() => {
            SoundManager.play('ui.tab_change');
            setActiveTab(tab.key);
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTaskTypeSelector = () => (
    <View style={styles.typeSelector}>
      {[
        { key: 'one_time', label: 'One-time' },
        { key: 'daily', label: 'Daily' },
        { key: 'weekly', label: 'Weekly' },
      ].map(type => (
        <TouchableOpacity
          key={type.key}
          style={[
            styles.typeOption,
            newTaskType === type.key && styles.typeOptionActive,
          ]}
          onPress={() => {
            SoundManager.play('ui.tap');
            setNewTaskType(type.key);
          }}
        >
          <Text
            style={[
              styles.typeOptionText,
              newTaskType === type.key && styles.typeOptionTextActive,
            ]}
          >
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPrioritySelector = () => (
    <View style={styles.prioritySelector}>
      {[0, 1, 2].map(priority => (
        <TouchableOpacity
          key={priority}
          style={[
            styles.priorityOption,
            newTaskPriority === priority && {
              backgroundColor: PRIORITY_COLORS[priority] + '20',
              borderColor: PRIORITY_COLORS[priority],
            },
          ]}
          onPress={() => {
            SoundManager.play('ui.tap');
            setNewTaskPriority(priority);
          }}
        >
          <Text
            style={[
              styles.priorityOptionText,
              newTaskPriority === priority && { color: PRIORITY_COLORS[priority] },
            ]}
          >
            {PRIORITY_LABELS[priority]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );


  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tasks</Text>
          <ProfileButton />
        </View>
        {renderTabs()}
        <View style={styles.listContent}>
          <SkeletonLoader variant="list" count={5} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchTasks}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              SoundManager.play('ui.tap');
              SoundManager.play('ui.modal_open');
              setCreateModalVisible(true);
            }}
          >
            <Text style={styles.createButtonText}>+ New</Text>
          </TouchableOpacity>
          <ProfileButton />
        </View>
      </View>

      {renderTabs()}

      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkbox-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.emptyDescription}>
            Create a task to track your gaming goals and earn XP
          </Text>
          <TouchableOpacity
            style={styles.emptyCreateButton}
            onPress={() => {
              SoundManager.play('ui.tap');
              SoundManager.play('ui.modal_open');
              setCreateModalVisible(true);
            }}
          >
            <Text style={styles.emptyCreateButtonText}>Create Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.taskId}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      )}

      {/* XP Popup */}
      {xpPopup.visible && (
        <Animated.View style={[styles.xpPopup, { opacity: xpOpacity }]}>
          <Text style={styles.xpPopupText}>+{xpPopup.xp} XP</Text>
        </Animated.View>
      )}

      {/* Create Task Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          SoundManager.play('ui.modal_close');
          setCreateModalVisible(false);
          setNewTaskTitle('');
          setNewTaskType('one_time');
          setNewTaskPriority(0);
          setNewTaskNotes('');
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboardView}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>New Task</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => {
                      SoundManager.play('ui.modal_close');
                      Keyboard.dismiss();
                      setCreateModalVisible(false);
                      setNewTaskTitle('');
                      setNewTaskType('one_time');
                      setNewTaskPriority(0);
                      setNewTaskNotes('');
                    }}
                  >
                    <Ionicons name="close" size={24} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="What do you want to do?"
                  placeholderTextColor={colors.text.placeholder}
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  maxLength={200}
                  autoFocus={true}
                />

                <Text style={styles.inputLabel}>Type</Text>
                {renderTaskTypeSelector()}

                <Text style={styles.inputLabel}>Priority</Text>
                {renderPrioritySelector()}

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add notes (optional)"
                  placeholderTextColor={colors.text.placeholder}
                  value={newTaskNotes}
                  onChangeText={setNewTaskNotes}
                  maxLength={1000}
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity
                  style={[
                    styles.createTaskButton,
                    !newTaskTitle.trim() && styles.createTaskButtonDisabled,
                  ]}
                  onPress={handleCreateTask}
                  disabled={creating || !newTaskTitle.trim()}
                >
                  {creating ? (
                    <ActivityIndicator color={colors.text.primary} />
                  ) : (
                    <Text style={styles.createTaskButtonText}>Create Task</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Banner Ad at bottom */}
      <View style={styles.adContainer}>
        <PlayBeaconBannerAd />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.background.primary,
  },
  headerTitle: {
    fontSize: typography.sizes.header,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createButton: {
    backgroundColor: colors.accent.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.s,
    ...shadows.medium,
  },
  createButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.l,
    backgroundColor: colors.background.secondary,
  },
  tabActive: {
    backgroundColor: colors.accent.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.text.primary,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  taskItem: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: radii.s,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskItemCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.xs,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.tertiary,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  taskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.s,
    backgroundColor: colors.background.tertiary,
  },
  typeBadge: {
    backgroundColor: colors.accent.tertiary + '30',
  },
  gameBadge: {
    backgroundColor: colors.accent.tertiary + '20',
    maxWidth: 150,
  },
  taskBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.accent.tertiary,
  },
  taskNotes: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyCreateButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radii.s,
    ...shadows.medium,
  },
  emptyCreateButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  xpPopup: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radii.l,
    ...shadows.xlarge,
  },
  xpPopupText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.background.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'flex-end',
  },
  modalKeyboardView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 24,
    paddingBottom: 40,
    ...shadows.xlarge,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  modalCloseButton: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 10,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radii.s,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    marginTop: 16,
    paddingTop: 14,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.xs,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionActive: {
    backgroundColor: colors.accent.tertiary + '20',
    borderColor: colors.accent.tertiary,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  typeOptionTextActive: {
    color: colors.accent.tertiary,
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.xs,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityOptionActive: {
    backgroundColor: colors.background.tertiary,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  createTaskButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: 16,
    borderRadius: radii.s,
    alignItems: 'center',
    marginTop: 24,
  },
  createTaskButtonDisabled: {
    opacity: 0.5,
  },
  createTaskButtonText: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radii.s,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  adContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
});
