import { test, expect, type Page } from '@playwright/test';
import { introData, aboutData, contactData, projectsData, coursesData, educationData, blogsData, experienceData } from '../src/data/content.js';

// Browser tests isolate rendering and form behavior with the actual API contract.
// The backend integration suite separately exercises persistence against MongoDB.
async function mockApi(page: Page, existingState?: any) {
  let nextId = 100;
  const id = () => String(nextId++).padStart(24, '0');
  const rows = (items: any[]) => items.map(item => ({ ...item, _id: id() }));
  const data: any = existingState?.data || structuredClone({
    intro: { ...introData, _id: id(), avatar: '/projects/avater.jpg', footerDescription: 'A test footer', navWorkLabel: 'Work', navInfoLabel: 'Info', navLinkedinLabel: 'LinkedIn', navResumeLabel: 'Resume', footerNavigationTitle: 'Navigation', footerSocialTitle: 'Connect & Socials', footerWorkLabel: 'Work', footerInfoLabel: 'Info / About', footerContactLabel: 'Say Hello / Contact' },
    about: { ...aboutData, _id: id(), contactCtaLabel: 'Get in touch directly below', articlesSectionVisible: true, dataMlSectionVisible: true, dataMlTitle: 'Data & ML', dataMlSubtitle: 'Data analysis, machine learning experiments, and data-driven systems.' },
    contact: { ...contactData, _id: id(), formButtonLabel: 'Send Message', social: { linkedin: 'https://linkedin.com/in/test-person', resume: '/resume.pdf', github: 'https://github.com/test-person' } },
    projects: rows(projectsData), dataMlProjects: [], courses: rows(coursesData), education: rows(educationData), experiences: rows(experienceData),
    blogs: rows(blogsData.map(blog => ({ ...blog, date: new Date(blog.date).toISOString().slice(0, 10) }))),
  });
  const state: any = existingState || { data, messages: [], failSave: false, failContact: false, failLoad: false, expire: false, requests: [] };
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/v1/', '');
    const body = request.method() === 'POST' && path !== 'upload-image' ? request.postDataJSON() || {} : {};
    state.requests.push({ path, body });
    const reply = (json: any, status = 200) => route.fulfill({ status, json });
    if (path === 'portfolio-data') return reply(state.failLoad ? { message: 'Content unavailable' } : data, state.failLoad ? 503 : 200);
    if (path === 'admin-login') return body.username === 'test-admin' && body.password === 'test-password' ? reply({ success: true, token: 'a'.repeat(64) }) : reply({ success: false, message: 'Invalid username or password.' }, 401);
    if (path === 'send-message') {
      if (state.failContact) return reply({ success: false, message: 'Message could not be saved.' }, 503);
      state.messages.push({ ...body, _id: id(), createdAt: new Date().toISOString() });
      return reply({ success: true }, 201);
    }
    if (state.expire || request.headers().authorization !== 'Bearer ' + 'a'.repeat(64)) return reply({ success: false, message: 'Please sign in.' }, 401);
    if (path === 'upload-image') return reply({ success: true, data: { url: 'https://res.cloudinary.com/test/image/upload/portfolio_assets/avatar.jpg', publicId: 'portfolio_assets/avatar' } }, 201);
    if (path === 'admin-session' || path === 'admin-logout') return reply({ success: true });
    if (path === 'messages') return reply({ success: true, data: state.messages, total: state.messages.length, page: 1, pages: state.messages.length ? 1 : 0 });
    if (state.failSave) return reply({ success: false, message: 'Could not save changes.' }, 503);
    const [action, section] = path.split('-');
    const collection: any = { project: 'projects', experience: 'experiences', course: 'courses', education: 'education', blog: 'blogs' };
    if (!collection[section]) {
      if (state.ignoreSkills) delete body.skillCategories;
      if (state.ignoreVisibility) for (const key of Object.keys(body)) if (key.endsWith('SectionVisible')) delete body[key];
      data[section] = { ...data[section], ...body, _id: data[section]?._id || id() };
      return reply({ success: true, data: data[section] });
    }
    const key = section === 'project' && (body.kind === 'data-ml' || data.dataMlProjects.some((item: any) => item._id === body._id)) ? 'dataMlProjects' : collection[section];
    if (action === 'delete') { data[key] = data[key].filter((item: any) => item._id !== body._id); return reply({ success: true }); }
    const record = { ...body, _id: body._id || id() };
    if (action === 'add') data[key].push(record);
    else data[key] = data[key].map((item: any) => item._id === body._id ? { ...item, ...record } : item);
    return reply({ success: true, data: record });
  });
  return state;
}
async function signIn(page: Page, section = 'intro') {
  await page.goto('/admin/' + section);
  await page.getByLabel('Username', { exact: true }).fill('test-admin');
  await page.getByLabel('Password', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Make it yours.' })).toBeVisible();
}

test('persisted eye toggles update an already-open portfolio tab and survive reload', async ({ page, context }) => {
  const state = await mockApi(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Data & ML', exact: true, level: 2 })).toBeVisible();
  const admin = await context.newPage();
  await mockApi(admin, state);
  await signIn(admin, 'data-ml');
  await admin.getByRole('button', { name: 'Hide Data & ML projects section' }).click();
  await expect(admin.getByRole('button', { name: 'Show Data & ML projects section' })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('heading', { name: 'Data & ML', exact: true, level: 2 })).toHaveCount(0);
  await admin.reload();
  await expect(admin.getByRole('button', { name: 'Show Data & ML projects section' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Data & ML', exact: true, level: 2 })).toHaveCount(0);
  await admin.getByRole('button', { name: 'Show Data & ML projects section' }).click();
  await expect(page.getByRole('heading', { name: 'Data & ML', exact: true, level: 2 })).toBeVisible();
  await admin.goto('/admin/skills');
  await admin.getByRole('button', { name: 'Hide Skills section' }).click();
  await expect(page.getByRole('heading', { name: 'Skills & Capabilities' })).toHaveCount(0);
  await expect(page.locator('#projects article')).toHaveCount(3);
  await admin.goto('/admin/data-ml');
  await admin.getByRole('button', { name: 'Add item' }).click();
  await admin.getByLabel('Project title').fill('New live ML project');
  await admin.getByLabel('Short description').fill('A work in progress.');
  await admin.getByLabel('Type').selectOption('Machine Learning');
  await admin.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'New live ML project', exact: true })).toBeVisible();
});

test('Skills admin creates, edits, reorders, hides and deletes categories and chips', async ({ page }) => {
  const state = await mockApi(page);
  state.data.about.skillCategories = [];
  await signIn(page, 'skills');
  await page.getByLabel('Skills heading', { exact: true }).fill('My capabilities');
  await page.getByRole('button', { name: 'Add category', exact: true }).click();
  const category = page.getByRole('group', { name: 'Category 1', exact: true });
  await category.getByLabel('Category name', { exact: true }).fill('Application development');
  await category.getByLabel('Description', { exact: true }).fill('Verified project work.');
  await category.getByRole('button', { name: 'Add skill', exact: true }).click();
  const skill = category.getByRole('group', { name: 'Skill 1', exact: true });
  await skill.getByLabel('Skill name', { exact: true }).fill('React');
  await skill.getByLabel('Icon (optional emoji or text)', { exact: true }).fill('R');
  await category.getByRole('button', { name: 'Add skill', exact: true }).click();
  const second = category.getByRole('group', { name: 'Skill 2', exact: true });
  await second.getByLabel('Skill name', { exact: true }).fill('Draft skill');
  await second.getByLabel('Show skill', { exact: true }).uncheck();
  await second.getByRole('button', { name: 'Move skill up' }).click();
  await page.getByRole('button', { name: 'Add category', exact: true }).click();
  const extra = page.getByRole('group', { name: 'Category 2', exact: true });
  await extra.getByLabel('Category name', { exact: true }).fill('Hidden category');
  await extra.getByLabel('Show category', { exact: true }).uncheck();
  await extra.getByRole('button', { name: 'Move category up' }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  expect(state.data.about.skillCategories[0]).toMatchObject({ name: 'Hidden category', visible: false, order: 0 });
  expect(state.data.about.skillCategories[1].skills[1]).toMatchObject({ name: 'React', order: 1, icon: 'R' });
  await page.reload();
  await expect(page.getByLabel('Skills heading')).toHaveValue('My capabilities');
  const visibleCategory = page.getByRole('group', { name: 'Category 2', exact: true });
  await visibleCategory.getByRole('group', { name: 'Skill 1', exact: true }).getByRole('button', { name: 'Remove skill', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  await page.goto('/');
  await expect(page.locator('#skills')).toContainText('My capabilities');
  await expect(page.locator('#skills')).not.toContainText('Hidden category');
  await expect(page.locator('#skills')).not.toContainText('Draft skill');
  await expect(page.locator('#skills').getByRole('link')).toHaveCount(0);
  expect(state.data.about.skillCategories[1].skills[0]).not.toHaveProperty('level');
  expect(state.data.about.skillCategories[1].skills[0]).not.toHaveProperty('projectIds');
  await page.goto('/admin/skills');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('group', { name: 'Category 1', exact: true }).getByRole('button', { name: 'Remove category', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  expect(state.data.about.skillCategories).toHaveLength(1);
});

for (const width of [390, 768, 1440]) test(`Skills chips form aligned rows without ratings or links at ${width}px`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const state = await mockApi(page);
  Object.assign(state.data.about.skillCategories[1].skills[0], { level: 'Core', percentage: 90, projectIds: [state.data.projects[0]._id] });
  state.data.about.skillCategories[1].skills.push({ name: 'Hidden draft', visible: false, order: 99 });
  await page.goto('/');
  const section = page.locator('#skills');
  await expect(page.getByText('Just a moment.', { exact: true })).toHaveCount(0);
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole('heading', { name: 'Data & Machine Learning', exact: true })).toBeVisible();
  await expect(section).toContainText('PostgreSQL');
  await expect(section).toContainText('Docker');
  await expect(section).toContainText('ShadCN');
  await expect(section).not.toContainText('Hidden draft');
  await expect(section).not.toContainText(/Core|Working|Exploring|Beginner|Intermediate|Advanced|Expert|%/);
  await expect(section.getByRole('link')).toHaveCount(0);
  await expect(section.getByRole('progressbar')).toHaveCount(0);
  await expect(section.locator('article')).toHaveCount(7);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const layout = await section.locator('article').evaluateAll(cards => {
    const grid = cards[0].parentElement!;
    return { gapX: getComputedStyle(grid).columnGap, gapY: getComputedStyle(grid).rowGap,
      width: grid.getBoundingClientRect().width,
      cards: cards.map(card => { const rect = card.getBoundingClientRect(); return { top: rect.top, bottom: rect.bottom, height: rect.height, width: rect.width, padding: getComputedStyle(card).padding }; }) };
  });
  expect(layout.gapX).toBe('16px');
  expect(layout.gapY).toBe(layout.gapX);
  expect(new Set(layout.cards.map(card => card.padding)).size).toBe(1);
  const rows = new Map<number, typeof layout.cards>();
  for (const card of layout.cards) { const key = Math.round(card.top); rows.set(key, [...(rows.get(key) || []), card]); }
  const orderedRows = [...rows.values()];
  for (const row of orderedRows) {
    expect(Math.max(...row.map(card => card.height)) - Math.min(...row.map(card => card.height))).toBeLessThan(1);
    expect(Math.abs(row.reduce((sum, card) => sum + card.width, 0) + (row.length - 1) * 16 - layout.width)).toBeLessThan(2);
  }
  for (let i = 1; i < orderedRows.length; i++) expect(Math.abs(orderedRows[i][0].top - orderedRows[i - 1][0].bottom - 16)).toBeLessThan(1);
  await section.screenshot({ path: `test-results/skills-chips-${width}.png`, animations: 'disabled', style: 'header { visibility: hidden !important; }' });
  await page.getByRole('button', { name: 'Productivity', exact: true }).click();
  await expect(page.locator('#projects article')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('Skills reveal and chip hover retain the current animation system without shifting grid rows', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  const cards = page.locator('#skills article');
  await expect(cards).toHaveCount(7);
  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveCSS('opacity', '1');
  }
  const chip = page.locator('#skills li').last();
  const before = await chip.evaluate(element => getComputedStyle(element).borderColor);
  const height = await page.locator('#skills').evaluate(element => element.getBoundingClientRect().height);
  await chip.hover();
  await expect.poll(() => chip.evaluate(element => getComputedStyle(element).borderColor)).not.toBe(before);
  expect(await page.locator('#skills').evaluate(element => element.getBoundingClientRect().height)).toBe(height);
});

test('saved legacy Skills lose obsolete metadata on edit and suggested categories remain an explicit draft action', async ({ page }) => {
  const state = await mockApi(page);
  state.data.about.skillCategories = [{ name: 'Custom group', visible: true, order: 0,
    skills: [{ name: 'Custom skill', level: 'Working', percentage: 70, projectIds: ['old'], visible: true, order: 0 }] }];
  await signIn(page, 'skills');
  await expect(page.getByLabel('Level', { exact: true })).toHaveCount(0);
  await page.getByLabel('Skill name', { exact: true }).fill('Renamed skill');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  const saved = state.data.about.skillCategories[0].skills[0];
  expect(saved.name).toBe('Renamed skill');
  for (const field of ['percentage', 'level', 'projectIds']) expect(saved).not.toHaveProperty(field);
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Use suggested categories' }).click();
  await expect(page.getByLabel('Skill name', { exact: true })).toHaveCount(1);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Use suggested categories' }).click();
  await expect(page.getByLabel('Category name', { exact: true })).toHaveCount(7);
  expect(state.data.about.skillCategories).toHaveLength(1);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  expect(state.data.about.skillCategories).toHaveLength(7);
});

test('a stale backend cannot report that categorized skills were saved', async ({ page }) => {
  const state = await mockApi(page);
  state.ignoreSkills = true;
  await signIn(page, 'skills');
  await page.getByLabel('Skill name', { exact: true }).first().fill('Updated language');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('alert')).toContainText('Skills were not saved');
  await expect(page.getByLabel('Skill name', { exact: true }).first()).toHaveValue('Updated language');
});

test('mobile Skills admin fits the viewport and a deliberately empty category list stays empty', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await mockApi(page);
  await signIn(page, 'skills');
  await expect(page.getByLabel('Skill name', { exact: true }).first()).toBeVisible();
  await expect(page.getByLabel('Level', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/skills-admin-mobile.png' });
  state.data.about.skillCategories = [];
  await page.goto('/');
  await expect(page.locator('#skills')).toContainText('No skills published yet.');
  await expect(page.locator('#skills article')).toHaveCount(0);
});

test('a server that ignores visibility updates cannot report a successful toggle', async ({ page }) => {
  const state = await mockApi(page);
  state.ignoreVisibility = true;
  await signIn(page, 'data-ml');
  await page.getByRole('button', { name: 'Hide Data & ML projects section' }).click();
  await expect(page.getByRole('alert')).toContainText('Visibility was not saved');
  await expect(page.getByRole('button', { name: 'Hide Data & ML projects section' })).toHaveAttribute('aria-pressed', 'true');
});

test('public content, filtering and social links use the backend response', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'I build scalable web experiences.' })).toBeVisible();
  await expect(page.locator('header').getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://linkedin.com/in/test-person');
  await page.getByRole('button', { name: 'Medical', exact: true }).click();
  await expect(page.getByText('1 Case Study', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Medical supply Chain website' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Culinary & Food-Focused Platform' })).toHaveCount(0);
  await page.screenshot({ path: 'test-results/public-desktop.png' });
});

test('Data & ML CRUD and visibility use existing cards and articles can be shown again', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  const state = await mockApi(page);
  state.data.about.articlesSectionVisible = false;
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Technical Articles & Insights' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Data & ML', exact: true, level: 2 })).toBeVisible();
  await expect(page.locator('#projects article')).toHaveCount(3);
  await expect(page.locator('#contact')).toBeAttached();

  await signIn(page, 'data-ml');
  await page.getByRole('button', { name: 'Add item' }).click();
  await page.getByLabel('Project title').fill('Data workflow in progress');
  await page.getByLabel('Short description').fill('Exploring data preparation and analysis.');
  await page.getByLabel('Type').selectOption('Data Analysis');
  await page.getByLabel('Featured project').check();
  await page.getByLabel('Problem', { exact: true }).fill('Cleaning source data');
  await page.getByLabel('Result / findings').fill('Initial validation is underway.');
  await page.getByLabel('Show problem').uncheck();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('article').filter({ hasText: 'Data workflow in progress' })).toBeVisible();
  expect(state.data.dataMlProjects).toHaveLength(1);
  await page.goto('/');
  await expect(page.locator('#projects article')).toHaveCount(4);
  await expect(page.getByRole('heading', { level: 2, name: 'Data workflow in progress' })).toBeVisible();
  await expect(page.locator('#projects')).toContainText('Initial validation is underway.');
  await expect(page.locator('#projects')).not.toContainText('Cleaning source data');
  await expect(page.locator('#projects')).toContainText('Featured');
  expect(await page.evaluate(() => {
    const cards = [...document.querySelectorAll('#projects article')];
    const heading = [...document.querySelectorAll('#projects h2')].find(node => node.textContent === 'Data & ML');
    return cards.length === 4 && !!(cards[2].compareDocumentPosition(heading!) & Node.DOCUMENT_POSITION_FOLLOWING) && !!(heading!.compareDocumentPosition(cards[3]) & Node.DOCUMENT_POSITION_FOLLOWING) && Number(cards[3].parentElement?.style.zIndex) > Number(cards[2].parentElement?.style.zIndex);
  })).toBe(true);
  await page.getByText('Just a moment.', { exact: true }).waitFor({ state: 'detached' });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390 || width === 1440) await page.screenshot({ path: `test-results/data-ml-${width}.png`, fullPage: true });
  }

  await page.goto('/admin/data-ml');
  await page.getByRole('article').filter({ hasText: 'Data workflow in progress' }).getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Show this project').uncheck();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2, name: 'Data workflow in progress' })).toHaveCount(0);
  await page.goto('/admin/visibility');
  await page.getByLabel('Show Technical Articles').check();
  await page.getByLabel('Show Data & ML').uncheck();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Technical Articles & Insights' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Data & ML', exact: true, level: 2 })).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test('each public section has an eye control and hidden sections leave no visible block', async ({ page }) => {
  const state = await mockApi(page);
  await signIn(page, 'blog');
  for (const section of ['navbar', 'intro', 'about', 'skills', 'project', 'data-ml', 'experience', 'education', 'course', 'blog', 'contact', 'footer']) {
    await page.goto(`/admin/${section}`);
    await expect(page.getByRole('button', { name: /section$/ })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Hide Footer section' }).click();
  await expect(page.getByText('Footer is now hidden from the portfolio.')).toBeVisible();
  await page.goto('/admin/blog');
  await page.getByRole('button', { name: 'Hide Articles section' }).click();
  await page.goto('/admin/data-ml');
  await page.getByRole('button', { name: 'Hide Data & ML projects section' }).click();
  await page.goto('/admin/experience');
  await page.getByRole('button', { name: 'Hide Experience section' }).click();
  await page.goto('/admin/skills');
  await page.getByRole('button', { name: 'Hide Skills section' }).click();
  expect(state.data.about).toMatchObject({ footerSectionVisible: false, articlesSectionVisible: false, dataMlSectionVisible: false, experienceSectionVisible: false, skillsSectionVisible: false });
  await page.goto('/');
  await expect(page.locator('footer')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Technical Articles & Insights' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Data & ML', exact: true, level: 2 })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Experience', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Skills & Capabilities' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Education', exact: true })).toBeVisible();
  await expect(page.locator('#projects article')).toHaveCount(3);
  await page.goto('/admin/blog');
  await page.getByRole('button', { name: 'Show Articles section' }).click();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Technical Articles & Insights' })).toBeVisible();
});

test('admin changes the hero and identity and public pages read the saved values', async ({ page }) => {
  const state = await mockApi(page);
  await signIn(page);
  await page.getByLabel('First name', { exact: false }).fill('Ada');
  await page.getByLabel('Hero headline', { exact: true }).fill('I create thoughtful');
  await page.getByLabel('Highlighted words', { exact: true }).fill('products.');
  await page.getByLabel('Footer description', { exact: true }).fill('Updated footer biography');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  expect(state.data.intro.heroHeadline).toBe('I create thoughtful');
  await page.screenshot({ path: 'test-results/admin-desktop.png', fullPage: true });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'I create thoughtful products.' })).toBeVisible();
  await expect(page.locator('header')).toContainText('Ada Mannan');
  await expect(page.locator('footer')).toContainText('Updated footer biography');
});

