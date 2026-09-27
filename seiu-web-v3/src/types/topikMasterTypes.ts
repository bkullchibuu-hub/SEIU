/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MasterTranslationItem {
  n: number;
  g: string;
  m: string;
  vi: string;
  hint: string;
  ko: string;
}

export interface MasterDialogLine {
  sp: string;
  txt: string;
  tts: string;
}

export interface MasterQuestion {
  q: string;
  opts: string[];
  ans: number | string;
  no?: number;
  /** Bốn tranh lựa chọn của câu nghe 15–16; không chứa lời thoại hay đáp án. */
  optionImages?: string[];
}

export interface MasterDialogItem {
  de: string;
  cau: string;
  grp: string;
  lines: MasterDialogLine[];
  warn: boolean;
  qs: MasterQuestion[];
  meta: [string, string][];
}

export interface MasterShortItem {
  de: string;
  cau: string;
  grp: string;
  lines: MasterDialogLine[];
  warn: boolean;
  qs: MasterQuestion[];
  meta: [string, string][];
}

export interface MasterExamBlock {
  label: string;
  de?: string;
  grp?: string;
  lines?: MasterDialogLine[];
  text?: string;
  warn?: boolean;
  qs: MasterQuestion[];
  explain?: [string, string][];
}

export interface MasterExam {
  id: string;
  kind: 'de' | 'grp' | 'read' | 'mock';
  de?: string;
  title: string;
  sub: string;
  n: number;
  blocks: MasterExamBlock[];
  missing?: string[];
}

export interface MasterLesson {
  n: number;
  phase: string;
  title: string;
  goal: string;
  mins: number;
  learn: string[];
  practice: [string, string][];
  target: string;
  vocab: [string, string][];
  gram: [string, string, string?][];
}

export interface MasterTip {
  grp: string;
  title: string;
  pts: string;
  lv: string;
  listen: string;
  steps: string[];
  traps: [string, string][];
}

export interface MasterDataRoot {
  translate: MasterTranslationItem[];
  dialog: MasterDialogItem[];
  short: MasterShortItem[];
  exams: MasterExam[];
  groups: MasterExam[];
  reads: MasterExam[];
  mocks: MasterExam[];
  lessons: MasterLesson[];
  tips: MasterTip[];
}
