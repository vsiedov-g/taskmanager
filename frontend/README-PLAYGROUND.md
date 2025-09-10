# TaskManager Frontend - UI Playground Testing

This document provides comprehensive instructions for running and maintaining the UI playground tests for the TaskManager frontend application.

## 🎪 Overview

The UI playground testing suite includes:

- **Storybook**: Interactive component playground and documentation
- **Visual Regression Testing**: Automated screenshot comparison using Playwright
- **Accessibility Testing**: WCAG 2.1 AA compliance verification using axe-core
- **Responsive Design Testing**: Cross-device and viewport testing
- **Interaction Testing**: User interaction and state testing

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install
```

### Running Tests

```bash
# Start Storybook development server
npm run storybook

# Run all playground tests
npm run test:playground

# Run only visual regression tests
npm run test:visual

# Run only accessibility tests
npm run test:a11y
```

## 📚 Storybook Component Library

### Starting Storybook

```bash
npm run storybook
```

Visit http://localhost:6006 to explore components interactively.

### Available Components

#### Core Components
- **Button**: Multiple variants, sizes, and states
- **Input**: Form inputs with validation and accessibility
- **Modal**: Accessible modal dialogs with customizable content

#### Feature Components  
- **TaskCard**: Interactive task cards with drag-and-drop
- **BoardSelector**: Dropdown for switching between project boards

### Building Storybook for Production

```bash
npm run build-storybook
```

## 🎯 Visual Regression Testing

Visual regression testing ensures UI consistency across changes using Playwright.

### Configuration

Tests are configured in `playwright.config.ts` with:
- Multiple browsers (Chrome, Firefox, Safari)
- Mobile and desktop viewports
- Screenshot comparison with threshold tolerances
- Automatic retry on failures

### Test Structure

```typescript
// Example visual test
test('should match button screenshot', async ({ page }) => {
  await page.goto('/iframe.html?id=components-button--primary');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('button-primary.png');
});
```

### Running Visual Tests

```bash
# Run all visual tests
npm run test:visual

# Update baseline screenshots
npm run test:visual -- --update-snapshots

# Run tests for specific browsers
npm run test:visual -- --project=chromium

# Run in headed mode (see browser)
npm run test:visual -- --headed
```

### Managing Screenshots

Screenshots are stored in `src/visual-tests/screenshots/`:
- Baseline images for comparison
- Test results and diffs on failures
- Organized by component and test case

### Best Practices

1. **Disable Animations**: Tests automatically disable CSS animations for consistent screenshots
2. **Wait for Content**: Always wait for `networkidle` before capturing
3. **Consistent Viewports**: Use standard viewport sizes for reproducible results
4. **Meaningful Names**: Use descriptive screenshot names

## ♿ Accessibility Testing

Comprehensive a11y testing ensures WCAG 2.1 AA compliance using axe-core.

### Test Coverage

- **Keyboard Navigation**: Tab order and focus management
- **Screen Reader Support**: ARIA attributes and semantic markup  
- **Color Contrast**: Text readability and visual accessibility
- **Focus Management**: Modal focus trapping and restoration
- **Error Handling**: Accessible error states and messages

### Running A11y Tests

```bash
# Run all accessibility tests
npm run test:a11y

# Run with detailed reporting
npm run test:a11y -- --reporter=html

