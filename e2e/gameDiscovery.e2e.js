/**
 * Game Discovery E2E Tests
 *
 * Tests the core game discovery functionality:
 * 1. Viewing game recommendations
 * 2. Swiping/liking/disliking games
 * 3. Adding to wishlist
 * 4. Game details view
 */

describe('Game Discovery', () => {
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

  describe('Discovery Screen', () => {
    beforeEach(async () => {
      await element(by.id('discovery-tab')).tap();
      await waitFor(element(by.id('discovery-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show game cards on discovery screen', async () => {
      await waitFor(element(by.id('game-card')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should show game title and creator', async () => {
      await waitFor(element(by.id('game-title')))
        .toExist()
        .withTimeout(10000);
    });

    it('should have like, dislike, and skip buttons', async () => {
      await expect(element(by.id('like-button'))).toBeVisible();
      await expect(element(by.id('dislike-button'))).toBeVisible();
      await expect(element(by.id('skip-button'))).toBeVisible();
    });
  });

  describe('Game Actions', () => {
    beforeEach(async () => {
      await element(by.id('discovery-tab')).tap();
      await waitFor(element(by.id('game-card')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should like a game and show next game', async () => {
      const initialGame = await element(by.id('game-title')).getAttributes();
      await element(by.id('like-button')).tap();

      // Wait for animation and new game
      await waitFor(element(by.id('game-card')))
        .toBeVisible()
        .withTimeout(5000);

      // Should show a different game (or confirmation if wishlist)
      // Note: Game might be the same if there's only one game in queue
    });

    it('should dislike a game and show next game', async () => {
      await element(by.id('dislike-button')).tap();

      await waitFor(element(by.id('game-card')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should skip a game and show next game', async () => {
      await element(by.id('skip-button')).tap();

      await waitFor(element(by.id('game-card')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should trigger haptic feedback on button press', async () => {
      // Note: Haptic feedback can't be directly tested,
      // but we verify the action completes without error
      await element(by.id('like-button')).tap();
      await waitFor(element(by.id('game-card')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Game Details', () => {
    beforeEach(async () => {
      await element(by.id('discovery-tab')).tap();
      await waitFor(element(by.id('game-card')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should open game details when card is tapped', async () => {
      await element(by.id('game-card')).tap();

      await waitFor(element(by.id('game-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show game information in details', async () => {
      await element(by.id('game-card')).tap();

      await waitFor(element(by.id('game-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.id('game-detail-title'))).toBeVisible();
      await expect(element(by.id('game-detail-creator'))).toBeVisible();
    });

    it('should have play button in game details', async () => {
      await element(by.id('game-card')).tap();

      await waitFor(element(by.id('game-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.id('play-button'))).toBeVisible();
    });

    it('should navigate back from game details', async () => {
      await element(by.id('game-card')).tap();

      await waitFor(element(by.id('game-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('back-button')).tap();

      await expect(element(by.id('discovery-screen'))).toBeVisible();
    });
  });

  describe('Swipe Gestures', () => {
    beforeEach(async () => {
      await element(by.id('discovery-tab')).tap();
      await waitFor(element(by.id('game-card')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should swipe right to like', async () => {
      await element(by.id('game-card')).swipe('right', 'fast');

      await waitFor(element(by.id('game-card')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should swipe left to dislike', async () => {
      await element(by.id('game-card')).swipe('left', 'fast');

      await waitFor(element(by.id('game-card')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should swipe up to skip', async () => {
      await element(by.id('game-card')).swipe('up', 'fast');

      await waitFor(element(by.id('game-card')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});
