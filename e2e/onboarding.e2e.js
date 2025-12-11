/**
 * Onboarding Flow E2E Tests
 *
 * Tests the complete onboarding experience:
 * 1. Age verification → Tutorial → Roblox Import → Main App
 */

describe('Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.clearKeychain();
    await device.launchApp({ newInstance: true });
  });

  describe('Complete Flow - Adult User', () => {
    it('should complete full onboarding as adult user', async () => {
      // Step 1: Age Verification
      await expect(element(by.text('Welcome to PlayBeacon!'))).toBeVisible();
      await element(by.text("Let's Go!")).tap();

      // Select adult year
      const adultYear = new Date().getFullYear() - 25;
      await element(by.text(String(adultYear))).tap();

      // Step 2: Tutorial (if shown)
      await waitFor(element(by.id('tutorial-screen')))
        .toBeVisible()
        .withTimeout(3000)
        .then(async () => {
          // Skip or complete tutorial
          await element(by.text('Skip')).tap();
        })
        .catch(() => {
          // Tutorial may not be shown
        });

      // Step 3: Roblox Import (if shown)
      await waitFor(element(by.id('roblox-import-screen')))
        .toBeVisible()
        .withTimeout(3000)
        .then(async () => {
          // Skip Roblox import
          await element(by.text('Skip for Now')).tap();
        })
        .catch(() => {
          // Roblox import may not be shown
        });

      // Step 4: Main App
      await waitFor(element(by.id('main-app')))
        .toBeVisible()
        .withTimeout(10000);

      // Verify we're on the home screen
      await expect(element(by.id('bottom-tab-bar'))).toBeVisible();
    });
  });

  describe('Complete Flow - Child User with Consent', () => {
    it('should complete full onboarding as child with parental consent', async () => {
      // Step 1: Age Verification
      await expect(element(by.text('Welcome to PlayBeacon!'))).toBeVisible();
      await element(by.text("Let's Go!")).tap();

      // Select child year
      const childYear = new Date().getFullYear() - 9;
      await waitFor(element(by.text(String(childYear))))
        .toBeVisible()
        .whileElement(by.id('year-list'))
        .scroll(200, 'down');
      await element(by.text(String(childYear))).tap();

      // Parental consent
      await expect(element(by.text('Parent or Guardian Needed!'))).toBeVisible();
      await element(by.text("I'm a Parent/Guardian - I Agree")).tap();

      // Step 2: Tutorial (if shown)
      await waitFor(element(by.id('tutorial-screen')))
        .toBeVisible()
        .withTimeout(3000)
        .then(async () => {
          await element(by.text('Skip')).tap();
        })
        .catch(() => {});

      // Step 3: Roblox Import (if shown)
      await waitFor(element(by.id('roblox-import-screen')))
        .toBeVisible()
        .withTimeout(3000)
        .then(async () => {
          await element(by.text('Skip for Now')).tap();
        })
        .catch(() => {});

      // Step 4: Main App
      await waitFor(element(by.id('main-app')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Navigation Between Screens', () => {
    beforeEach(async () => {
      // Complete age verification
      await element(by.text("Let's Go!")).tap();
      const adultYear = new Date().getFullYear() - 25;
      await element(by.text(String(adultYear))).tap();

      // Skip tutorial and import if shown
      await waitFor(element(by.id('main-app')))
        .toBeVisible()
        .withTimeout(15000);
    });

    it('should navigate between bottom tabs', async () => {
      // Home tab
      await expect(element(by.id('home-tab'))).toBeVisible();
      await element(by.id('home-tab')).tap();
      await expect(element(by.id('home-screen'))).toBeVisible();

      // Discovery tab
      await element(by.id('discovery-tab')).tap();
      await waitFor(element(by.id('discovery-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Wishlist tab
      await element(by.id('wishlist-tab')).tap();
      await waitFor(element(by.id('wishlist-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Profile tab
      await element(by.id('profile-tab')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});
