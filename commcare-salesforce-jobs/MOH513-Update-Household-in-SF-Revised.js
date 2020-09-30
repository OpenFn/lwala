// REVISED Form - To replace old Update HH
alterState(state => {
  const deaths = state.data.form.household_deaths ? state.data.form.household_deaths.deaths : '';
  if (deaths !== '' &&!Array.isArray(deaths)) {
    state.data.form.household_deaths.deaths = [deaths];
  }

  const supervisorMap = {
    community_health_nurse: 'Community Health Nurse',
    chw_supervisor: 'CHW Supervisor',
    chewschas: 'CHEWs/CHAs',
    other: 'Other',
    none: 'None',
  };

  return { ...state, supervisorMap };
});
upsert(
  'Household__c',
  'CommCare_Code__c',
  fields(
    field('CommCare_Code__c', dataValue('form.case.@case_id')),
    field('MOH_household_code__c', state => {
      var moh = dataValue('form.Household_Information.moh_code')(state);
      var mohLinked = dataValue('form.MOH_household_code_linked')(state);
      return moh ? moh : mohLinked;
    }),
    field('Active_Household__c', state => {
      var status = dataValue('form.Household_Status')(state);
      if(status==='No'){
        status = false;
      } else if(status==='Yes'){
        status = true;
      }
      return status; 
    }),
    field('Inactive_Reason__c', state => {
      var reason = dataValue('form.Reason_for_Inactive')(state);
      return reason !== undefined ? reason : null;
    }),
    field('Source__c', 1),
    field('Household_village__c', dataValue('form.village')), 
    field(
      'Access_to_safe_water__c',
      dataValue('form.Household_Information.Safe_Water')
    ),
    field(
      'Treats_Drinking_Water__c',
      dataValue('form.Household_Information.Treats_Drinking_Water')
    ),
    field(
      'Tippy_Tap__c',
      dataValue('form.Household_Information.Active_Handwashing_Station')
    ),
    field(
      'Pit_Latrine__c',
      dataValue('form.Household_Information.Functional_Latrine')
    ),
    field(
      'Rubbish_Pit__c',
      dataValue('form.Household_Information.Rubbish_Pit')
    ),
    field(
      'Drying_Rack__c',
      dataValue('form.Household_Information.Drying_Rack')
    ),
    field(
      'Kitchen_Garden__c',
      dataValue('form.Household_Information.Kitchen_Garden')
    ),
    field(
      'Cookstove__c',
      dataValue('form.Household_Information.Improved_Cooking_Method')
    ),
    field('Clothe__c', dataValue('form.Household_Information.Clothesline')),
    field(
      'WASH_Trained__c',
      dataValue('form.Household_Information.WASH_Trained')
    ),
    field('Uses_ITNs__c', dataValue('form.Household_Information.ITNs')),
    //field("Family_planning__c", dataValue("form.Household_Information.family_planning")), // new mapping
    //field("Family_planning_method__c", dataValue("form.Household_Information.Family_planning_method")), // new mapping
    field('Deaths_in_the_last_6_months__c', state => {
      var deaths = dataValue('form.household_deaths.deaths_in_past_6_months')(
        state
      );
      return deaths && deaths > 0 ? 'Yes' : 'No';
    }),
    field(
      'Total_household_people__c',
      dataValue('form.Total_Number_of_Members')
    ),
    field('Supervisor_Visit__c', state =>
      state.data.form.supervisor_visit
        ? state.supervisorMap[state.data.form.supervisor_visit]
        : null
    )
  )
),
  upsert(
    'Visit__c',
    'CommCare_Visit_ID__c',
    fields(
      field('CommCare_Visit_ID__c', dataValue('id')),
      relationship(
        'Household__r',
        'CommCare_Code__c',
        dataValue('form.case.@case_id')
      ),
      field('Date__c', dataValue('form.metadata.timeEnd')),
      //field("Household_CHW__c", "a031x000002S9lm"), //Hardcoded for sandbox testing
      field('Household_CHW__c', dataValue('form.chw')),
      field('Name', 'CHW Visit'),
      field('Supervisor_Visit__c', state =>
        state.data.form.supervisor_visit
          ? state.supervisorMap[state.data.form.supervisor_visit]
          : null
      )
    )
  ),
  //New logic to insert child Person records if person is marked as deceased in HH form
  each(
    merge(
      dataPath('$.form.household_deaths.deaths[*]'),
      fields(
        field('caseId', dataValue('form.case.@case_id')),
        field('catchment', dataValue('form.catchment')),
        field('Date', dataValue('form.Date'))
      )
    ),
    upsertIf(
      state.data.form.household_deaths && state.data.form.household_deaths.deaths_in_past_6_months > 0, //only insert deceased Person if deaths
      'Person__c',
      'CommCare_ID__c',
      fields(
        field('CommCare_ID__c', state => {
          var age = dataValue('age_dead')(state);
          return `${state.data.caseId}${age}`;
        }),
        field('CommCare_HH_Code__c', dataValue('caseId')),
        relationship('RecordType', 'Name', state => {
          var age = dataValue('age_dead')(state);
          var gender = dataValue('gender_dead')(state);
          var rt = '';
          if (age < 5) {
            rt = 'Child';
          } else if (age < 18) {
            rt = 'Youth';
          } else if (gender === 'female') {
            rt = 'Female Adult';
          } else {
            rt = 'Male Adult';
          }
          return rt;
        }),
        field('Name', 'Deceased Person'),
        field('Source__c', true),
        relationship('Catchment__r', 'Name', dataValue('catchment')),
        field('Client_Status__c', 'Deceased'),
        field('Dead_age__c', dataValue('age_dead')),
        field('Cause_of_Death__c', state => {
          var cause = dataValue('cause_of_death_dead')(state);
          return cause !== undefined
            ? cause.toString().replace(/_/g, ' ')
            : null;
        }),
        field('Verbal_autopsy__c', dataValue('verbal_autopsy')),
        field('Client_Status__c', 'Deceased'),
        field('Active_in_Thrive_Thru_5__c', 'No'),
        field('Active_in_HAWI__c', 'No'),
        field('Active_TT5_Mother__c', 'No'),
        field('TT5_Mother_Registrant__c', 'No'),
        field('Date_of_Death__c', dataValue('Date')),
        field('Inactive_Date__c', dataValue('Date'))
      )
    )
  );
