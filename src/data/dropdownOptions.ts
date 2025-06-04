// Static dropdown options for fields that don't come from database
interface StaticDropdownOption {
  value: string;
  label: string;
}

export const questionDifficulties: StaticDropdownOption[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'expert', label: 'Expert' },
];
