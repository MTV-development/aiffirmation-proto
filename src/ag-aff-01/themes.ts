export type AffirmationTheme = {
  id: string;
  label: string;
  description: string;
};

export const affirmationThemes: AffirmationTheme[] = [
  { id: 'self-confidence', label: 'Self-confidence', description: 'Believing in yourself and your abilities' },
  { id: 'anxiety-relief', label: 'Anxiety relief', description: 'Calming thoughts and stress reduction' },
  { id: 'gratitude', label: 'Gratitude', description: 'Appreciation for life and what you have' },
  { id: 'motivation', label: 'Motivation', description: 'Drive to achieve goals and take action' },
  { id: 'self-love', label: 'Self-love', description: 'Acceptance and care for yourself' },
  { id: 'relationships', label: 'Relationships', description: 'Connection with others and social bonds' },
  { id: 'work-ethic', label: 'Work ethic', description: 'Professional growth and productivity' },
  { id: 'health-wellness', label: 'Health & wellness', description: 'Physical and mental well-being' },
  { id: 'creativity', label: 'Creativity', description: 'Artistic expression and innovation' },
  { id: 'financial-abundance', label: 'Financial abundance', description: 'Prosperity and wealth mindset' },
];
