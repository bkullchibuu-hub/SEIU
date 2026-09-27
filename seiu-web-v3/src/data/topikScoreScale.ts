/** Thang điểm chính thức đang dùng cho đề TOPIK I 70 câu tại SEIU. */
export const TOPIK_QUESTION_POINTS: Record<number, number> = {
  1: 4, 2: 4, 3: 3, 4: 3, 5: 4, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
  11: 3, 12: 3, 13: 4, 14: 3, 15: 4, 16: 4, 17: 3, 18: 3, 19: 3, 20: 3,
  21: 3, 22: 3, 23: 3, 24: 3, 25: 3, 26: 4, 27: 3, 28: 4, 29: 3, 30: 4,
  31: 2, 32: 2, 33: 2, 34: 2, 35: 2, 36: 2, 37: 3, 38: 3, 39: 2, 40: 3,
  41: 3, 42: 3, 43: 3, 44: 2, 45: 3, 46: 3, 47: 3, 48: 2, 49: 2, 50: 2,
  51: 3, 52: 2, 53: 2, 54: 3, 55: 2, 56: 3, 57: 3, 58: 2, 59: 2, 60: 3,
  61: 2, 62: 2, 63: 2, 64: 3, 65: 2, 66: 3, 67: 3, 68: 3, 69: 3, 70: 3,
};

export const getTopikQuestionPoints = (questionNo?: number): number =>
  questionNo && TOPIK_QUESTION_POINTS[questionNo] ? TOPIK_QUESTION_POINTS[questionNo] : 1;
