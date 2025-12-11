/**
 * Age Verification E2E Tests
 *
 * Tests the COPPA-compliant age gate flow:
 * 1. Welcome screen
 * 2. Birth year selection
 * 3. Parental consent (for under-13)
 * 4. Privacy policy access
 */

describe('Age Verification Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    // Clear app data to reset age verification
    await device.clearKeychain();
    await device.launchApp({ newInstance: true });
  });

  describe('Welcome Screen', () => {
    it('should show welcome screen on first launch', async () => {
      await expect(element(by.text('Welcome to PlayBeacon!'))).toBeVisible();
      await expect(element(by.text("Let's Go!"))).toBeVisible();
    });

    it('should navigate to birth year selection when tapping Let\'s Go', async () => {
      await element(by.text("Let's Go!")).tap();
      await expect(element(by.text('When were you born?'))).toBeVisible();
    });
  });

  describe('Birth Year Selection', () => {
    beforeEach(async () => {
      // Navigate to birth year screen
      await element(by.text("Let's Go!")).tap();
    });

    it('should show birth year selection', async () => {
      await expect(element(by.text('When were you born?'))).toBeVisible();
      await expect(element(by.text('Select the year you were born'))).toBeVisible();
    });

    it('should show scrollable list of years', async () => {
      // Check that recent years are visible
      const currentYear = new Date().getFullYear();
      await expect(element(by.text(String(currentYear - 10)))).toBeVisible();
    });

    it('should proceed directly for adults (age 13+)', async () => {
      // Select a year that makes user 18+
      const adultYear = new Date().getFullYear() - 20;
      await element(by.text(String(adultYear))).tap();

      // Should bypass parental consent and go to main app
      await waitFor(element(by.id('main-app')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should require parental consent for children (age < 13)', async () => {
      // Select a year that makes user under 13
      const childYear = new Date().getFullYear() - 8;

      // Scroll to find the year
      await waitFor(element(by.text(String(childYear))))
        .toBeVisible()
        .whileElement(by.id('year-list'))
        .scroll(200, 'down');

      await element(by.text(String(childYear))).tap();

      // Should show parental consent screen
      await expect(element(by.text('Parent or Guardian Needed!'))).toBeVisible();
    });
  });

  describe('Parental Consent Flow', () => {
    beforeEach(async () => {
      // Navigate to parental consent screen
      await element(by.text("Let's Go!")).tap();

      // Select a year that makes user under 13
      const childYear = new Date().getFullYear() - 8;
      await waitFor(element(by.text(String(childYear))))
        .toBeVisible()
        .whileElement(by.id('year-list'))
        .scroll(200, 'down');
      await element(by.text(String(childYear))).tap();
    });

    it('should show parental consent information', async () => {
      await expect(element(by.text('Parent or Guardian Needed!'))).toBeVisible();
      await expect(element(by.text('Hey there, parents and guardians!'))).toBeVisible();
    });

    it('should show privacy protections list', async () => {
      await expect(element(by.text("We don't collect personal information from kids"))).toBeVisible();
      await expect(element(by.text('All accounts are anonymous by default'))).toBeVisible();
      await expect(element(by.text('No chat or social features with other users'))).toBeVisible();
    });

    it('should show privacy policy link', async () => {
      await expect(element(by.text('📜 Read our Privacy Policy'))).toBeVisible();
    });

    it('should open privacy policy when tapped', async () => {
      await element(by.text('📜 Read our Privacy Policy')).tap();
      await expect(element(by.text('Privacy Policy'))).toBeVisible();
    });

    it('should close privacy policy with Done button', async () => {
      await element(by.text('📜 Read our Privacy Policy')).tap();
      await element(by.text('Done')).tap();
      await expect(element(by.text('Parent or Guardian Needed!'))).toBeVisible();
    });

    it('should proceed when parent gives consent', async () => {
      await element(by.text("I'm a Parent/Guardian - I Agree")).tap();

      // Should proceed to main app
      await waitFor(element(by.id('main-app')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show alert when consent is declined', async () => {
      await element(by.text('Go Back')).tap();
      await expect(element(by.text('Parental Permission Required'))).toBeVisible();
    });

    it('should return to birth year when alert is dismissed', async () => {
      await element(by.text('Go Back')).tap();
      await element(by.text('OK')).tap();
      await expect(element(by.text('When were you born?'))).toBeVisible();
    });
  });

  describe('Age Verification Persistence', () => {
    it('should skip age verification on subsequent launches for adults', async () => {
      // Complete verification as adult
      await element(by.text("Let's Go!")).tap();
      const adultYear = new Date().getFullYear() - 25;
      await element(by.text(String(adultYear))).tap();

      // Wait for main app
      await waitFor(element(by.id('main-app')))
        .toBeVisible()
        .withTimeout(5000);

      // Relaunch app
      await device.launchApp({ newInstance: false });

      // Should go directly to main app
      await expect(element(by.id('main-app'))).toBeVisible();
    });

    it('should skip age verification on subsequent launches for consented children', async () => {
      // Complete verification as child with consent
      await element(by.text("Let's Go!")).tap();
      const childYear = new Date().getFullYear() - 10;
      await waitFor(element(by.text(String(childYear))))
        .toBeVisible()
        .whileElement(by.id('year-list'))
        .scroll(200, 'down');
      await element(by.text(String(childYear))).tap();
      await element(by.text("I'm a Parent/Guardian - I Agree")).tap();

      // Wait for main app
      await waitFor(element(by.id('main-app')))
        .toBeVisible()
        .withTimeout(5000);

      // Relaunch app
      await device.launchApp({ newInstance: false });

      // Should go directly to main app
      await expect(element(by.id('main-app'))).toBeVisible();
    });
  });
});
