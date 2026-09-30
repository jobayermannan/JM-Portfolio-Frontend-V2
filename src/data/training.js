// Course facts supplied by the owner. No exact dates or certificates inferred.
export const trainingTitle = 'Professional Development';
export const trainingSubtitle = 'Courses and hands-on training that shaped my software development and current Data/ML direction.';
export const trainingItems = [
  {
    title: 'Complete Web Development', provider: 'Programming Hero', type: 'course', status: 'completed',
    duration: '6 months', dateLabel: '',
    shortDescription: 'Full-stack web development fundamentals with hands-on practice across the MERN stack.',
    technologies: ['JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Full-Stack Web Development'],
    visible: true, displayOrder: 0, certificateUrl: '',
  },
  {
    title: 'Next Level Web Development', provider: 'Programming Hero', type: 'course', status: 'completed',
    duration: '6 months', dateLabel: '',
    shortDescription: 'Advanced web development covering TypeScript, React architecture, state management, Next.js and modern application development.',
    technologies: ['TypeScript', 'Advanced React', 'Redux', 'Next.js', 'GraphQL', 'Modern Web Development'],
    visible: true, displayOrder: 1, certificateUrl: '',
  },
  {
    title: 'Data Science & Machine Learning', provider: 'Forward IT', type: 'training', status: 'in-progress',
    duration: '', dateLabel: '2026 – Present',
    shortDescription: 'Hands-on training and project-based learning in Python, data analysis and classical machine learning.',
    technologies: ['Python', 'NumPy', 'Pandas', 'Seaborn', 'Data Analysis', 'EDA', 'scikit-learn', 'Regression', 'Classification', 'KNN', 'Clustering', 'Model Evaluation'],
    visible: true, displayOrder: 2, certificateUrl: '',
  },
];

// Fill only absent fields on known historical records. Explicit edits stay authoritative.
export function trainingFromCourse(item) {
  const seed = trainingItems.find(seed => seed.title === item.title?.trim() &&
    (!item.provider || item.provider === seed.provider) &&
    (!item.instructor || item.instructor.startsWith(seed.provider)));
  const fallback = seed || { provider: item.instructor || '', type: 'course', status: '',
    shortDescription: '', technologies: [], duration: '', dateLabel: '', certificateUrl: '' };
  const normalized = { ...item };
  for (const [key, value] of Object.entries(fallback)) if (normalized[key] === undefined) normalized[key] = value;
  return normalized;
}
