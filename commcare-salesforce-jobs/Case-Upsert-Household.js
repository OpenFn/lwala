//fn(state => {
//  const person = state.data.form.Person;
//  if (!Array.isArray(person)) {
//    state.data.form.Person = [person];
//  }

//  titleCase = str => {
//    var splitStr = str.toLowerCase().split(' ');
//    for (var i = 0; i < splitStr.length; i++) {
//      splitStr[i] =
//        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
//    }
//    return splitStr.join(' ');
//  };

//Not necessary - relates to a person (MOTG)
 // const reasonMapping = {
 //   pregnant: 'The client is pregnant',
 //   intentions_of_getting_pregnant: 'Intentions of getting pregnant',
 //   lack_of_access_to_fp_information: 'Lack of access to FP information',
 //   not_sexually_active: 'The client is not sexually active',
 //   other_barriers_culture_male_partners_parents_etc:
 //     'Other barriers (culture, male partners, parents, etc)',
 //   no_access_to_fp_services_hospitals:
 //     'Lack of hospitals or places where FP services can be accessed',
 //   not_willing_to_use_fp_due_to_negative_effects_myths_and_misconceptions:
 //     'Myths and misconceptions',
 //   barriers_at_service_delivery_points: 'Barriers at service delivery points',
 // };

//  state.area = state.data.properties.area_name; 
//  state.catchment = state.data.properties.catchment_name;

//  return { ...state, reasonMapping };
//});

//Upserting Household, checks if Household exists via MOH Household Code
upsert(
  'Household__c',
  'CommCare_Code__c',
  fields(
    field('CommCare_Username__c', dataValue('form.meta.username')),
    field('MOH_household_code__c', dataValue('properties.MOH_code')),
    field('CommCare_Code__c', dataValue('case_id'),
    field('Source__c', true),
    field('Household_CHW__c', state => {
      var chw = dataValue('properties.CHW_ID')(state);
      return chw === 'a030800001zQrk'
        ? 'a030800001zQrk5'
        : chw
        ? chw
        : undefined;
    }),
    //field('Household_CHW__c', 'a031x000002S9lm'), //HARDCODED FOR SANDBOX TESTING --> To replace with line above
    relationship('Catchment__r', 'Name', state => {
      var catchment =
        state.data.form.catchment ||
        state.data.form.location_info.catchment_name;
      return catchment === '' || catchment === undefined
        ? 'Unknown Location'
        : catchment;
    }), // check
    field('Area__c', state => {
      var area = dataValue('properties.Area_Name')(state);
      return area === '' || area === undefined ? 'a002400000k6IKi' : area;
    }),
    field('Household_village__c', dataValue('properties.village')),
    field('Deaths_in_the_last_6_months__c', state => {
      var death = dataValue(
        'properties.deaths_in_past_6_months'
      )(state);
      return death > 0 ? 'Yes' : 'No';
    }),
    field(
      'Access_to_safe_water__c',
      dataValue('properties.Safe_Water')
    ),
    field(
      'Treats_Drinking_Water__c',
    dataValue('properties.Treats_Drinking_Water')
    ),
    field(
      'Tippy_Tap__c',
     dataValue('properties.Active_Handwashing_Station')
    ),
    field(
      'Pit_Latrine__c',
    dataValue('properties.Functional_Latrine')
    ),
    field(
      'Rubbish_Pit__c',
      dataValue('properties.Rubbish_Pit')
    ),
    field(
      'Drying_Rack__c',
     dataValue('properties.Drying_Rack')
    ),
    field(
      'Kitchen_Garden__c',
      dataValue('properties.Kitchen_Garden')
    ),
    field(
      'Cookstove__c',
      dataValue('properties.Improved_Cooking_Method')
    ),
  dataValue('properties.Clothesline')
    ),
    field(
      'WASH_Trained__c',
    dataValue('properties.WASH_Trained')
    ),
    field(
      'Total_household_people__c',
 dataValue('properties.Total_Number_of_Members')
    ),
    field('Health_insurance__c', dataValue('properties.health_insurace_cover')),
    field(
      'Health_insurance_active_status__c',
      dataValue('properties.healthinsurance_active')
    ),
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
    field(
      'Other_Health_Insurance__c',
      dataValue('properties.if_other_please_specify')
    ),
    field('Work_with_TBA__c', dataValue('properties.tba')),
    field('TBA_name__c', dataValue('properties.which_tba')),
    field('Last_Modified_Date_CommCare__c', 
   dataValue('server_date_modified')
    ),
    field('Case_Closed_Date__c', state => {
      var closed = dataValue('date_closed')(state); 
      var date =  dataValue('server_date_modified')(state); 
      return closed && closed == true ? date : undefined; 
    })
  )
);