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

  return { ...state, facilityMap };
});

upsert(
  'Service__c',
  'Service_UID__c',
  fields(
    field('Service_UID__c', dataValue('case_id')),
    field('RecordTypeID', '01224000000YAuK'),
    relationship('Household_CHW__r', 'CommCare_ID__c', dataValue('properties.CHW_ID')),
    relationship('Person__r', 'CommCare_ID__c', dataValue('indices.parent.case_id')),
    field('Open_Case__c', dataValue('closed')),
    field('Source__c', dataValue('properties.Source') === '1'),
    field('Client_Received_Services_at_Facility__c', dataValue('properties.CHW.Facility_Services.Facility_Visit')),
    field('Clinical_Visit_Date__c', dataValue('properties.CHW.Facility_Services.Facility_Date')),
    field('Clinical_facility__c', state => state.facilityMap[dataValue('properties.CHW.Facility_Services.Facility')(state)]),
    field('CHW_Followed_Up_with_the_Client__c', dataValue('properties.CHW.Follow-Up.Follow-Up')),
    field('Follow_Up_Date__c', dataValue('properties.CHW.Follow-Up.Follow-Up_Date')),
    field('Person_Complied_w_Referral_in_24_hrs__c', dataValue('properties.CHW.Follow-Up.referral_compliance')),
    field('Skillled_Delivery__c', dataValue('properties.CHW.Follow-Up.skilled_delivery')),
    field('Child_received_immunizations', dataValue('properties.CHW.Follow-Up.immunization')),
    field('Received_a_diagnosis_for_PSBI__c', dataValue('properties.CHW.Follow-Up.PSBI.psbi_diagnosis')),
    field('Received_antibiotics_per_protocol__c', dataValue('properties.CHW.Follow-Up.PSBI.antibiotic_8days')),
    field('Distributed_Treatment_on_Last_Visit__c', dataValue('properties.CHW.Follow-Up.distribute_treatment')),
    field('Person_had_an_adverse_drug_reaction__c', dataValue('properties.CHW.Follow-Up.adverse_drug_reaction')),
    field('Defaulted__c', dataValue('properties.CHW.Follow-Up.default_on_treatment') === 'yes'),
    field('Date_of_Default__c', dataValue('properties.CHW.Follow-Up.date_of_default')),
    field('Client_s_Symptoms_Improved__c', dataValue('properties.CHW.Follow-Up.Client_Improved')), // why X?
    field('Case_Type__c', dataValue('properties.CHW.Follow-Up.Case_Type')), // why X?
    field('Follow_Up_By_Date__c', dataValue('properties.CHW.Follow-Up.Follow-Up_By_Date')),
    field('Date__c', state => new Date(state.data.properties.date_opened).toISOString()),
    field('Reason_for_Service__c', dataValue('properties.Reason_for_Service')),
    field('Type_of_Service__c', dataValue('properties.Type_of_Service')),
    field('Malaria_Status__c', dataValue('properties.Malaria_Status')),
    field('Home_Treatment_Date__c', dataValue('properties.home_treatment_date')),
    field('Malaria_Home_Test_Date__c', dataValue('properties.malaria_test_date')),
    field('Home_Based_Care_Rendered__c', state => {
      const hbc = state.data.properties.Home_Based_Care_Provided;
      return hbc && hbc.split(' ').join(';');
    }),
    field('Home_ORS__c', dataValue('properties.clinic_ors')),
    field('Home_Zinc__c', dataValue('properties.clinic_zinc')),
    field('Height__c', dataValue('properties.height')),
    field('Weight__c', dataValue('properties.weight')),
    field('MUAC__c', dataValue('properties.muac')),
    field('Nutrition_Status__c', dataValue('properties.Nutrition_Status'))
  )
);
