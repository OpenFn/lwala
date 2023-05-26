// NOTE: We perform a query before anything else if this is a 'Case'
fn(state => {
  // state.type = state.data.indices.parent.case_type;
  if (state.payloads.length == 0) return { ...state, services: [] };

  const caseType = state.payloads
    .filter(c => c.indices.parent.case_type === 'Case')
    .map(c => c.indices.parent.case_id);

   console.log(JSON.stringify(caseType, null, 2));

  if (caseType.length > 0)
    return query(
      `SELECT Person__r.CommCare_ID__c FROM Service__c WHERE Service_UID__c IN ('${caseType.join(
        "','"
      )}')`
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
  if (state.payloads.length == 0) return state;
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
    Royal_Medical_Center: 'Royal Medical Center',
    Rosewood_Facility: 'Rosewood Facility',
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
    Treatment_for_Other_OIs: 'Treatment for Other OIs',
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
      'Cognitive Delays (Learning Difficulties)',
    motor_delays: 'Motor Delays',
    speech_and_language_delay: 'Speech and language Delay',
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
    Poor_Breastfeeding: 'Poor Breastfeeding (under 6 months old child)',
    not_able_to_feed_since_birth_or_stopped_feeding_well:
      'Not able to feed since birth, or stopped feeding well',
    not_able_to_breastfeed: 'Not able to breastfeed',
    Fever: 'Fever (37.5 C or more)',
    very_low_temperature: 'Very low temperature (35.4 C or less)',
    shivering: 'Shivering',
    Fast_Breathing: 'Fast Breathing',
    Very_Sleepy: 'Very Sleepy',
    Convulsions_and_Fits: 'Convulsions and Fits',
    only_moves_when_stimulated_or_does_not_move_even_on_stimulation:
      'Only moves when stimulated, or does not move even on stimulation',
    yellow_solebaby_body_turning_yellow_especially_eyes_palms_soles:
      'Yellow sole(Baby body turning yellow especially eyes, palms, soles)',
    bleeding_from_the_umbilical_stump: 'Bleeding from the umbilical stump',
    signs_of_local_infection_umbilicus_is_red_or_draining_pus_skin_boils_or_eye:
      'Signs of local infection: umbilicus is red or draining pus, skin boils, or eyes draining pus',
    weight_chart_using_color_coded_scales_if_red_or_yellowweight_below_25kg_or_:
      'Weight chart using color coded scales if RED or YELLOW(Weight below 2.5kg or born less than 36 weeks of age)',
    unable_to_cry: 'Unable to cry',
    cyanosis: 'Cyanosis',
    bulging_fontanelle: 'Bulging fontanelle',
  };

  const otherReferralMap = {
    HIV_Testing_and_Counseling: 'HIV Testing and Counseling',
    Visit_to_Clinician: 'Visit to Clinician',
    Adverse_Drug_Reaction_Side_Effect: 'Adverse Drug Reaction Side Effect',
    Malnutrition: 'Malnutrition',
    Malaria: 'Malaria',
    PMTCT: 'PMTCT',
    TB: 'TB',
    Treatment_for_other_OIs: 'Treatment for other OIs',
    ARI: 'ARI',
    Anemia: 'Anemia',
    Diarrhea: 'Diarrhea',
    Pregnancy_Care_ANCE: 'Pregnancy Care (ANC)',
    Family_Planning_FP: 'Family Planning (FP)',
    Preconception_Counseling: 'Preconception Counseling',
    Injury: 'Injury',
    blood_in_stool: 'Blood in Stool',
    Blood_in_Stool: 'Blood in Stool',
    Immunization: 'Immunization',
    Routine_Health_Check_ups: 'Routine Health Check ups',
    routine_health_check_ups: 'Routine Health Check ups',
    Other: 'Other',
    Poor_Breastfeeding: 'Poor Breastfeeding (under 6 months old child)',
    not_able_to_feed_since_birth_or_stopped_feeding_well:
      'Not able to feed since birth, or stopped feeding well',
    not_able_to_breastfeed: 'Not able to breastfeed',
    Fever: 'Fever (37.5 C or more)',
    very_low_temperature: 'Very low temperature (35.4 C or less)',
    shivering: 'Shivering',
    Fast_Breathing: 'Fast Breathing',
    Very_Sleepy: 'Very Sleepy',
    Convulsions_and_Fits: 'Convulsions and Fits',
    only_moves_when_stimulated_or_does_not_move_even_on_stimulation:
      'Only moves when stimulated, or does not move even on stimulation',
    yellow_solebaby_body_turning_yellow_especially_eyes_palms_soles:
      'Yellow sole(Baby body turning yellow especially eyes, palms, soles)',
    bleeding_from_the_umbilical_stump: 'Bleeding from the umbilical stump',
    signs_of_local_infection_umbilicus_is_red_or_draining_pus_skin_boils_or_eye:
      'Signs of local infection: umbilicus is red or draining pus, skin boils, or eyes draining pus',
    weight_chart_using_color_coded_scales_if_red_or_yellowweight_below_25kg_or_:
      'Weight chart using color coded scales if RED or YELLOW(Weight below 2.5kg or born less than 36 weeks of age)',
    unable_to_cry: 'Unable to cry',
    cyanosis: 'Cyanosis',
    bulging_fontanelle: 'Bulging fontanelle',
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

  const ecdMap = {
    physiotherapy: 'Physiotherapy',
    speech_therapy: 'Speech Therapy',
    nutrition_education: 'Nutrition Education',
    play_therapy: 'Play Therapy',
    assessment: 'Assessment',
    counselling: 'Counselling',
    other: 'Other',
  };

  const clinicalMap = {
    diarrhea: 'Diarrhea',
    malnutrition: 'Malnutrition',
    malaria: 'Malaria',
    acute_respiratory_infection: 'Acute Respiratoy Infection (ARI)',
    accident_injury: 'Accident/Injury',
    other: 'Other',
  };

  const caseType = state.payloads
    .filter(c => c.indices.parent.case_type === 'Case')
    .map(c => c.indices.parent.case_id);

  const personType = state.payloads
    .filter(c => c.indices.parent.case_type === 'Person')
    .map(c => c.indices.parent.case_id);

  let relationships = [];

  // If it's a person, add the person relationship
  if (personType.length > 0) {
    personType.forEach(case_id => {
      relationships.push({ 'Person__r.CommCare_ID__c': case_id });
    });
  }

  // If it's a service, add the service rship AND a different person rship
  if (caseType.length > 0) {
    caseType.forEach(case_id => {
      relationships.push({ 'Parent_Service__r.Service_UID__c': case_id });
    });

    relationships.push({ 'Person__r.CommCare_ID__c': state.ccId });
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
    ecdMap,
  };
});

// NOTE: We finally upsert to the Service__c object in Salesforce
fn(state => {
  if (state.payloads.length == 0) return state;
  const services = state.payloads
    .filter(r => r.properties.owner_id !== '8e725928e3ce43d19b390dd604097069')
    .map(r => {
      // pregnancyDangerSigns
      const pCheck = r.properties.pregnancy_danger_signs;
      const pValue =
        pCheck && pCheck !== ''
          ? pCheck
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return state.pregDangerMap[value] || value;
              })
          : undefined;
      const pregnancyDangerSigns = pValue ? pValue.join(';') : undefined;

      // childDangerSigns
      const cCheck = r.properties.Other_Danger_Signs;
      const cValue =
        cCheck && cCheck !== ''
          ? cCheck
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return state.childSignMap[value] || value;
              })
          : undefined;
      const childDangerSigns = cValue ? cValue.join(';') : undefined;

      // delayedMilestone
      const dCheck = r.properties.which_delayed_milestone;
      const dValue =
        dCheck && dCheck !== ''
          ? dCheck
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return state.milestoneTypeMap[value] || value;
              })
          : undefined;
      const delayedMilestone = dValue ? dValue.join(';') : undefined;

      // seriousSymptoms
      const sCheck = r.properties.symptoms_check_other;
      const sValue =
        sCheck && sCheck !== ''
          ? sCheck
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return state.symptomsMap[value] || value;
              })
          : undefined;
      const seriousSymptoms = sValue ? sValue.join(';') : undefined;

      // otherReferralReason
      const otCheck = r.properties.Other_Referral_Reasons;
      const otValue =
        otCheck && otCheck !== ''
          ? otCheck
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return state.otherReferralMap[value] || value;
              })
          : undefined;
      const otherReferralReason = otValue ? otValue.join(';') : undefined;

      // homeBasedCareRendered
      const homeCheck = r.properties.Home_Based_Care_Provided;
      const homeValue =
        homeCheck && homeCheck !== ''
          ? homeCheck
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return state.homeCareMap[value] || value;
              })
          : undefined;
      const homeBasedCareRendered = homeValue ? homeValue.join(';') : undefined;

      // ecdClinicalService
      const ecdCheck = r.properties.ECD_Clinical_Service;
      const ecdValue =
        ecdCheck && ecdCheck !== ''
          ? ecdCheck
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return state.ecdMap[value] || value;
              })
          : undefined;
      const ecdClinicalService = ecdValue ? ecdValue.join(';') : undefined;

      return {
        'Person__r.CommCare_ID__c':
          r.indices.parent.case_type === 'Person'
            ? r.indices.parent.case_id
            : r.indices.parent.case_type === 'Case'
            ? state.ccId
            : undefined,
        Service_UID__c: r.case_id,
        CommCare_Code__c: r.case_id,
        RecordTypeID: '01224000000YAuK',
        //HMN uncomment the CHW
        //'Household_CHW__r.CommCare_ID__c': r.properties.CHW_ID,
        'Household_CHW__r.CommCare_ID__c':'a03AW00000643nLYAQ',
        Open_Case__c: r.closed === false ? true : false,
        Age_Time_of_Service__c: r.properties.age,
        Source__c: r.properties.Source === '1',
        Clinical_facility__c: r.properties.Facility_Visited
          ? state.facilityMap[r.properties.Facility_Visited]
          : undefined,
        Client_Received_Services_at_Facility2__c: r.properties.Facility_Visit,
        Clinical_Visit_Date__c:
          r.properties.Facility_Date === '' ||
          r.properties.Facility_Date === undefined
            ? undefined
            : r.properties.Facility_Date,
            //HMN2 Changed CHW_Followed_Up_with_the_Client
        CHW_Followed_Up_with_the_Client__c: r['properties.Follow-Up']!== ''
            ? r['properties.Follow-Up']
            : undefined,
        Follow_Up_Date__c: r['properties.Follow-Up_Date'],
        Person_Complied_w_Referral_in_24_hrs__c: r.properties.referral_compliance,
        Received_a_diagnosis_for_PSBI__c,Received_antibiotics_per_protocol__c,
        Skillled_Delivery__c: r.properties.skilled_delivery,
        Child_received_immunizations__c: r.properties.immunization,
        Received_a_diagnosis_for_PSBI__c: r.properties.psbi_diagnosis, //Form: CHW.Follow-Up.PSBI.psbi_diagnosis
        Received_antibiotics_per_protocol__c: r.properties.antibiotic_8days, //Form: CHW.Follow-Up.PSBI.antibiotic_8day
        //HMN saw a pattern and commented out all of these for troublehsooting
        /*
        Distributed_Treatment_on_Last_Visit__c:
          r.properties.distribute_treatment, //Form: CHW.Follow-Up.distribute_treatment
        Person_had_an_adverse_drug_reaction__c:
          r.properties.adverse_drug_reaction,
        Defaulted__c:
          r.properties.date_of_default && r.properties.date_of_default !== ''
            ? true
            : false,
        Date_of_Default__c: r.properties.date_of_default,
        Client_s_Symptoms_Improved__c: r.properties.Client_Improved,
        Case_Type__c: r.properties.Case_Type,
        Follow_Up_By_Date__c:
          r.properties['Follow-Up_By_Date'] &&
          r.properties['Follow-Up_By_Date'] !== ''
            ? r.properties['Follow-Up_By_Date']
            : undefined,
        Date__c: new Date(r.properties.date_opened).toISOString(),
        Reason_for_Service__c: r.properties.Reason_for_Service,
        Type_of_Service__c: r.properties.Type_of_Service,
        Malaria_Status__c: r.properties.Malaria_Status,
        Home_Treatment_Date__c: r.properties.home_treatment_date,
        Malaria_Home_Test_Date__c: r.properties.malaria_test_date,
        Home_ORS__c: r.properties.clinic_ors,
        Home_Zinc__c: r.properties.clinic_zinc,
        Height__c: r.properties.height,
        Weight__c: r.properties.weight,
        MUAC__c: r.properties.muac,
        Nutrition_Status__c: r.properties.Nutrition_Status,
        
        //===== NEW MAPPINGS - JAN 14 ===========================//
        Pregnancy_Danger_Signs__c: pregnancyDangerSigns,
        Child_Danger_Signs__c: childDangerSigns,
        Delayed_Milestone__c: delayedMilestone,
        Serious_Symptoms__c: seriousSymptoms,
        Other_Referral_Reasons__c: otherReferralReason,
        Home_Based_Care_Rendered__c: homeBasedCareRendered,
        PSBI_Visit__c:
          r.properties.psbi_task && r.properties.psbi_task !== ''
            ? `Day ${r.properties.psbi_task}`
            : undefined,
        Clinical_Services__c: r.properties.TT5_Clinical_Service
          ? state.clinicalMap[r.properties.TT5_Clinical_Service]
          : r.properties.TT5_Clinical_Service,
        Referred_Facility__c: r.properties.referred_facility
          ? state.facilityMap[r.properties.referred_facility]
          : r.properties.referred_facility,
        HAWI_Clinical_Services__c: r.properties.HAWI_Clinical_Service
          ? state.serviceMap[r.properties.HAWI_Clinical_Service]
          : r.properties.HAWI_Clinical_Service,
        ECD_Clinical_Services__c: ecdClinicalService,
        */
        //END HMN
      };
    });

  return { ...state, services };
});

fn(state => {
  console.log('Services to upsert ::', JSON.stringify(state.services));
  return state;
});

bulk(
  'Service__c',
  'upsert',
  {
    extIdField: 'Service_UID__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => {
    console.log('Bulk upserting service...');
    return state.services;
  }
);
