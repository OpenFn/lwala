//Job to integrate CommCare 'Feedback' form from the Supervision App

upsert(
  'Supervision_Forms__c',
  'CommCare_Form_ID__c',
  fields(
  field('CommCare_Form_ID__c', dataValue('id')),
    relationship('RecordType', 'Name', 'Feedback Form'),
    field('Supervisor_Name__c', dataValue('form.prologue.supervisor_sfid')),
    field('CHW_Name__c', dataValue('form.prologue.chw_sfid')),
      relationship(
      'Village__r',
      'CommCare_User_ID__c',
      dataValue('form.prologue.chw_village')
    ),
    relationship('Catchment__r', 
    'Name',
    dataValue('form.prologue.catchment')
    ),
    field('Form_Date__c',dataValue('form.Date')),
    field('Strengths__c', dataValue('form.chw_perspectives_and_reflections.chw_strengths')),
    field('Weaknesses__c', dataValue('form.chw_perspectives_and_reflections.chw_improvement_areas')), 
    field('Challenges__c', dataValue('form.chw_perspectives_and_reflections.chw_challenges')),
    field('Solutions__c', dataValue('form.chw_perspectives_and_reflections.chw_improvement_areas')),
    field('of_Household_Visit_As_Expected__c', dataValue('form.supervision_dashboard_feedback.hh_visits_check')),
    field('of_Household_Visit_Explanation__c',dataValue('form.supervision_dashboard_feedback.hh_visits_explanation')),
    field('of_Priority_Clients_as_Expected__c', dataValue('form.supervision_dashboard_feedback.priority_hh_visits_check')),
    field('of_Priority_Clients_Explanation__c',dataValue('form.supervision_dashboard_feedback.priority_hh_visits_explanation')),
    field('Feedback_on_Indicators__c',dataValue('form.supervision_dashboard_feedback.chw_sd_feedback')),
    field('CHW_Strengths__c',dataValue('form.supervisor_perspectives_and_reflections.chw_strengths_supervisor')),
    field('CHW_Areas_for_Improvement__c',dataValue('form.supervisor_perspectives_and_reflections.chw_improvement_areas_supervisor')),
    field('CHW_Immediate_Solutions__c',dataValue('form.supervisor_perspectives_and_reflections.chw_solutions_supervisor')),
    field('Other_Recommendations__c',dataValue('form.supervisor_perspectives_and_reflections.chw_recommendation_other_supervisor')),
    )
);    
