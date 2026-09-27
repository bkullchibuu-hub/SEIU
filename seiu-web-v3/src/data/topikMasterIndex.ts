import { MasterDataRoot } from '../types/topikMasterTypes';
import { TOPIK_TRANSLATE_DATA } from './topikMasterDataTranslate';
import { TOPIK_SHORT_DATA } from './topikMasterDataShort';
import { TOPIK_DIALOG_DATA } from './topikMasterDataDialog';
import { TOPIK_LESSONS_DATA, TOPIK_TIPS_DATA } from './topikMasterDataLessons';
import { 
  TOPIK_GROUPS_DATA, 
  TOPIK_READS_DATA, 
  TOPIK_EXAMS_DATA, 
  TOPIK_MOCKS_DATA 
} from './topikMasterDataExams';

export const MASTER_DATA: MasterDataRoot = {
  translate: TOPIK_TRANSLATE_DATA,
  dialog: TOPIK_DIALOG_DATA,
  short: TOPIK_SHORT_DATA,
  exams: TOPIK_EXAMS_DATA,
  groups: TOPIK_GROUPS_DATA,
  reads: TOPIK_READS_DATA,
  mocks: TOPIK_MOCKS_DATA,
  lessons: TOPIK_LESSONS_DATA,
  tips: TOPIK_TIPS_DATA
};
