// NOTE: We perform a query before anything else if this is a "Case"
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

  return { ...state, facilityMap, relationships };
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
    //   "Household_CHW__r",
    //   "CommCare_ID__c",
    //   dataValue("properties.CHW_ID")
    // ),
    field('Open_Case__c', state => {
      var status = dataValue('closed')(state);
      return status === false ? true : false}
    ),
    field('Age_Time_of_Service__c', dataValue('properties.age')),
    field('Source__c', dataValue('properties.Source') === '1'),
    field('Clinical_facility__c', state => {
      var chwf = dataValue('properties.CHW.Facility_Services.Facility')(state);
      var fac = dataValue('properties.referred_facility')(state);
      var facility = fac || chwf;
      return state.facilityMap[facility];
    }),
    field(
      'Client_Received_Services_at_Facility__c',
      dataValue('properties.Facility_Visit')
    ),
    field(
      'Clinical_Visit_Date__c', state => {
      var date = dataValue('properties.Facility_Date')(state);
      return date === '' || date === undefined ? undefined : date;
    }),
    field(
      'CHW_Followed_Up_with_the_Client__c',
      dataValue('properties.Follow-Up')
    ),
    field(
      'Follow_Up_Date__c',
      dataValue('properties.Follow-Up_Date')
    ),
    field(
      'Person_Complied_w_Referral_in_24_hrs__c',
      dataValue('properties.referral_compliance')
    ),
    field(
      'Skillled_Delivery__c',
      dataValue('properties.skilled_delivery')
    ),
    field(
      'Child_received_immunizations',
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
    field(
      'Defaulted__c', state => {
      var date = dataValue('properties.date_of_default')(state);
      return date && date !== '' ? true : false;
    }),
    field(
      'Date_of_Default__c',
      dataValue('properties.date_of_default')
    ),
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
  ),
}));
