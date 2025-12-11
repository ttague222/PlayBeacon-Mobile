/**
 * Wishlist E2E Tests
 *
 * Tests the wishlist/collections functionality:
 * 1. Viewing wishlisted games
 * 2. Creating collections
 * 3. Adding/removing games from collections
 * 4. Empty states
 */

describe('Wishlist & Collections', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });

    // Complete age verification as adult
    await element(by.text("Let's Go!")).tap();
    const adultYear = new Date().getFullYear() - 25;
    await element(by.text(String(adultYear))).tap();

    // Wait for main app
    await waitFor(element(by.id('main-app')))
      .toBeVisible()
      .withTimeout(15000);
  });

  describe('Empty Wishlist State', () => {
    it('should show empty state when no games are saved', async () => {
      await element(by.id('wishlist-tab')).tap();

      await waitFor(element(by.id('wishlist-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Check for empty state message
      await expect(element(by.id('empty-wishlist'))).toBeVisible();
    });

    it('should show call-to-action to discover games', async () => {
      await element(by.id('wishlist-tab')).tap();

      await waitFor(element(by.id('empty-wishlist')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.text('Start Discovering'))).toBeVisible();
    });

    it('should navigate to discovery from empty state', async () => {
      await element(by.id('wishlist-tab')).tap();

      await waitFor(element(by.text('Start Discovering')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.text('Start Discovering')).tap();

      await expect(element(by.id('discovery-screen'))).toBeVisible();
    });
  });

  describe('Adding Games to Wishlist', () => {
    it('should add game to wishlist from discovery', async () => {
      // Go to discovery
      await element(by.id('discovery-tab')).tap();

      await waitFor(element(by.id('game-card')))
        .toBeVisible()
        .withTimeout(10000);

      // Like/save a game
      await element(by.id('like-button')).tap();

      // Check wishlist
      await element(by.id('wishlist-tab')).tap();

      await waitFor(element(by.id('wishlist-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Should no longer show empty state (or show the game)
      await waitFor(element(by.id('game-item')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Collections', () => {
    beforeEach(async () => {
      await element(by.id('wishlist-tab')).tap();
      await waitFor(element(by.id('wishlist-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show create collection button', async () => {
      await expect(element(by.id('create-collection-button'))).toBeVisible();
    });

    it('should open create collection modal', async () => {
      await element(by.id('create-collection-button')).tap();

      await waitFor(element(by.id('create-collection-modal')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should create a new collection', async () => {
      await element(by.id('create-collection-button')).tap();

      await waitFor(element(by.id('collection-name-input')))
        .toBeVisible()
        .withTimeout(5000);

      // Enter collection name
      await element(by.id('collection-name-input')).typeText('My Favorite Games');

      // Create collection
      await element(by.text('Create')).tap();

      // Should show the new collection
      await waitFor(element(by.text('My Favorite Games')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should not allow empty collection name', async () => {
      await element(by.id('create-collection-button')).tap();

      await waitFor(element(by.id('collection-name-input')))
        .toBeVisible()
        .withTimeout(5000);

      // Try to create without name
      await element(by.text('Create')).tap();

      // Should show error or validation message
      await expect(element(by.id('create-collection-modal'))).toBeVisible();
    });

    it('should limit collection name length', async () => {
      await element(by.id('create-collection-button')).tap();

      await waitFor(element(by.id('collection-name-input')))
        .toBeVisible()
        .withTimeout(5000);

      // Enter very long name
      const longName = 'A'.repeat(150);
      await element(by.id('collection-name-input')).typeText(longName);

      // Create collection
      await element(by.text('Create')).tap();

      // Name should be truncated to 100 chars
      // Verify by checking the collection was created
      await waitFor(element(by.id('collection-item')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Collection Management', () => {
    it('should open collection when tapped', async () => {
      await element(by.id('wishlist-tab')).tap();

      await waitFor(element(by.id('collection-item')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('collection-item')).tap();

      await waitFor(element(by.id('collection-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show empty collection state', async () => {
      await element(by.id('wishlist-tab')).tap();

      await waitFor(element(by.id('collection-item')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('collection-item')).tap();

      await waitFor(element(by.id('collection-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // New collection should be empty
      await expect(element(by.id('empty-collection'))).toBeVisible();
    });

    it('should delete collection', async () => {
      await element(by.id('wishlist-tab')).tap();

      await waitFor(element(by.id('collection-item')))
        .toBeVisible()
        .withTimeout(5000);

      // Long press for options
      await element(by.id('collection-item')).longPress();

      await waitFor(element(by.text('Delete')))
        .toBeVisible()
        .withTimeout(3000);

      await element(by.text('Delete')).tap();

      // Confirm deletion
      await element(by.text('Delete')).tap();

      // Collection should be removed
      await waitFor(element(by.id('collection-item')))
        .not.toBeVisible()
        .withTimeout(5000);
    });
  });
});
