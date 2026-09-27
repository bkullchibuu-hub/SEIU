const PICTURE_SET_COUNT = 9;

/**
 * Ảnh câu 15–16 đã được cắt từ đề gốc: chỉ giữ bốn tranh lựa chọn,
 * không giữ lời thoại, giải thích hoặc dấu hiệu đáp án.
 */
export const getTopikPictureOptions = (setLabel?: string, questionLabel?: string): string[] | undefined => {
  const setNumber = Number(setLabel?.match(/\d+/)?.[0]);
  const questionNumber = Number(questionLabel?.match(/\d+/)?.[0]);

  if (!Number.isInteger(setNumber) || setNumber < 1 || setNumber > PICTURE_SET_COUNT) return undefined;
  if (questionNumber !== 15 && questionNumber !== 16) return undefined;

  return Array.from(
    { length: 4 },
    (_, optionIndex) => `/topik/15-16/set-${setNumber}-q${questionNumber}-option-${optionIndex}.webp`,
  );
};
