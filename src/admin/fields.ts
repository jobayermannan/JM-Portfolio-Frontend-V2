export type Field = { key: string; label: string; type?: 'textarea' | 'email' | 'date' | 'list' | 'skills' | 'image' | 'number' | 'checkbox' | 'select'; required?: boolean; hint?: string; options?: string[]; defaultValue?: boolean };
export type Section = { key: string; label: string; collection?: string; source?: string; recordKind?: string; visibilityKey?: string; fields: Field[] };
const f = (key: string, label: string, type?: Field['type'], required = false, hint?: string): Field => ({ key, label, type, required, hint });
const toggle = (key: string, label: string, defaultValue = true): Field => ({ key, label, type: 'checkbox', defaultValue });
export const sections: Section[] = [
  { key: 'visibility', source: 'about', label: 'Section visibility', fields: [
    toggle('navbarSectionVisible', 'Show Navbar'),
    toggle('heroSectionVisible', 'Show Hero'),
    toggle('projectsSectionVisible', 'Show Projects'),
    toggle('aboutSectionVisible', 'Show About'),
    toggle('experienceSectionVisible', 'Show Experience'),
    toggle('educationSectionVisible', 'Show Education'),
    toggle('skillsSectionVisible', 'Show Skills'),
    toggle('coursesSectionVisible', 'Show Courses'),
    toggle('articlesSectionVisible', 'Show Technical Articles', false),
    toggle('dataMlSectionVisible', 'Show Data & ML'),
    toggle('contactSectionVisible', 'Show Contact'),
    toggle('footerSectionVisible', 'Show Footer'),
    f('dataMlTitle', 'Data & ML heading'), f('dataMlSubtitle', 'Data & ML subtitle', 'textarea'),
  ] },
  { key: 'navbar', source: 'intro', label: 'Navbar', visibilityKey: 'navbarSectionVisible', fields: [
    f('firstName', 'First name', undefined, true), f('lastName', 'Last name'), f('caption', 'Role / subtitle'),
    f('navWorkLabel', 'Work tab label'), f('navInfoLabel', 'Info tab label'),
    f('navWorkHref', 'Work link'), f('navInfoHref', 'Info link'),
    f('navLinkedinLabel', 'LinkedIn label'), f('navResumeLabel', 'Resume label'),
  ] },
  { key: 'intro', label: 'Profile & hero', visibilityKey: 'heroSectionVisible', fields: [
    f('firstName', 'First name', undefined, true), f('lastName', 'Last name'), f('caption', 'Role / navigation subtitle'),
    f('avatar', 'Profile image', 'image'),
    f('heroHeadline', 'Hero headline'), f('heroAccentWord', 'Highlighted words'),
    f('heroSubtextWhite', 'Hero primary description', 'textarea'), f('heroSubtextGray', 'Hero secondary description', 'textarea'),
    f('footerDescription', 'Footer description', 'textarea'), f('footerNote', 'Footer closing line'),
    f('welcomeText', 'Welcome text (legacy frontend)'), f('description', 'Profile description / fallback', 'textarea'),
  ] },
  { key: 'about', label: 'About', visibilityKey: 'aboutSectionVisible', fields: [
    f('eyebrow', 'Section label'), f('headlinePrefix', 'Headline'), f('headlineAccent', 'Highlighted words'),
    f('storyLead', 'Story introduction', 'textarea'), f('description1', 'Biography, first paragraph', 'textarea'),
    f('description2', 'Biography, second paragraph', 'textarea'), f('contactCtaLabel', 'Contact CTA text'),
    f('lottieURL', 'Animation URL (legacy frontend)'),
  ] },
  { key: 'skills', source: 'about', label: 'Skills', visibilityKey: 'skillsSectionVisible', fields: [
    f('skillsTitle', 'Skills heading'), f('skillsSubtitle', 'Skills introduction', 'textarea'),
    f('skillCategories', 'Skill categories', 'skills'),
  ] },
  { key: 'project', collection: 'projects', label: 'Projects', visibilityKey: 'projectsSectionVisible', fields: [
    f('title', 'Project title', undefined, true), f('category', 'Category'), f('windowUrl', 'Browser-bar display text'),
    f('shortDescription', 'Short description', 'textarea'), f('detailedDescription', 'Case study description', 'textarea'),
    f('image', 'Preview image', 'image'), f('link', 'Project URL'), f('liveUrl', 'Live demo URL (overrides project URL)'),
    f('githubLink', 'GitHub URL'), f('technologies', 'Technologies', 'list', false, 'Separate technologies with commas.'),
    f('displayOrder', 'Display order', 'number'),
  ] },
  { key: 'data-ml', source: 'project', recordKind: 'data-ml', collection: 'dataMlProjects', label: 'Data & ML projects', visibilityKey: 'dataMlSectionVisible', fields: [
    f('title', 'Project title', undefined, true), f('shortDescription', 'Short description', 'textarea', true),
    { ...f('category', 'Type', 'select', true), options: ['Data Analysis', 'Machine Learning', 'Data + ML'] },
    toggle('visible', 'Show this project'), toggle('featured', 'Featured project', false),
    f('problem', 'Problem', 'textarea'), f('datasetSource', 'Dataset / source', 'textarea'),
    f('technologies', 'Tools / technologies', 'list', false, 'Separate tools with commas.'),
    f('techniques', 'Techniques / models', 'list', false, 'Separate techniques with commas.'),
    f('workflow', 'Key features / workflow', 'textarea'), f('result', 'Result / findings', 'textarea'),
    f('limitations', 'Limitations', 'textarea'),
    f('githubLink', 'GitHub URL'), f('notebookUrl', 'Notebook URL'), f('liveUrl', 'Live demo URL'),
    f('image', 'Thumbnail', 'image'), f('displayOrder', 'Display order', 'number'),
    toggle('fieldVisibility.problem', 'Show problem'), toggle('fieldVisibility.datasetSource', 'Show dataset / source'),
    toggle('fieldVisibility.technologies', 'Show tools'), toggle('fieldVisibility.techniques', 'Show techniques'),
    toggle('fieldVisibility.workflow', 'Show workflow'), toggle('fieldVisibility.result', 'Show findings'),
    toggle('fieldVisibility.limitations', 'Show limitations'), toggle('fieldVisibility.githubLink', 'Show GitHub link'),
    toggle('fieldVisibility.notebookUrl', 'Show notebook link'), toggle('fieldVisibility.liveUrl', 'Show live demo link'),
    toggle('fieldVisibility.image', 'Show thumbnail'),
  ] },
  { key: 'experience', collection: 'experiences', label: 'Experience', visibilityKey: 'experienceSectionVisible', fields: [
    f('company', 'Company', undefined, true), f('title', 'Role', undefined, true), f('period', 'Period', undefined, true), f('description', 'Description', 'textarea'), f('displayOrder', 'Display order', 'number'),
  ] },
  { key: 'education', collection: 'education', label: 'Education', visibilityKey: 'educationSectionVisible', fields: [
    f('institution', 'Institution', undefined, true), f('degree', 'Degree', undefined, true), f('year', 'Year / period', undefined, true),
    f('status', 'Status'), f('description', 'Description', 'textarea'), f('displayOrder', 'Display order', 'number'),
  ] },
  { key: 'course', collection: 'courses', label: 'Courses', visibilityKey: 'coursesSectionVisible', fields: [
    f('title', 'Course / program title', undefined, true), f('provider', 'Provider', undefined, true),
    { ...f('type', 'Program type', 'select', true), options: ['course', 'training'] },
    { ...f('status', 'Status', 'select', true), options: ['completed', 'in-progress'] },
    f('duration', 'Duration', undefined, false, 'For example, 6 months. Leave blank if unknown.'),
    f('dateLabel', 'Dates / year range', undefined, false, 'Use only known dates, e.g. 2026 – Present. Exact dates are optional.'),
    f('shortDescription', 'Short description', 'textarea', false, 'One concise sentence, up to 300 characters.'),
    f('technologies', 'Focus areas', 'list', false, 'Separate technologies and focus areas with commas.'),
    f('displayOrder', 'Display order', 'number', false, 'Lower numbers appear first. Use 0, 1, 2 to reorder items.'),
    toggle('visible', 'Show this training item'),
    f('certificateUrl', 'Certificate / evidence URL', undefined, false, 'Optional. Add only an actual certificate or evidence link; never a curriculum URL.'),
  ] },
  { key: 'blog', collection: 'blogs', label: 'Articles', visibilityKey: 'articlesSectionVisible', fields: [
    f('title', 'Article title', undefined, true), f('slug', 'Slug', undefined, true, 'Unique lowercase words separated by hyphens.'),
    f('date', 'Publication date', 'date', true), f('excerpt', 'Excerpt', 'textarea'),
    f('content', 'Article body', 'textarea', true, 'Plain text. Separate paragraphs with a blank line.'),
  ] },
  { key: 'contact', label: 'Contact & links', visibilityKey: 'contactSectionVisible', fields: [
    f('name', 'Display name', undefined, true), f('email', 'Email', 'email'), f('mobile', 'Phone'), f('address', 'Location'),
    f('availability', 'Availability'), f('timezone', 'Timezone'), f('heading', 'Contact heading'), f('description', 'Contact introduction', 'textarea'), f('formButtonLabel', 'Send button text'),
    f('social.github', 'GitHub URL'), f('social.linkedin', 'LinkedIn URL'), f('social.facebook', 'Facebook URL'),
    f('social.medium', 'Medium URL'), f('social.resume', 'Resume URL', undefined, false, 'Use /resume.pdf for the bundled resume, or an https:// URL.'),
    f('gender', 'Gender (legacy frontend)'), f('age', 'Age (legacy frontend)'),
  ] },
  { key: 'footer', source: 'intro', label: 'Footer', visibilityKey: 'footerSectionVisible', fields: [
    f('footerDescription', 'Description', 'textarea'), f('footerNote', 'Closing line'), f('footerCopyright', 'Copyright text'),
    f('footerNavigationTitle', 'Navigation heading'), f('footerSocialTitle', 'Social heading'),
    f('footerWorkLabel', 'Work link'), f('footerInfoLabel', 'Info link'), f('footerContactLabel', 'Contact link'),
  ] },
];

export const courseSectionSettings: Section = { key: 'course-settings', source: 'about', label: 'Training section settings', fields: [
  f('coursesTitle', 'Section title'), f('coursesSubtitle', 'Section subtitle', 'textarea'),
] };
