/**
 * UnlockModalManager Component
 *
 * Global component that watches for pending unlocks and shows
 * the RewardUnlockModal when badges/animals are earned.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useCollection } from '../../context/CollectionContext';
import RewardUnlockModal from './RewardUnlockModal';

export default function UnlockModalManager() {
  const navigation = useNavigation();
  const { pendingUnlocks } = useCollection();
  const [showModal, setShowModal] = useState(false);

  // Show modal when there are pending unlocks
  useEffect(() => {
    if (pendingUnlocks.length > 0 && !showModal) {
      // Small delay to let the triggering action complete
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pendingUnlocks.length, showModal]);

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleViewCollection = useCallback(() => {
    setShowModal(false);
    // Navigate to collectables screen
    navigation.navigate('Collectables' as never);
  }, [navigation]);

  return (
    <RewardUnlockModal
      visible={showModal}
      onClose={handleClose}
      onViewCollection={handleViewCollection}
    />
  );
}
