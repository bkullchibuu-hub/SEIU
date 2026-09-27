import React, { useEffect, useRef } from 'react';

interface InteractiveContentRendererProps {
  htmlContent: string;
  className?: string;
}

export const InteractiveContentRenderer: React.FC<InteractiveContentRendererProps> = ({
  htmlContent,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Quiz / Multiple Choice Exercises
    const quizWrappers = container.querySelectorAll('.seiu-interactive-quiz');
    quizWrappers.forEach((quizElem) => {
      const quiz = quizElem as HTMLElement;
      const options = quiz.querySelectorAll('.seiu-quiz-option');
      const feedback = quiz.querySelector('.seiu-quiz-feedback') as HTMLElement | null;
      const explanation = quiz.querySelector('.seiu-quiz-explanation') as HTMLElement | null;

      options.forEach((btnElem) => {
        const btn = btnElem as HTMLButtonElement;
        btn.onclick = () => {
          const isCorrect = btn.getAttribute('data-correct') === 'true';
          
          // Reset other buttons
          options.forEach((bElem) => {
            const b = bElem as HTMLButtonElement;
            b.classList.remove('bg-emerald-100', 'border-emerald-500', 'text-emerald-900', 'bg-red-100', 'border-red-500', 'text-red-900');
            b.classList.add('bg-white', 'border-stone-200');
          });

          if (isCorrect) {
            btn.classList.remove('bg-white', 'border-stone-200');
            btn.classList.add('bg-emerald-50', 'border-emerald-500', 'text-emerald-800', 'font-bold');
            if (feedback) {
              feedback.innerHTML = `
                <div class="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                  <span class="text-base">🎉</span>
                  <div>
                    <div class="font-bold text-emerald-900">Chính xác! Hoan hô bạn! (정답입니다!)</div>
                    <div class="text-emerald-700 mt-0.5">${explanation?.getAttribute('data-text') || 'Bạn đã chọn đúng đáp án chính xác theo ngữ pháp tiếng Hàn.'}</div>
                  </div>
                </div>
              `;
              feedback.classList.remove('hidden');
            }
          } else {
            btn.classList.remove('bg-white', 'border-stone-200');
            btn.classList.add('bg-red-50', 'border-red-500', 'text-red-800', 'font-semibold');
            if (feedback) {
              feedback.innerHTML = `
                <div class="p-3 bg-red-50 border border-red-300 rounded-xl text-red-800 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                  <span class="text-base">❌</span>
                  <div>
                    <div class="font-bold text-red-900">Chưa đúng rồi! Hãy thử lại nhé! (다시 해보세요!)</div>
                    <div class="text-red-700 mt-0.5">Gợi ý: Hãy chú ý âm đuôi có phụ âm dưới (patchim) hay không nhé.</div>
                  </div>
                </div>
              `;
              feedback.classList.remove('hidden');
            }
          }
        };
      });
    });

    // 2. Setup Interactive Flashcards (Click to flip)
    const flashcards = container.querySelectorAll('.seiu-interactive-flashcard');
    flashcards.forEach((cardElem) => {
      const card = cardElem as HTMLElement;
      card.onclick = () => {
        const backSide = card.querySelector('.seiu-flashcard-back') as HTMLElement | null;
        const frontSide = card.querySelector('.seiu-flashcard-front') as HTMLElement | null;
        if (backSide && frontSide) {
          if (backSide.classList.contains('hidden')) {
            backSide.classList.remove('hidden');
            frontSide.classList.add('hidden');
          } else {
            backSide.classList.add('hidden');
            frontSide.classList.remove('hidden');
          }
        }
      };
    });

    // 3. Setup Fill-in-the-blank Exercise
    const fillExercises = container.querySelectorAll('.seiu-fill-exercise');
    fillExercises.forEach((boxElem) => {
      const box = boxElem as HTMLElement;
      const checkBtn = box.querySelector('.seiu-fill-check-btn') as HTMLButtonElement | null;
      const input = box.querySelector('.seiu-fill-input') as HTMLInputElement | null;
      const resultBox = box.querySelector('.seiu-fill-result') as HTMLElement | null;
      const answer = box.getAttribute('data-answer')?.toLowerCase().trim();

      if (checkBtn && input && resultBox) {
        checkBtn.onclick = () => {
          const userVal = input.value.toLowerCase().trim();
          if (!userVal) {
            resultBox.innerHTML = '<span class="text-amber-600 text-xs font-bold">Vui lòng nhập câu trả lời trước khi kiểm tra!</span>';
            resultBox.classList.remove('hidden');
            return;
          }
          if (userVal === answer) {
            resultBox.innerHTML = `
              <div class="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs font-bold flex items-center gap-2">
                <span>✅ Chính xác 100%! Đáp án là: "${box.getAttribute('data-answer')}"</span>
              </div>
            `;
          } else {
            resultBox.innerHTML = `
              <div class="p-2.5 bg-red-50 border border-red-300 rounded-lg text-red-800 text-xs font-medium flex items-center justify-between gap-2">
                <span>❌ Chưa đúng! Đáp án đúng là: <strong>"${box.getAttribute('data-answer')}"</strong></span>
              </div>
            `;
          }
          resultBox.classList.remove('hidden');
        };
      }
    });

    // 4. Execute any inline scripts in custom HTML
    const scripts = container.querySelectorAll('script');
    scripts.forEach((oldScriptElem) => {
      const oldScript = oldScriptElem as HTMLScriptElement;
      const newScript = document.createElement('script');
      for (let i = 0; i < oldScript.attributes.length; i++) {
        const attr = oldScript.attributes[i];
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

  }, [htmlContent]);

  return (
    <div
      ref={containerRef}
      className={`prose prose-stone max-w-none text-stone-800 leading-relaxed text-base space-y-4 article-rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