test('the admin controls a formerly empty hero and public rendering uses saved CMS content', async ({ page }) => {
  const state = await mockApi(page);
  Object.assign(state.data.intro, { heroHeadline: '', heroAccentWord: '', heroSubtextWhite: '', heroSubtextGray: '' });
  await signIn(page);
  await expect(page.getByLabel('Hero headline', { exact: true })).toHaveValue('');
  await page.getByLabel('Hero headline', { exact: true }).fill('I build scalable web');
  await page.getByLabel('Highlighted words', { exact: true }).fill('experiences.');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  expect(state.data.intro.heroHeadline).toBe('I build scalable web');
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'I build scalable web experiences.' })).toBeVisible();
});

test('navbar, footer, and portrait content are editable through the existing admin', async ({ page }) => {
  const state = await mockApi(page);
  await signIn(page, 'navbar');
  await page.getByLabel('Work tab label').fill('Portfolio');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  await page.goto('/admin/footer');
  await page.getByLabel('Navigation heading').fill('Explore');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.goto('/admin/intro');
  await page.getByLabel('Upload profile image').setInputFiles({ name: 'portrait.png', mimeType: 'image/png', buffer: Buffer.from('mock-image') });
  await expect(page.getByLabel('Profile image URL')).toHaveValue('https://res.cloudinary.com/test/image/upload/portfolio_assets/avatar.jpg');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  expect(state.data.intro.avatarPublicId).toBe('portfolio_assets/avatar');
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Portfolio' })).toBeVisible();
  await expect(page.locator('footer')).toContainText('Explore');
});

