export type Gender = 'Male' | 'Female';

export type PrivilegeName =
  | 'Elder'
  | 'MinisterialServant'
  | 'RegularPioneer'
  | 'AuxiliarPioneer'
  | 'SpecialPioneer';

export type GroupType = 'FieldServiceGroup' | 'FieldServiceMeeting';
export type GroupRole = 'Principal' | 'Auxiliar';
export type ReminderStatus = 'Done' | 'Pending';

export type $Assignments =
  | 'microphone'
  | 'attendant'
  | 'public_speaking'
  | 'public_reading'
  | 'midweek_chairman'
  | 'midweek_speaking'
  | 'weekend_chairman'
  | 'qna_conducting'
  | 'bible_study_conducting';

export type $AssignmentsScopes =
  | 'midweek'
  | 'weekend'
  | 'public_preaching'
  | 'field_service';

export type $PersonAddress = {
  street1: string;
  street2: string;
  zipCode: string;
  state: string;
  country: string;
};
