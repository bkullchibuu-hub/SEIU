import React, { useState } from 'react';
import { STUDENT_STORIES } from '../data/mockData';
import { Award, Star, Quote, CheckCircle2, GraduationCap, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export const SuccessStories: React.FC = () => {
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  const current = STUDENT_STORIES[activeStoryIdx];

  const nextStory = () => {
    setActiveStoryIdx((prev) => (prev + 1) % STUDENT_STORIES.length);
  };

  const prevStory = () => {
    setActiveStoryIdx((prev) => (prev - 1 + STUDENT_STORIES.length) % STUDENT_STORIES.length);
  };

  return (
    <section id="stories" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Câu Chuyện Thành Công</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading tracking-tight">
            Học Viên SEIU Chinh Phục <span className="text-red-600">Visa & Học Bổng</span>
          </h2>
          <p className="text-base text-stone-600 mt-3">
            Lắng nghe chia sẻ thực tế từ các bạn cựu học viên SEIU hiện đang học tập và làm việc tại Hàn Quốc.
          </p>
        </div>

        {/* Featured Story Showcase */}
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-sm mb-12 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Student Photo & School Badge */}
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <img
                    src={current.avatar}
                    alt={current.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 bg-red-600 text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-md whitespace-nowrap">
                  {current.visaType}
                </div>
              </div>

              <h3 className="text-xl font-bold text-stone-900 mt-5 font-heading">
                {current.name}
              </h3>
              <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>Quê quán: {current.hometown} • Bay năm {current.year}</span>
              </div>
            </div>

            {/* Story details */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-bold bg-white text-stone-800 border border-stone-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <GraduationCap className="w-4 h-4 text-red-600" />
                  {current.school}
                </span>
                <span className="text-xs font-bold bg-red-50 text-red-700 px-3 py-1 rounded-full">
                  Chuyên ngành: {current.major}
                </span>
                <span className="text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1 rounded-full">
                  🏆 {current.scholarship}
                </span>
              </div>

              {/* Quote */}
              <div className="relative pl-6 border-l-4 border-red-600 py-1">
                <Quote className="w-8 h-8 text-red-200 absolute -top-3 -left-2 -z-10" />
                <p className="text-base sm:text-lg italic font-medium text-stone-800 leading-relaxed">
                  "{current.quote}"
                </p>
              </div>

              {/* Story body */}
              <p className="text-sm text-stone-600 leading-relaxed">
                {current.story}
              </p>

              {/* Score badge */}
              <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-stone-700">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span>Thành tích tiếng Hàn: <strong className="text-red-600">{current.topikScore}</strong></span>
              </div>

            </div>

          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-stone-200/80">
            <button
              onClick={prevStory}
              className="p-2.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all shadow-xs"
              aria-label="Previous story"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5">
              {STUDENT_STORIES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStoryIdx(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    activeStoryIdx === i ? 'w-8 bg-red-600' : 'w-2.5 bg-stone-300'
                  }`}
                  aria-label={`Go to story ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextStory}
              className="p-2.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all shadow-xs"
              aria-label="Next story"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* 3 Grid mini testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STUDENT_STORIES.map((story, i) => (
            <div
              key={story.id}
              onClick={() => setActiveStoryIdx(i)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                activeStoryIdx === i
                  ? 'border-red-500 bg-red-50/40 shadow-md'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={story.avatar}
                  alt={story.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                />
                <div>
                  <div className="font-bold text-stone-900 text-sm font-heading">{story.name}</div>
                  <div className="text-xs text-red-600 font-semibold">{story.school}</div>
                </div>
              </div>
              <p className="text-xs text-stone-600 line-clamp-2 italic">
                "{story.quote}"
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
