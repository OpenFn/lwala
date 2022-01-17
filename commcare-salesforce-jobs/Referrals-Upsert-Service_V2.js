// NOTE: We perform a query before anything else if this is a 'Case'
fn(state => {
  state.type = state.data.indices.parent.case_type;

  if (state.type === 'Case')
    return query(
      `SELECT Person__r.CommCare_ID__c FROM Service__c WHERE Service_UID__c = '${state.data.indices.parent.case_id}'`
    )(state).then(state => {
      const { records } = state.references[0];
      const ccId =
        records.length == 1 ? records[0].Person__r.CommCare_ID__c : null;
      return { ...state, ccId };
    });

  return state;
});

// NOTE: We construct a facilityMap and populate some conditional relationships
fn(state => {
  const facilityMap = {
    Lwala_Hospital: 'Lwala Hospital',
    Minyenya_Dispensary: 'Minyenya Dispensary',
    Ndege_Oriedo_Dispensary: 'Ndege Oriedo Dispensary',
    'Rongo_Sub-District_Hospital': 'Rongo Sub-District Hospital',
    Kangeso_Dispensary: 'Kangeso Dispensary',
    Ngodhe_Dispensary: 'Ngodhe Dispensary',
    Ngere_Dispensary: 'Ngere Dispensary',
    Verna_Health_Center: 'Verna Health Center',
    Kochola_Dispensary: 'Kochola Dispensary',
    Ongo_Health_Center: 'Ongo Health Center',
    Other: 'Other',
  };

  const pregDangerMap = {
    Vaginal_Bleeding: 'Vaginal Bleeding',
    Water_Breaks: 'Water Breaks before Time of Delivery',
    Prolonged_Labour: 'Prolonged Labour over 12 Hours',
    Convulsions: 'Convulsions or Fits',
    Abdominal_Pain: 'Severe Abdominal Pain before Delivery',
    High_Fever: 'High Fever',
    Low_Baby_Movement: 'Feeling the Baby move less or not at all',
    Swelling: 'Swelling of Face and Hands',
    Severe_Headache: 'Severe or Continuous Headache for more than 12 hours',
    Severe_Vomiting: 'Severe or Continuous Vomiting',
    none: 'None',
  };

  const serviceMap = {
    Scheduled_PSC_Apt: 'Scheduled PSC Apt',
    Adverse_Drug_Reaction_Side_Effect: 'Adverse Drug Reaction/Side Effect',
    Malnutrition: 'Malnutrition',
    Malaria: 'Malaria',
    TB: 'TB',
    Treatment_for_Other_OIs: 'Treatment for other Ols',
    ARI: 'ARI',
    Anemia: 'Anemia',
    Diarrhea: 'Diarrhea',
    Pregnancy_Care: 'Pregnancy Care (ANC)',
    Family_Planning: 'Family Planning (FP)',
    Preconception_Counseling: 'Preconception Counseling',
    Injury: 'Injury',
    Other: 'Other',
  };

  const milestoneTypeMap = {
    cognitive_delays_learning_difficulties:
      'Cognitive Delays Learning Difficulties',
    motor_delays: 'Motor Delays',
    speech_and_language_delay: 'Delay Speech and Language Delay',
    social_and_emotional: 'Social and emotional',
  };

  const symptomsMap = {
    convulsions: 'Convulsions',
    not_able_to_eatdrink: 'Not able to eat/drink',
    vomits_everything: 'Vomits everything',
    'chest_in-drawing': 'Chest in-drawing',
    unusually_sleepyunconscious: 'Unusually sleepy/unconscious',
    swelling_of_both_feet: 'Swelling of both feet',
  };

  const childSignMap = {
    comm: 'Poor Breastfeeding (under 6 months old child)',
    comm: 'Not able to feed since birth, or stopped feeding well',
    comm: 'Not able to breastfeed',
    comm: 'Fever (37.5 C or more)',
    comm: 'Very low temperature (35.4 C or less)',
    comm: 'Shivering',
    comm: 'Fast Breathing',
    comm: 'Very Sleepy',
    comm: 'Convulsions and Fits',
    comm: 'Only moves when stimulated, or does not move even on stimulation',
    comm: 'Yellow sole(Baby body turning yellow especially eyes, palms, soles)',
    comm: 'Bleeding from the umbilical stump',
    comm: 'Signs of local infection: umbilicus is red or draining pus, skin boils, or eyes draining pus',
    comm: 'Weight chart using color coded scales if RED or YELLOW(Weight below 2.5kg or born less than 36 weeks of age)',
    comm: 'Unable to cry',
    comm: 'Cyanosis',
    comm: 'Bulging fontanelle',
  };

  const otherReferralMap = {
    comm: 'HIV Testing and Counseling',
    comm: 'Visit to Clinician',
    comm: 'Adverse Drug Reaction Side Effect',
    comm: 'Malnutrition',
    comm: 'Malaria',
    comm: 'PMTCT',
    comm: 'TB',
    comm: 'Treatment for other OIs',
    comm: 'ARI',
    comm: 'Anemia',
    comm: 'Diarrhea',
    comm: 'Pregnancy Care (ANC)',
    comm: 'Family Planning (FP)',
    comm: 'Preconception Counseling',
    comm: 'Injury',
    comm: 'Blood in Stool',
    comm: 'Immunization',
    comm: 'Routine Health Check ups',
    comm: 'Other',
  };

  const homeCareMap = {
    Adherence_Counseling: 'Adherence Counseling',
    Pill_Count_Monitoring: 'Pill Count Monitoring',
    Nutrition_Assessment_and_Counseling: 'Nutrition Assessment and Counseling',
    WASH_Counseling: 'WASH Counseling',
    Prevention_Counseling: 'Prevention Counseling',
    Psychosocial_Support: 'Psychosocial Support',
    Provision_of_Supplies: 'Provision of Supplies',
    OI_Management_Support: 'OI Management Support',
  };

  const clinicalMap = {
    comm: 'Diarrhea',
    comm: 'Malnutrition',
    comm: 'Malaria',
    comm: 'Acute Respiratoy Infection (ARI)',
    comm: 'Accident/Injury',
    comm: 'Other',
  };

  let relationships = [];

  // If it's a person, add the person relationship
  if (state.type === 'Person') {
    relationships.push(
      relationship(
        'Person__r',
        'CommCare_ID__c',
        state.data.indices.parent.case_id
      )
    );
  }

  // If it's a service, add the service rship AND a different person rship
  if (state.type === 'Case') {
    relationships.push(
      relationship(
        'Parent_Service__r',
        'Service_UID__c',
        state.data.indices.parent.case_id
      )
    );
    relationships.push(relationship('Person__r', 'CommCare_ID__c', state.ccId));
  }

  return {
    ...state,
    facilityMap,
    relationships,
    serviceMap,
    pregDangerMap,
    milestoneTypeMap,
    symptomsMap,
    childSignMap,
    otherReferralMap,
    homeCareMap,
    clinicalMap,
  };
});

