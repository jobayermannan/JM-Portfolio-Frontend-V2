import { test, expect, type Page } from '@playwright/test';
import { introData, aboutData, contactData, projectsData, coursesData, educationData, blogsData, experienceData } from '../src/data/content.js';

// Browser tests isolate rendering and form behavior with the actual API contract.
// The backend integration suite separately exercises persistence against MongoDB.
async function mockApi(page: Page) {
  let nextId = 100;
  const id = () => String(nextId++).padStart(24, '0');
  const rows = (items: any[]) => items.map(item => ({ ...item, _id: id() }));
  const data: any = structuredClone({
    intro: { ...introData, _id: id(), avatar: '/projects/avater.jpg', footerDescription: 'A test footer', navWorkLabel: 'Work', navInfoLabel: 'Info', navLinkedinLabel: 'LinkedIn', navResumeLabel: 'Resume', footerNavigationTitle: 'Navigation', footerSocialTitle: 'Connect & Socials', footerWorkLabel: 'Work', footerInfoLabel: 'Info / About', footerContactLabel: 'Say Hello / Contact' },
    about: { ...aboutData, _id: id(), contactCtaLabel: 'Get in touch directly below' },
    contact: { ...contactData, _id: id(), formButtonLabel: 'Send Message', social: { linkedin: 'https://linkedin.com/in/test-person', resume: '/resume.pdf', github: 'https://github.com/test-person' } },
    projects: rows(projectsData), courses: rows(coursesData), education: rows(educationData), experiences: rows(experienceData),
    blogs: rows(blogsData.map(blog => ({ ...blog, date: new Date(blog.date).toISOString().slice(0, 10) }))),
  });
  const state: any = { data, messages: [], failSave: false, failContact: false, failLoad: false, expire: false, requests: [] };
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
    if (path === 'upload-image') return reply({ success: true, data: { url: 'https://res.cloudinary.com/test/image/upload/portfolio-v2/avatar.jpg', publicId: 'portfolio-v2/avatar' } }, 201);
    if (path === 'admin-session' || path === 'admin-logout') return reply({ success: true });
    if (path === 'messages') return reply({ success: true, data: state.messages, total: state.messages.length, page: 1, pages: state.messages.length ? 1 : 0 });
    if (state.failSave) return reply({ success: false, message: 'Could not save changes.' }, 503);
    const [action, section] = path.split('-');
    const collection: any = { project: 'projects', experience: 'experiences', course: 'courses', education: 'education', blog: 'blogs' };
    if (!collection[section]) {
      data[section] = { ...data[section], ...body, _id: data[section]?._id || id() };
      return reply({ success: true, data: data[section] });
    }
    const key = collection[section];
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
  await expect(page.getByLabel('Profile image URL')).toHaveValue('https://res.cloudinary.com/test/image/upload/portfolio-v2/avatar.jpg');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  expect(state.data.intro.avatarPublicId).toBe('portfolio-v2/avatar');
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
  await signIn(page, 'about');
  await page.getByLabel('Skill 1 percentage', { exact: true }).fill('78');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Saved.');
  expect(state.data.about.skills[0].percentage).toBe(78);
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
