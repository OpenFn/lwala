fn(state => {
  const deaths = state.data.form.household_deaths
    ? state.data.form.household_deaths.deaths
    : '';
  if (deaths !== '' && !Array.isArray(deaths)) {
    state.data.form.household_deaths.deaths = [deaths];
  }

  const supervisorMap = {
    community_health_nurse: 'Community Health Nurse',
    chw_supervisor: 'CHW Supervisor',
    chewschas: 'CHEWs/CHAs',
    other: 'Other',
    none: 'None',
  };

  const insuranceMap = {
    nhif: 'NHIF',
    Linda_mama: 'Linda mama',
    other_please_specify_if_active: 'Other',
    none: 'None',
  };

  return { ...state, supervisorMap, insuranceMap };
});

upsertIf(
  state.data.metadata.username !== 'openfn.test' &&
    state.data.metadata.username !== 'test.2022',
  'Visit__c',
  'CommCare_Visit_ID__c',
  fields(
    field('CommCare_Username__c', dataValue('form.meta.username')),
    field('CommCare_Visit_ID__c', dataValue('id')),
    field('Household_CHW__c', 'a030Q00000A0jeY'),
    field('Catchment__c', 'a000Q00000Egmtk'),
    field('Household__c','a010Q00000BL6lT'),
    field('Date__c',dataValue('form.Date')),
    //field('MOH_household_code__c', state => {
    //  var moh = dataValue('form.Household_Information.moh_code')(state);
    //  var mohLinked = dataValue('form.MOH_household_code_linked')(state);
    // return moh ? moh : mohLinked && mohLinked !== '' ? mohLinked : undefined;
   // }),
    field('Active_Household__c', state => {
      var status = dataValue('form.Household_Status')(state);
      return status && status === 'No'
        ? false
        : status === 'Yes'
        ? true
        : status;
    }),
    //field('Inactive_Reason__c', state => {
    //  var reason = dataValue('form.Reason_for_Inactive')(state);
    //  return reason ? reason.toString().replace(/_/g, ' ') : null;
    //}),
    //field('Source__c', 1),//
    field(
      'Completed_COVID_19_Phone_Screening__c',
      dataValue(
        'form.did_you_complete_the_covid-19_phone_screening_for_this_household'
      )
    ),
    field('Household_Visit_Type__c', state => {
      var visit = dataValue(
        'form.is_this_a_physical_home_visit_or_a_phone_call_visit'
      )(state);
      return visit ? visit.toString().replace(/_/g, ' ') : null;
    }),
   // field('Household_village__c', dataValue('form.village')),//
    //New Nutrition Field (MOTG)
    field(
      'Active_in_Nutrition_Program__c',
      dataValue(
        'form.nutrition_enrollment.enrolled_in_a_lwala_nutrition_program'
      )
    ),
    field(
      'lwala_nutrition_program_enrollment_date__c',
      dataValue(
        'form.nutrition_enrollment.lwala_nutrition_program_enrollment_date'
      )
    ),
    field(
      'Trained_in_gardening__c',
      dataValue('form.nutrition_enrollment.household_trained_on_gardening')
    ),
    field(
      'household_trained_on_gardening_date__c',
      dataValue(
        'form.nutrition_enrollment.when_was_the_household_trained_on_gardening'
      )
    ),
    field(
      'Seed_Input_Support__c',
      dataValue(
        'form.nutrition_enrollment.household_provided_with_seed_input_support'
      )
    ),
    field(
      'household_provided_with_seed_input_suppo__c',
      dataValue(
        'form.nutrition_enrollment.when_was_the_household_provided_with_seed_input_support'
      )
    ),
    field(
      'MIYCN_Trained__c',
      dataValue('form.nutrition_enrollment.household_trained_on_MIYCN')
    ),
    field(
      'Kitchen_Garden__c',
      dataValue('form.nutrition_enrollment.household_has_kitchen_garden')
    ),

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
    field(
      'Has_muac_tape__c',
      dataValue('form.Household_Information.family_muac_tape_available')
    ),
    field('Uses_ITNs__c', dataValue('form.Household_Information.ITNs')),
    field('Deaths_in_the_last_6_months__c', state => {
      var deaths = dataValue('form.household_deaths.deaths_in_past_6_months')(
        state
      );
      return deaths && deaths > 0 ? 'Yes' : 'No';
    }),
    //field(
    //  'Total_household_people__c',
    //  dataValue('form.Total_Number_of_Members')
   // ),
    field('Supervisor_Visit__c', state =>
      state.data.form.supervisor_visit
        ? state.supervisorMap[state.data.form.supervisor_visit]
        : null
    ),
    field('Health_insurance__c', dataValue('form.health_insurace_cover')),
    field(
      'Health_insurance_active_status__c',
      dataValue('form.healthinsurance_active')
    ),
    field('Health_insurance_type__c', state => {
      var status = dataValue('form.health_insurance')(state);
      var value =
        status && status !== ''
          ? status
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return state.insuranceMap[value] || value;
              })
          : undefined;
      return value ? value.join(';') : undefined;
    }),
    field(
      'Other_Health_Insurance__c',
      dataValue('form.if_other_please_specify')
    ),
    //field('Last_Modified_Date_CommCare__c', dataValue('server_modified_on')),
    field('Case_Closed_Date__c', state => {
      var closed = dataValue('form.case.update.closed')(state);
      var date = dataValue('server_modified_on')(state);
      return closed && closed == true ? date : undefined;
    })
  )
);