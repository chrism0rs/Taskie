export const SUBJECTS = [
  { value: "math", label: "Mathematics", icon: "calculator" },
  { value: "science", label: "Science", icon: "flask" },
  { value: "history", label: "History", icon: "book" },
  { value: "art", label: "Art", icon: "palette" },
  { value: "literature", label: "Literature", icon: "book-open" },
  { value: "physics", label: "Physics", icon: "atom" },
  { value: "chemistry", label: "Chemistry", icon: "flask" },
  { value: "biology", label: "Biology", icon: "leaf" },
  { value: "geography", label: "Geography", icon: "globe" },
  { value: "music", label: "Music", icon: "music" },
];

export const DIFFICULTY_LEVELS = [
  { value: 1, label: "Very Easy", color: "bg-green-200" },
  { value: 2, label: "Easy", color: "bg-blue-200" },
  { value: 3, label: "Medium", color: "bg-yellow-200" },
  { value: 4, label: "Hard", color: "bg-orange-200" },
  { value: 5, label: "Very Hard", color: "bg-red-200" },
];

export const WELLNESS_REMINDERS = {
  WATER: {
    title: "Time for water! 💧",
    message: "Stay hydrated to keep your mind sharp",
    icon: "droplet",
    interval: 30 * 60 * 1000, // 30 minutes
  },
  STRETCH: {
    title: "Stretch break! 🧘‍♀️",
    message: "Take a moment to stretch and relax your muscles",
    icon: "activity",
    interval: 30 * 60 * 1000, // 30 minutes
  },
  MOTIVATION: {
    title: "You're doing great! ✨",
    message: "Keep up the excellent work, you're making amazing progress!",
    icon: "heart",
    interval: 60 * 60 * 1000, // 1 hour
  },
};

export const MOTIVATIONAL_QUOTES = [
  "You're doing amazing! Keep going! 🌟",
  "Every task completed is a step closer to your goals! 💪",
  "Your dedication is truly inspiring! ✨",
  "You've got this! One task at a time! 🎯",
  "Progress, not perfection! You're growing! 🌱",
  "Your hard work is paying off! 🎉",
  "Believe in yourself - you're capable of amazing things! 💝",
  "Small steps lead to big achievements! 🚀",
];

export const POINT_MULTIPLIERS = {
  1: 1,    // Very Easy
  2: 1.2,  // Easy
  3: 1.5,  // Medium
  4: 2,    // Hard
  5: 2.5,  // Very Hard
};

export const BASE_POINTS = 50;