test('education supports create, edit, deletion and adding again after editing', async ({ page }) => {
  const state = await mockApi(page);
  await signIn(page, 'education');
  await page.getByRole('button', { name: 'Add item' }).click();
  await page.getByLabel('Institution', { exact: false }).fill('Test University');
  await page.getByLabel('Degree', { exact: false }).fill('Test Degree');
  await page.getByLabel('Year / period', { exact: false }).fill('2026');
  await page.getByLabel('Status', { exact: true }).fill('In progress');
  await page.getByRole('button', { name: 'Save changes' }).click();
  const row = page.getByRole('article').filter({ hasText: 'Test Degree' });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByLabel('Status', { exact: true }).fill('Completed');
  await page.getByRole('button', { name: 'Save changes' }).click();
  expect(state.data.education.at(-1).status).toBe('Completed');
  page.once('dialog', dialog => dialog.accept());
  await row.getByRole('button', { name: 'Delete Test Degree' }).click();
  await expect(row).toHaveCount(0);
  await page.getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByLabel('Degree', { exact: false })).toHaveValue('');
});

test('skills, social links and articles are editable using the new admin screens', async ({ page }) => {
  const state = await mockApi(page);
  await signIn(page, 'skills');
  await page.getByLabel('Skill name', { exact: true }).first().fill('JavaScript (ES6+)');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  expect(state.data.about.skillCategories[0].skills[0].name).toBe('JavaScript (ES6+)');
  await page.getByRole('link', { name: 'Contact & links' }).click();
  await page.getByLabel('LinkedIn URL').fill('https://linkedin.com/in/updated-profile');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  await page.getByRole('link', { name: 'Articles', exact: true }).click();
  await page.getByRole('button', { name: 'Add item' }).click();
  await page.getByLabel('Article title').fill('An integration story');
  await page.getByLabel('Slug').fill('an-integration-story');
  await page.getByLabel('Publication date').fill('2026-09-24');
  await page.getByLabel('Excerpt').fill('A short introduction');
  await page.getByLabel('Article body').fill('First paragraph.\n\nSecond paragraph.');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('article').filter({ hasText: 'An integration story' })).toBeVisible();
  await page.goto('/');
  await expect(page.locator('header').getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://linkedin.com/in/updated-profile');
  const article = page.locator('div.group').filter({ has: page.getByRole('heading', { name: 'An integration story', exact: true }) }).last();
  await article.getByRole('button', { name: 'See more' }).click();
  await expect(page.getByText('First paragraph.', { exact: true })).toBeVisible();
  await expect(page.getByText('Second paragraph.', { exact: true })).toBeVisible();
});

