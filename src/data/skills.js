// Supported by the résumé, current code, stated Data/ML work, and confirmed PostgreSQL/Docker practice.
export const skillsTitle = 'Skills & Capabilities';
export const skillsSubtitle = 'A full-stack foundation with a growing focus on backend development, data analysis, and machine learning.';
const category = (name, names, order) => ({
  name, description: '', visible: true, order,
  skills: names.map((name, order) => ({ name, visible: true, order, icon: '' })),
});
export const suggestedSkillCategories = [
  category('Languages', ['JavaScript', 'TypeScript', 'Python'], 0),
  category('Frontend', ['HTML5', 'CSS3', 'React', 'Next.js', 'Tailwind CSS', 'ShadCN', 'Redux Toolkit', 'RTK Query', 'Framer Motion'], 1),
  category('Backend', ['Node.js', 'Express.js', 'REST APIs', 'Authentication & Authorization', 'JWT'], 2),
  category('Database', ['MongoDB', 'Mongoose', 'PostgreSQL'], 3),
  category('Data & Machine Learning', ['NumPy', 'Pandas', 'Seaborn', 'scikit-learn', 'Data Cleaning & Transformation', 'Exploratory Data Analysis', 'Regression', 'Classification', 'K-Nearest Neighbors (KNN)', 'Clustering', 'Model Evaluation'], 4),
  category('Tools & Development', ['Git', 'GitHub', 'Postman', 'VS Code', 'Docker', 'Figma'], 5),
  category('Engineering', ['Debugging', 'Problem Solving', 'API Integration', 'Responsive Development'], 6),
];

export const ordered = items => [...(items || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

// Allow-list active fields so obsolete ratings and references cannot be sent
// back when editing older documents. Preserve IDs, ordering and visibility.
export function cleanSkillCategories(categories = []) {
  return ordered(categories).map((category, order) => ({
    ...(category._id ? { _id: category._id } : {}), name: category.name,
    description: category.description || '', visible: category.visible !== false, order,
    skills: ordered(category.skills).map((skill, order) => ({
      ...(skill._id ? { _id: skill._id } : {}), name: skill.name,
      visible: skill.visible !== false, order, icon: skill.icon || '',
    })),
  }));
}

// Saved content is authoritative, including an intentionally empty section.
export function categoriesFromAbout(about = {}) {
  if (Array.isArray(about.skillCategories)) return cleanSkillCategories(about.skillCategories);
  const categories = structuredClone(suggestedSkillCategories);
  const aliases = new Set(['html & css', 'tailwind', 'react.js', 'redux', 'redux / rtk query', 'motion', 'git / github', 'debugging & problem solving', 'responsive interfaces', 'classification fundamentals', 'k-nearest neighbors', 'model evaluation & ml workflows']);
  const known = new Set(categories.flatMap(category => category.skills.map(skill => skill.name.toLowerCase())));
  const extra = (about.skills || []).filter(skill => skill.name && !known.has(skill.name.toLowerCase()) && !aliases.has(skill.name.toLowerCase()));
  if (extra.length) categories.push({ ...category('Additional experience', extra.map(skill => skill.name), categories.length), visible: false });
  return categories;
}
