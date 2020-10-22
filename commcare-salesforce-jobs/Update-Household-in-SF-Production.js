alterState(state => {
  if (dataValue('form.Household_Status')(state) == 'No') {
    return upsert(
      'Household__c',
      'CommCare_Code__c',
      fields(
        field('CommCare_Code__c', dataValue('form.case.@case_id')),
        field('Active_Household__c', false),
        field('Inactive_Reason__c', dataValue('form.Reason_for_Inactive')),
        field('Inactive_Date__c', dataValue('$.form.Date'))
      )
    )(state);
  } else {
    create(
      'Survey__c',
      fields(
        relationship(
          'Household__r',
          'CommCare_Code__c',
          dataValue('$.form.case.@case_id')
        ),
        field('Catchment__c', 'a002400000pAcOe'),
        field(
          'Treats_Drinking_Water__c',
          dataValue('$.form.Household_Information.Treats_Drinking_Water')
        ),
        field(
          'WASH_Trained__c',
          dataValue('$.form.Household_Information.WASH_Trained')
        ),
        field(
          'Rubbish_Pit__c',
          dataValue('$.form.Household_Information.Rubbish_Pit')
        ),
        field(
          'Kitchen_Garden__c',
          dataValue('$.form.Household_Information.Kitchen_Garden')
        ),
        field(
          'Improved_Cooking_Method__c',
          dataValue('$.form.Household_Information.Improved_Cooking_Method')
        ),
        field('Uses_ITNs__c', dataValue('$.form.Household_Information.ITNs')),
        field(
          'Pit_Latrine__c',
          dataValue('$.form.Household_Information.Functional_Latrine')
        ),
        field(
          'Clothesline__c',
          dataValue('$.form.Household_Information.Clothesline')
        ),
        field(
          'Drying_Rack__c',
          dataValue('$.form.Household_Information.Drying_Rack')
        ),
        field(
          'Tippy_Tap__c',
          dataValue('$.form.Household_Information.Active_Handwashing_Station')
        ),
        field(
          'Number_of_Over_5_Females__c',
          dataValue('$.form.Household_Information.Number_of_over_5_Females')
        ),
        field(
          'Number_of_Under_5_Males__c',
          dataValue('$.form.Household_Information.Number_of_Under_5_Males')
        ),
        field(
          'Number_of_Under_5_Females__c',
          dataValue('$.form.Household_Information.Number_of_Under_5_Female')
        ),
        field(
          'Number_of_Over_5_Males__c',
          dataValue('$.form.Household_Information.Number_of_Over_5_Males')
        ),
        field(
          'Family_Planning__c',
          dataValue('$.form.Household_Information.family_planning')
        ),
        field(
          'Family_Planning_Method__c',
          dataValue('$.form.Household_Information.Family_planning_method')
        ),
        field('Source__c', 1)
      )
    )(state),
      upsert(
        'Visit__c',
        'CommCare_Visit_ID__c',
        fields(
          field('CommCare_Visit_ID__c', dataValue('id')),
          field('Name', 'CHW Visit'),
          relationship(
            'Household__r',
            'CommCare_Code__c',
            dataValue('$.form.case.@case_id')
          ),
          field('Visit_UID__c', state=>{
            var hh = dataValue('form.case.@case_id')(state); 
            var date = dataValue('metadata.timeEnd')(state);
            return hh+date; 
          }),
          field('Date__c', dataValue('$.metadata.timeEnd')),
          field('CommCare_Visit_ID__c', dataValue('id')),
          field('Catchment__c', 'a002400000pAcOe'),
          field('Household_CHW__c', dataValue('form.chw')),
          field('Supervisor_Visit__c', state => {
            return dataValue('$.form.supervisor_visit')(state)
              .toString()
              .replace(/ /g, ';');
          }),
          field(
            'COC_Cycles_Distributed__c',
            dataValue('$.form.Household_Information.COC_count')
          ),
          field(
            'Female_Condoms_Distributed__c',
            dataValue('$.form.Household_Information.female_condoms_count')
          ),
          field(
            'Male_Condoms_Distributed__c',
            dataValue('$.form.Household_Information.male_condoms_count')
          ),
          field(
            'Emergency_Pills_Distributed__c',
            dataValue('$.form.Household_Information.emergency_pills_count')
          ),
          field(
            'POP_Cycles_Distributed__c',
            dataValue('$.form.Household_Information.POP_count')
          )
        )
      )(state);
  }
  return state;
});