test('failed saves preserve edits and expired sessions return to sign-in', async ({ page }) => {
  const state = await mockApi(page);
  await signIn(page);
  state.failSave = true;
  await page.getByLabel('Hero headline', { exact: true }).fill('Keep this draft');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('alert')).toContainText('Could not save changes.');
  await expect(page.getByLabel('Hero headline', { exact: true })).toHaveValue('Keep this draft');
  state.failSave = false;
  state.expire = true;
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
});

test('contact form retains failed submissions and successful messages appear in the inbox', async ({ page }) => {
  const state = await mockApi(page);
  await page.goto('/');
  await page.getByLabel('Your Name', { exact: true }).fill('Reader');
  await page.getByLabel('Email Address', { exact: true }).fill('reader@example.com');
  await page.getByLabel('Message', { exact: true }).fill('A project inquiry');
  state.failContact = true;
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByRole('alert')).toContainText('Message could not be saved.');
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue('A project inquiry');
  state.failContact = false;
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByRole('status')).toContainText('sent successfully');
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue('');
  expect(state.messages).toHaveLength(1);
  await signIn(page, 'messages');
  await expect(page.getByRole('article')).toContainText('A project inquiry');
});

test('API failure shows retry and empty collections render without crashing', async ({ page }) => {
  const state = await mockApi(page);
  state.failLoad = true;
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Retry loading portfolio' })).toBeVisible();
  state.failLoad = false;
  Object.assign(state.data, { projects: [], education: [], experiences: [], blogs: [], courses: [], about: null, contact: null, intro: null });
  await page.getByRole('button', { name: 'Retry loading portfolio' }).click();
  await expect(page.getByRole('heading', { name: 'No projects found' })).toBeVisible();
  await expect(page.getByText('No education listed yet.')).toBeAttached();
});

