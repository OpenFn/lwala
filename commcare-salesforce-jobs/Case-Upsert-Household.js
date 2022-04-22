upsert(
  'Household__c',
  'CommCare_Code__c',
  fields(
    field('CommCare_Username__c', dataValue('form.meta.username')),//Need a case property
    field('MOH_household_code__c', dataValue('properties.moh_code')),
    field('CommCare_Code__c', dataValue('case_id')),
    field('Source__c', true)),
    field('Household_CHW__c', state => {
      var chw = dataValue('properties.CHW_ID')(state);
      return chw === 'a030800001zQrk'
        ? 'a030800001zQrk5'
        : chw
        ? chw
        : undefined;
    }),
    relationship('Catchment__r', 'Name', state => {
      var catchment =
        state.data.properties.catchement ||
        state.data.properites.catchment_name;
      return catchment === '' || catchment === undefined
        ? 'Unknown Location'
        : catchment;
    }), // check
    field('Area__c', state => {
      var area = dataValue('properties.Area_Name')(state);
      return area === '' || area === undefined ? 'a002400000k6IKi' : area;
    }),//do we need to add the location_info.area_name here? 
    field('Household_village__c', dataValue('properties.village')),//case property, but not in message
    field('Village__c',dataValue('properties.village_name')), //lookup
    field('Deaths_in_the_last_6_months__c', state => {
      var death = dataValue(
        'properties.deaths_in_past_6_months'
      )(state);
      return death > 0 ? 'Yes' : 'No';
    }),
    field('Access_to_safe_water__c',dataValue('properties.Safe_Water')),//not coming through
    field('Treats_Drinking_Water__c',dataValue('properties.Treats_Drinking_Water')),//not coming through
    field('Tippy_Tap__c',dataValue('properties.Active_Handwashing_Station')),//not coming through
    field('Pit_Latrine__c',dataValue('properties.Functional_Latrine')),//not coming through
    field('Rubbish_Pit__c',dataValue('properties.Rubbish_Pit')),//not coming through
    field('Drying_Rack__c',dataValue('properties.Drying_Rack')),//not coming through
    field('Kitchen_Garden__c',dataValue('properties.Kitchen_Garden')),//not coming through
    field('Cookstove__c',dataValue('properties.Improved_Cooking_Method')),//not coming through
    field('Clothe__c',dataValue('properties.Clothesline')),//not coming through
    field('WASH_Trained__c',dataValue('properties.WASH_Trained')),//not coming through
    field('Uses_ITNs__c',dataValue('properties.ITNs')),
    field('Total_household_people__c',dataValue('properties.Total_Number_of_Members')), //not coming through
    field('Health_insurance__c', dataValue('properties.health_insurace_cover')),
    field('Health_insurance_active_status__c',dataValue('properties.healthinsurance_active')),
    field('Health_insurance_type__c', state => {
      var status = dataValue('properties.health_insurance')(state);
      return status && status === 'other_please_specify_if_active'
        ? 'Other'
        : status === 'nhif'
        ? 'NHIF'
        : status === 'Linda_mama' || 'linda_mama'
        ? 'Linda mama'
        : status;
    }),
    field('Other_Health_Insurance__c',dataValue('properties.if_other_please_specify')),
    field('Work_with_TBA__c', dataValue('properties.tba')),
    field('TBA_name__c', dataValue('properties.which_tba')),
    field('Last_Modified_Date_CommCare__c', dataValue('server_date_modified')),//Need a case property),
    field('Active_Household__c', state => {
      var status = dataValue('properties.Household_Status')(state);
      return status && status === 'No'
        ? false
        : status === 'Yes'
        ? true
        : status;
    }),
     field('Inactive_Reason__c', state => {
      var reason = dataValue('properties.Reason_for_Inactive')(state);
      return reason ? reason.toString().replace(/_/g, ' ') : null;
    }),
     field(
      'Active_in_Nutrition_Program__c',
      dataValue(
        'form.nutrition_enrollment.enrolled_in_a_lwala_nutrition_program'
      )
    ),
    field(
      'lwala_nutrition_program_enrollment_date__c',
      dataValue(
        'properties.nutrition_enrollment.lwala_nutrition_program_enrollment_date'
      )
    ),
    field(
      'Trained_in_gardening__c',
      dataValue('properties.nutrition_enrollment.household_trained_on_gardening')
    ),
    field(
      'household_trained_on_gardening_date__c',
      dataValue(
        'properties.nutrition_enrollment.when_was_the_household_trained_on_gardening'
      )
    ),
    field(
      'Seed_Input_Support__c',
      dataValue(
        'properties.nutrition_enrollment.household_provided_with_seed_input_support'
      )
    ),
    field(
      'household_provided_with_seed_input_suppo__c',
      dataValue(
        'properties.nutrition_enrollment.when_was_the_household_provided_with_seed_input_support'
      )
    ),
    field(
      'MIYCN_Trained__c',
      dataValue('properties.nutrition_enrollment.household_trained_on_MIYCN')
    ),
    field(
      'Kitchen_Garden__c',
      dataValue('properties.nutrition_enrollment.household_has_kitchen_garden')
    ),

    //field('Case_Closed_Date__c', state => {
    //  var closed = dataValue('date_closed')(state); 
    //  var date =  dataValue('server_date_modified')(state); 
    //  return closed && closed == true ? date : undefined; 
   // })
    )
  )
);