# Test specific stories
npm run test:a11y -- --grep="Button Component"
```

### Accessibility Rules

Tests check for:
- WCAG 2.0 Level A compliance
- WCAG 2.1 Level AA compliance  
- Section 508 compliance
- Custom accessibility rules

### Example A11y Test

```typescript
test('should pass accessibility tests', async ({ page }) => {
  await page.goto('/iframe.html?id=components-button--primary');
  await injectAxe(page);
  
  await checkA11y(page, null, {
    tags: ['wcag2a', 'wcag2aa'],
    detailedReport: true,
  });
});
```

## 📱 Responsive Design Testing

Tests verify components work across different devices and screen sizes.

### Viewport Testing

Automated tests cover:
- Mobile phones (375px width)
- Tablets (768px width)  
- Desktop (1440px width)
- Large screens (1920px+ width)

### Device-Specific Tests

```typescript
test('should work on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/iframe.html?id=components-button--all-variants');
  await expect(page).toHaveScreenshot('mobile-buttons.png');
});
```

## 🎨 Dark Mode Testing

Components are tested in both light and dark themes.

```bash
# Test component in dark mode
npm run storybook
# Navigate to component and toggle theme in toolbar
```

Visual tests automatically include dark mode variants:
- Light theme screenshots
- Dark theme screenshots
- High contrast mode testing

## 🔧 Configuration Files

### Storybook Configuration

- `.storybook/main.ts`: Core Storybook setup and addons
- `.storybook/preview.ts`: Global decorators and parameters
- `.storybook/manager.js`: UI customization and theming

### Testing Configuration

- `playwright.config.ts`: Visual and e2e test configuration
- `.storybook/test-runner.ts`: Storybook test runner setup
- `src/visual-tests/`: Visual regression test suites
- `src/accessibility-tests/`: Accessibility test suites

## 🚢 CI/CD Integration

### GitHub Actions

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run Storybook tests  
  run: npm run test:playground

- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### Chromatic Integration (Optional)

For visual testing in CI:

```bash
# Install Chromatic
npm install --save-dev chromatic

# Run Chromatic tests
npm run chromatic
```

## 📊 Test Reports

### Visual Test Reports

- HTML report: `playwright-report/index.html`
- Screenshot diffs: `test-results/`
- JUnit XML: `playwright-results.xml`

### Accessibility Reports

- Detailed HTML reports with violation details
- axe-core JSON output for CI integration
- WCAG compliance scoring

## 🛠️ Maintenance

### Updating Baselines

When intentional UI changes are made:

```bash
# Update all visual baselines
npm run test:visual -- --update-snapshots

# Update specific test baselines
npm run test:visual -- --update-snapshots --grep="button"
```

### Adding New Component Tests

1. Create component stories in `src/app/components/[component]/[component].stories.ts`
2. Add visual tests in `src/visual-tests/`
3. Add accessibility tests in `src/accessibility-tests/`
4. Update test documentation

### Performance Optimization

- Use `--workers=1` for CI environments
- Enable `--shard` for parallel test execution
- Cache Playwright browsers in CI
- Use `--project` flag to run specific browser tests

## 🐛 Troubleshooting

### Common Issues

1. **Screenshot Differences**: 
   - Check for timing issues
   - Verify font rendering consistency
   - Disable animations properly

2. **Accessibility Failures**:
   - Review ARIA attributes
   - Check color contrast ratios
   - Verify keyboard navigation

3. **Flaky Tests**:
   - Add proper waits (`networkidle`)
   - Increase timeout values
   - Mock unstable dependencies

### Debug Mode

```bash
# Run tests in debug mode
npm run test:visual -- --debug

# Run with browser visible
npm run test:visual -- --headed

# Step through test execution
npm run test:visual -- --debug --grep="specific-test"
```

## 📈 Metrics and Reporting

### Test Coverage

Track component testing coverage:
- Components with visual tests
- Components with accessibility tests
- Viewport coverage
- Browser coverage

### Performance Metrics

Monitor test execution:
- Average test duration
- Screenshot generation time  
- Accessibility scan performance
- CI pipeline execution time

## 🎯 Best Practices

1. **Keep Tests Independent**: Each test should work in isolation
2. **Use Descriptive Names**: Clear test and screenshot naming
3. **Wait for Stability**: Proper async handling and loading states
4. **Version Control**: Commit baseline screenshots to repository
5. **Regular Updates**: Keep testing dependencies current
6. **Document Changes**: Update tests with component modifications

## 📞 Support

For questions or issues:
- Check existing GitHub issues
- Review Playwright documentation
- Consult Storybook guides
- Review axe-core accessibility rules

---

**Happy Testing! 🧪✨**