test('mobile admin and public layout fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApi(page);
  await signIn(page, 'contact');
  await expect(page.getByLabel('LinkedIn URL')).toBeAttached();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/admin-mobile.png', fullPage: true });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'I build scalable web experiences.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/public-mobile.png' });
});


for (const width of [390, 768, 1440]) test(`Professional Development renders three concise cards at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await mockApi(page);
  await page.goto('/');
  await expect(page.getByText('Just a moment.', { exact: true })).toHaveCount(0);
  const section = page.locator('#professional-development');
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole('heading', { name: 'Professional Development', exact: true })).toBeVisible();
  await expect(section.getByRole('article')).toHaveCount(3);
  await expect(section.getByText('Completed', { exact: true })).toHaveCount(2);
  await expect(section.getByText('6 months', { exact: true })).toHaveCount(2);
  await expect(section).toContainText('Forward IT');
  await expect(section).toContainText('2026 – Present');
  await expect(section).toContainText('Training Program');
  await expect(section).toContainText('In Progress');
  await expect(section).toContainText('GraphQL');
  await expect(section).toContainText('Model Evaluation');
  await expect(section.getByRole('link')).toHaveCount(0);
  await expect(section).not.toContainText(/View Curriculum|950|videos|students at all levels|Internship|ML Engineer|Data Scientist/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const geometry = await section.locator('article').evaluateAll(cards => ({
    rows: cards.map(card => { const rect = card.getBoundingClientRect(); return { top: rect.top, height: rect.height, width: rect.width, padding: getComputedStyle(card).padding }; }),
    gapX: getComputedStyle(cards[0].parentElement!).columnGap, gapY: getComputedStyle(cards[0].parentElement!).rowGap,
  }));
  expect(geometry.gapX).toBe('16px'); expect(geometry.gapY).toBe(geometry.gapX);
  expect(new Set(geometry.rows.map(row => row.padding)).size).toBe(1);
  expect(Math.max(...geometry.rows.map(row => row.width)) - Math.min(...geometry.rows.map(row => row.width))).toBeLessThan(1);
  if (width >= 1280) expect(Math.max(...geometry.rows.map(row => row.height)) - Math.min(...geometry.rows.map(row => row.height))).toBeLessThan(1);
  await section.screenshot({ path: `test-results/training-${width}.png`, animations: 'disabled', style: 'header { visibility: hidden !important; }' });
  expect(errors).toEqual([]);
});

test('training admin edits settings and supports create, edit, order, visibility, delete and live refresh', async ({ page, context }) => {
  const state = await mockApi(page);
  const publicPage = await context.newPage();
  await mockApi(publicPage, state);
  await publicPage.goto('/');
  await signIn(page, 'course');
  await page.getByLabel('Section title', { exact: true }).fill('My Professional Development');
  await page.getByLabel('Section subtitle', { exact: true }).fill('Courses and practical training.');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(publicPage.locator('#professional-development')).toContainText('My Professional Development');
  await page.getByRole('button', { name: 'Add item' }).click();
  await page.getByLabel('Course / program title', { exact: false }).fill('Test training');
  await page.getByLabel('Provider', { exact: false }).fill('Test provider');
  await page.getByLabel('Program type', { exact: true }).selectOption('training');
  await page.getByLabel('Status', { exact: true }).selectOption('in-progress');
  await page.getByLabel('Duration', { exact: true }).fill('6 months');
  await page.getByLabel('Short description', { exact: true }).fill('Practical study.');
  await page.getByLabel('Focus areas', { exact: true }).fill('Python, Pandas');
  await page.getByLabel('Display order', { exact: true }).fill('10');
  await page.getByLabel('Show this training item', { exact: true }).uncheck();
  await expect(page.getByLabel('Curriculum URL')).toHaveCount(0);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('hidden');
  await expect(publicPage.locator('#professional-development article')).toHaveCount(3);
  let row = page.getByRole('article').filter({ hasText: 'Test training' });
  await row.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByLabel('Show this training item', { exact: true }).check();
  await page.getByLabel('Status', { exact: true }).selectOption('completed');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(publicPage.locator('#professional-development article')).toHaveCount(4);
  await expect(publicPage.locator('#professional-development article').last()).toContainText('Test training');
  // Reorder a seeded record using the existing displayOrder convention.
  row = page.getByRole('article').filter({ hasText: 'Complete Web Development' });
  await row.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByLabel('Display order', { exact: true }).fill('20');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(publicPage.locator('#professional-development article').last()).toContainText('Complete Web Development');
  await page.getByRole('button', { name: 'Hide Courses section' }).click();
  await expect(publicPage.locator('#professional-development')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show Courses section' }).click();
  await expect(publicPage.locator('#professional-development article')).toHaveCount(4);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('article').filter({ hasText: 'Test training' }).getByRole('button', { name: 'Delete Test training' }).click();
  await expect(publicPage.locator('#professional-development article')).toHaveCount(3);
  await page.reload();
  await expect(page.getByLabel('Section title', { exact: true })).toHaveValue('My Professional Development');
  expect(state.data.about.headlinePrefix).toBe(aboutData.headlinePrefix);
});

test('training cards reuse reveal motion', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  const cards = page.locator('#professional-development article');
  await expect(cards).toHaveCount(3);
  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveCSS('opacity', '1');
  }
});


test('skills and training follow the selected accent theme', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Change portfolio accent color' }).click();
  await page.getByRole('button', { name: 'Select Sky Blue theme' }).click();
  await expect(page.locator('#skills h4').first()).toHaveCSS('color', 'rgb(96, 165, 250)');
  for (const section of ['#skills', '#professional-development']) {
    await expect(page.locator(`${section} li`).first()).toHaveCSS('background-color', 'rgba(96, 165, 250, 0.12)');
  }
  await page.getByRole('button', { name: 'Select Hot Pink theme' }).click();
  for (const section of ['#skills', '#professional-development']) {
    await expect(page.locator(`${section} li`).first()).toHaveCSS('background-color', 'rgba(244, 114, 182, 0.12)');
  }
});
