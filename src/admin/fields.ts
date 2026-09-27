export type Field = { key: string; label: string; type?: 'textarea' | 'email' | 'date' | 'list' | 'skills' | 'image' | 'number'; required?: boolean; hint?: string };
export type Section = { key: string; label: string; collection?: string; source?: string; fields: Field[] };
const f = (key: string, label: string, type?: Field['type'], required = false, hint?: string): Field => ({ key, label, type, required, hint });
export const sections: Section[] = [
  { key: 'navbar', source: 'intro', label: 'Navbar', fields: [
    f('firstName', 'First name', undefined, true), f('lastName', 'Last name'), f('caption', 'Role / subtitle'),
    f('navWorkLabel', 'Work tab label'), f('navInfoLabel', 'Info tab label'),
    f('navWorkHref', 'Work link'), f('navInfoHref', 'Info link'),
    f('navLinkedinLabel', 'LinkedIn label'), f('navResumeLabel', 'Resume label'),
  ] },
  { key: 'intro', label: 'Profile & hero', fields: [
    f('firstName', 'First name', undefined, true), f('lastName', 'Last name'), f('caption', 'Role / navigation subtitle'),
    f('avatar', 'Profile image', 'image'),
    f('heroHeadline', 'Hero headline'), f('heroAccentWord', 'Highlighted words'),
    f('heroSubtextWhite', 'Hero primary description', 'textarea'), f('heroSubtextGray', 'Hero secondary description', 'textarea'),
    f('footerDescription', 'Footer description', 'textarea'), f('footerNote', 'Footer closing line'),
    f('welcomeText', 'Welcome text (legacy frontend)'), f('description', 'Profile description / fallback', 'textarea'),
  ] },
  { key: 'about', label: 'About & skills', fields: [
    f('eyebrow', 'Section label'), f('headlinePrefix', 'Headline'), f('headlineAccent', 'Highlighted words'),
    f('storyLead', 'Story introduction', 'textarea'), f('description1', 'Biography, first paragraph', 'textarea'),
    f('description2', 'Biography, second paragraph', 'textarea'), f('contactCtaLabel', 'Contact CTA text'), f('skills', 'Skills', 'skills'),
    f('lottieURL', 'Animation URL (legacy frontend)'),
  ] },
  { key: 'project', collection: 'projects', label: 'Projects', fields: [
    f('title', 'Project title', undefined, true), f('category', 'Category'), f('windowUrl', 'Browser-bar display text'),
    f('shortDescription', 'Short description', 'textarea'), f('detailedDescription', 'Case study description', 'textarea'),
    f('image', 'Preview image', 'image'), f('link', 'Project URL'), f('liveUrl', 'Live demo URL (overrides project URL)'),
    f('githubLink', 'GitHub URL'), f('technologies', 'Technologies', 'list', false, 'Separate technologies with commas.'),
    f('displayOrder', 'Display order', 'number'),
  ] },
  { key: 'experience', collection: 'experiences', label: 'Experience', fields: [
    f('company', 'Company', undefined, true), f('title', 'Role', undefined, true), f('period', 'Period', undefined, true), f('description', 'Description', 'textarea'), f('displayOrder', 'Display order', 'number'),
  ] },
  { key: 'education', collection: 'education', label: 'Education', fields: [
    f('institution', 'Institution', undefined, true), f('degree', 'Degree', undefined, true), f('year', 'Year / period', undefined, true),
    f('status', 'Status'), f('description', 'Description', 'textarea'), f('displayOrder', 'Display order', 'number'),
  ] },
  { key: 'course', collection: 'courses', label: 'Courses', fields: [
    f('title', 'Course title', undefined, true), f('instructor', 'Instructor'), f('category', 'Category'), f('badge', 'Badge text'),
    f('description', 'Description', 'textarea'), f('link', 'Curriculum URL'), f('image', 'Image URL (legacy frontend)'),
  ] },
  { key: 'blog', collection: 'blogs', label: 'Articles', fields: [
    f('title', 'Article title', undefined, true), f('slug', 'Slug', undefined, true, 'Unique lowercase words separated by hyphens.'),
    f('date', 'Publication date', 'date', true), f('excerpt', 'Excerpt', 'textarea'),
    f('content', 'Article body', 'textarea', true, 'Plain text. Separate paragraphs with a blank line.'),
  ] },
  { key: 'contact', label: 'Contact & links', fields: [
    f('name', 'Display name', undefined, true), f('email', 'Email', 'email'), f('mobile', 'Phone'), f('address', 'Location'),
    f('availability', 'Availability'), f('timezone', 'Timezone'), f('heading', 'Contact heading'), f('description', 'Contact introduction', 'textarea'), f('formButtonLabel', 'Send button text'),
    f('social.github', 'GitHub URL'), f('social.linkedin', 'LinkedIn URL'), f('social.facebook', 'Facebook URL'),
    f('social.medium', 'Medium URL'), f('social.resume', 'Resume URL', undefined, false, 'Use /resume.pdf for the bundled resume, or an https:// URL.'),
    f('gender', 'Gender (legacy frontend)'), f('age', 'Age (legacy frontend)'),
  ] },
  { key: 'footer', source: 'intro', label: 'Footer', fields: [
    f('footerDescription', 'Description', 'textarea'), f('footerNote', 'Closing line'), f('footerCopyright', 'Copyright text'),
    f('footerNavigationTitle', 'Navigation heading'), f('footerSocialTitle', 'Social heading'),
    f('footerWorkLabel', 'Work link'), f('footerInfoLabel', 'Info link'), f('footerContactLabel', 'Contact link'),
  ] },
];