// NOTE: We finally upsert to the Service__c object in Salesforce
upsert('Service__c', 'Service_UID__c', state => ({
  ...fields(...state.relationships),
  ...fields(
    field('Service_UID__c', dataValue('case_id')),
    field('CommCare_Code__c', dataValue('case_id')),
    field('RecordTypeID', '01224000000YAuK'),
    field('Household_CHW__c', 'a030Q000008XyXV'), //Sandbox test CHW
    // relationship( //ADD BACK BEFORE PROD DEPLOYMENT; removed for sandbox testing
    //   'Household_CHW__r',
    //   'CommCare_ID__c',
    //   dataValue('properties.CHW_ID')
    // ),
    field('Open_Case__c', state => {
      var status = dataValue('closed')(state);
      return status === false ? true : false;
    }),
    field('Age_Time_of_Service__c', dataValue('properties.age')),
    field('Source__c', dataValue('properties.Source') === '1'),
    field('Clinical_facility__c', state => {
      var chwf = dataValue('properties.CHW.Facility_Services.Facility')(state);
      var fac = dataValue('properties.referred_facility')(state);
      var facility = fac || chwf;
      return state.facilityMap[facility];
    }),
    field('Client_Received_Services_at_Facility__c', state => {
      var serv = dataValue('properties.Facility_Visit')(state);
      return serv === 'Yes' || serv === 'yes' ? true : false;
    }),
    field('Clinical_Visit_Date__c', state => {
      var date = dataValue('properties.Facility_Date')(state);
      return date === '' || date === undefined ? undefined : date;
    }),
    field(
      'CHW_Followed_Up_with_the_Client__c',
      dataValue('properties.Follow-Up')
    ),
    field('Follow_Up_Date__c', dataValue('properties.Follow-Up_Date')),
    field(
      'Person_Complied_w_Referral_in_24_hrs__c',
      dataValue('properties.referral_compliance')
    ),
    field('Skillled_Delivery__c', dataValue('properties.skilled_delivery')),
    field(
      'Child_received_immunizations__c',
      dataValue('properties.immunization')
    ),
    field(
      'Received_a_diagnosis_for_PSBI__c',
      dataValue('properties.psbi_diagnosis') //CHW.Follow-Up.PSBI.psbi_diagnosis
    ),
    field(
      'Received_antibiotics_per_protocol__c',
      dataValue('properties.antibiotic_8days') //CHW.Follow-Up.PSBI.antibiotic_8day
    ),
    field(
      'Distributed_Treatment_on_Last_Visit__c',
      dataValue('properties.distribute_treatment') //CHW.Follow-Up.distribute_treatment
    ),
    field(
      'Person_had_an_adverse_drug_reaction__c',
      dataValue('properties.adverse_drug_reaction')
    ),
    field('Defaulted__c', state => {
      var date = dataValue('properties.date_of_default')(state);
      return date && date !== '' ? true : false;
    }),
    field('Date_of_Default__c', dataValue('properties.date_of_default')),
    field(
      'Client_s_Symptoms_Improved__c',
      dataValue('properties.Client_Improved')
    ),
    field('Case_Type__c', dataValue('properties.Case_Type')),
    field('Follow_Up_By_Date__c', state => {
      var date = dataValue('properties.Follow-Up_By_Date')(state);
      return date && date !== '' ? date : undefined;
    }),
    field('Date__c', state =>
      new Date(state.data.properties.date_opened).toISOString()
    ),
    field('Reason_for_Service__c', dataValue('properties.Reason_for_Service')),
    field('Type_of_Service__c', dataValue('properties.Type_of_Service')),
    field('Malaria_Status__c', dataValue('properties.Malaria_Status')),
    field(
      'Home_Treatment_Date__c',
      dataValue('properties.home_treatment_date')
    ),
    field(
      'Malaria_Home_Test_Date__c',
      dataValue('properties.malaria_test_date')
    ),
    field('Home_ORS__c', dataValue('properties.clinic_ors')),
    field('Home_Zinc__c', dataValue('properties.clinic_zinc')),
    field('Height__c', dataValue('properties.height')),
    field('Weight__c', dataValue('properties.weight')),
    field('MUAC__c', dataValue('properties.muac')),
    field('Nutrition_Status__c', dataValue('properties.Nutrition_Status')),
    //===== NEW MAPPINGS - JAN 14 ===========================//
    field('Pregnancy_Danger_Signs__c', state => {
      var sign = dataValue('properties.pregnancy_danger_signs')(state);
      return sign && sign.split(',').join(';');
      //TODO:apply state.pregDangerMap to each 'sign' value which is multiselect in commcare
    }),
    field('Child_Danger_Signs__c', state => {
      var check = dataValue('properties.Other_Danger_Signs')(state);
      return check && check.split(',').join(';');
      //TODO:apply state.childSignMap to each 'check' value which is multiselect in commcare
    }),
    field('Delayed_Milestone__c', state => {
      var check = dataValue('properties.which_delayed_milestone')(state);
      return check && check.split(',').join(';');
      //TODO: apply state.milestoneTypeMap to each 'check' value which is multiselect in commcare
    }),
    field('Serious_Symptoms__c', state => {
      var check = dataValue('properties.symptoms_check_other')(state);
      var value =
        check && check !== ''
          ? check
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return state.symptomsMap[value] || undefined;
              })
          : undefined;
      return value.join(';') || undefined;
    }),
    // field('Other_Referral_Reasons__c', state => {
    //   var check = dataValue('properties.Purpose_of_Referral')(state);
    //   return check && check.split(',').join(';');
    //   //TODO: apply state.otherReferralMap to each 'check' value which is multiselect in commcare
    // }),
    field('Home_Based_Care_Rendered__c', state => {
      const hbc = dataValue('properties.Home_Based_Care_Provided')(state);
      return hbc ? hbc.split(',').join(';').replace(/_/g, ' ') : hbc;
      //TODO: apply state.homeCareMap to each 'hbc' value which is multiselect in commcare
    }),
    field('PSBI_Visit__c', state => {
      var number = dataValue('properties.psbi_task')(state);
      return number && number !== '' ? `Day ${number}` : undefined; //sample output: 'Day 3'
    }),
    field('Clinical_Services__c', state => {
      var check = dataValue('properties.TT5_Clinical_Service')(state);
      return state.clinicalMap[check];
    }),
    field('Referred_Facility__c', state => {
      var check = dataValue('properties.referred_facility')(state);
      return state.facilityMap[check];
    }),
    field('HAWI_Clinical_Services__c', state => {
      var sign = dataValue('properties.HAWI_Clinical_Service')(state);
      return state.serviceMap[sign];
    })
    //=====================================//
  ),
}));
