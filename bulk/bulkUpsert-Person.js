fn(state => {
  if (state.payloads.length == 0)
    return {
      ...state,
      householdMapping: [],
      headOfHouseholdMapping: [],
      motherMapping: [],
      caregiverMapping: [],
      sfRecordMapping: [],
    };
  
  // JSON logging of records
  //console.log('cases before query :: ', JSON.stringify(state.payloads, null, 2));
  const owner_ids = state.payloads.map(data => data.properties.owner_id);
  const uniq_owner_ids = [...new Set(owner_ids)];

  return { ...state, uniq_owner_ids };
});

// get data from SF
fn(state => {
  if (state.payloads.length == 0) return state;

  return query(
    `SELECT CommCare_User_ID__c, Id village, Parent_Geographic_Area__c area, Parent_Geographic_Area__r.Name name, Parent_Geographic_Area__r.Parent_Geographic_Area__c catchment FROM Location__c WHERE CommCare_User_ID__c IN ('${state.uniq_owner_ids.join(
      "','"
    )}') GROUP BY Id, CommCare_User_ID__c, Parent_Geographic_Area__c, Parent_Geographic_Area__r.Name, Parent_Geographic_Area__r.Parent_Geographic_Area__c`
  )(state);
});

fn(state => {
  if (state.payloads.length == 0) return state;

  const [reference] = state.references;

  // console.log(JSON.stringify(reference.records, null, 2));

  const records = reference.records;
  const fetchReference = (owner_id, arg) => {
    const result =
      records && records.length > 0
        ? records.filter(record => record.CommCare_User_ID__c === owner_id)
        : 0;

    //TODO: Update default value for 'unknown location' before go-live
    return result.length > 0
      ? result[0][arg]
      : 'a000800001tMobaAAC' /*unknown location*/;
  };

  const cleanChoice = choice => {
    if (choice) {
      return choice.charAt(0).toUpperCase() + choice.slice(1).replace('_', ' ');
    } else {
      return '';
    }
  };

  const handleMultiSelect = multiField => {
    return multiField
      ? multiField
          .replace(/ /gi, ';')
          .toLowerCase()
          .split(';')
          .map(value => {
            return (
              value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')
            );
          })
          .join(';')
      : '';
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

  const counselMap = {
    anc_visits: 'ANC Visits',
    early_initiation_of_anc_less_than_3_months:
      'Early initiation of ANC (less than 3 months)',
    completing_recomended_anc_visits: 'Completing recomended ANC visits',
    danger_signs: 'Danger signs',
    skilled_birth: 'Skilled birth',
    immunization: 'Immunization',
    individual_birth_plan: 'Individual Birth Plan',
    emergency_preparedness: 'Emergency preparedness',
    childcare_and_affection: 'Childcare and affection',
    nutrition_counseling: 'Nutrition counseling',
    growth_monitoring: 'Growth monitoring',
    exclusive_breastfeeding: 'Exclusive breastfeeding',
    complementary_feeding: 'Complementary feeding',
    sleeping_under_llitn: 'Sleeping under LLITN',
    knowing_hiv_status: 'Knowing HIV status',
    indoor_pollution: 'Indoor pollution',
    personal_hygiene: 'Personal Hygiene',
    safe_drinking_water: 'Safe drinking water',
    safe_disposal_of_human_waste: 'Safe disposal of human waste',
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

  const reasonMapping = {
    lack_of_access_to_fp_information: 'Lack of access to FP information',
    no_access_to_fp_services_hospitals:
      'Lack of hospitals or places where FP services can be accessed',
    not_willing_to_use_fp_due_to_negative_effects_myths_and_misconceptions:
      'Myths and misconceptions',
    barriers_at_service_delivery_points: 'Barriers at service delivery points',
    pregnant: 'The client is pregnant',
    intentions_of_getting_pregnant: 'Intentions of getting pregnant',
    not_sexually_active: 'The client is not sexually active',
    other_barriers_culture_male_partners_parents_etc:
      'Other barriers (culture, male partners, parents, etc)',
  };

  const milestoneTypeMap = {
    cognitive_delays_learning_difficulties:
      'Cognitive Delays Learning Difficulties',
    motor_delays: 'Motor Delays',
    speech_and_language_delay: 'Delay Speech and Language Delay',
    social_and_emotional: 'Social and emotional',
  };

  const milestoneMap = {
    movement: 'Movement',
    hearing: 'Hearing',
    communication: 'Communication',
    seeing: 'Seeing',
    cognitive_delays: 'Cognitive Delays',
    play: 'Play',
  };
  const nutritionMap = {
    severe: 'Severely Malnourished',
    moderate: 'Moderately Malnourished',
    normal: 'Normal',
  };

  const fpMethodMap = {
    male_condoms: 'Male condoms',
    female_condoms: 'Female condoms',
    pop: 'POP',
    coc: 'COC',
    emergency_pills: 'Emergency pills',
    none: 'None',
  };

  return {
    ...state,
    counselMap,
    serviceMap,
    reasonMapping,
    milestoneTypeMap,
    milestoneMap,
    nutritionMap,
    pregDangerMap,
    fpMethodMap,
    cleanChoice,
    handleMultiSelect,
    fetchReference,
  };
});

// build sfRecord before upserting
fn(state => {
  if (state.payloads.length == 0) return state;

  const {
    counselMap,
    reasonMapping,
    milestoneTypeMap,
    milestoneMap,
    nutritionMap,
    pregDangerMap,
    fpMethodMap,
    cleanChoice,
    handleMultiSelect,
    fetchReference,
  } = state;

  const householdMapping = [
    ...new Map(
      state.payloads

       .filter(
          p =>
            p.indices.parent.case_id  !== undefined &&
            p.indices.parent.case_id  !== ''
        )
        .map(p => {
          return {
            CommCare_Code__c:
              p.indices.parent.case_id || p.properties.parent_id,
          };
        })
        .map(h => [h.CommCare_Code__c, h])
    ).values(),
  ];

  const headOfHouseholdMapping = state.payloads
    .filter(
      p =>
        p.properties.head_of_household_case_id !== undefined &&
        p.properties.head_of_household_case_id !== ''
    )
    .map(p => {
      return {
        CommCare_Code__c: p.indices.parent.case_id || p.properties.parent_id,
        'Head_of_Household__r.CommCare_ID__c':
          p.properties.head_of_household_case_id,
      };
    });

  const motherMapping = state.payloads
    .filter(
      p =>
        /*HMN 050723 p.properties.commcare_username !== 'test.2021' &&
        p.properties.test_user !== 'Yes' &&
        */
        p.properties.mother_case_id !== undefined &&
        p.properties.mother_case_id !== '' &&
        p.case_id!== undefined
    )
    .map(p => {
      return {
        'Mother__r.CommCare_ID__c': p.properties.mother_case_id,
        CommCare_ID__c: p.case_id,
      };
    });

  const caregiverMapping = state.payloads
    .filter(
      p =>
        /*HMN 070523 p.properties.commcare_username !== 'test.2021' &&
        p.properties.test_user !== 'Yes' &&
        */
        p.properties.caretaker_case_id !== undefined &&
        p.properties.caretaker_case_id !== '' &&
        p.case_id!== undefined
    )
    .map(p => {
      return {
        'Primary_Caregiver_Lookup__r.CommCare_ID__c':
          p.properties.caretaker_case_id,
        CommCare_ID__c: p.case_id,
      };
    });

  const sfRecordMapping = state.payloads

  .filter(
      p =>
       /*HMN 050723 
        p.properties.commcare_username !== 'test.2021' &&
        p.properties.test_user !== 'Yes'
        */
        p.case_id !== undefined &&
        p.case_id !== ''
    ) 
    .map(p => {
      // For unbornOrName
      const name1 = p.properties.Person_Name || p.properties.case_name;
      const unborn = p.properties.name;

      const name2 =
        name1 === undefined || name1 === '' || name1 === null
          ? unborn
          : name1.replace(/\w\S*/g, function (txt) {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
      const unbornOrName = name1 !== null ? name2 : 'Unborn Child';
      // console.log('Person Name ::', unbornOrName);

      // For chronicIllness
      const chronicChoice =p.properties.please_specify_which_chronic_illness_the_person_has;
      const choice2 = handleMultiSelect(chronicChoice);
      const chronicIllness = choice2 ? choice2.replace(/_/g, ' ') : '';

      const disabilityC =
        p.properties.disability !== undefined && p.properties.disability !=='---' && p.properties.disability !== null
          ? p.properties.disability
              .toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(';')
          : null;
//HMN remove
console.log(p.case_id)
//console.log(disabilityC)
//
      const otherDisability =
        p.properties.other_disability !== undefined && p.properties.other_disability !=='---' && p.properties.other_disability !== null
          ? p.properties.other_disability
              .toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(';')
          : null;
//HMN remove
//console.log(otherDisability)
//HMN
      const hh_relation = p.properties.relation_to_hh;

      const relationToTheHead = hh_relation !== undefined && hh_relation !== null
        ? hh_relation.toString().replace(/_/g, ' ').charAt(0).toUpperCase() +
          hh_relation.toString().replace(/_/g, ' ').slice(1)
        : null;

      const childStatus =
        p.properties.Child_Status && p.properties.Record_Type === 'Unborn'
          ? (p.properties.Child_Status = 'Unborn')
          : p.properties.Child_Status && p.properties.Record_Type === 'Born'
          ? (p.properties.Child_Status = 'Born')
          : p.properties.Child_Status;

      const childDangerSigns = p.properties.Other_Danger_Signs !== undefined && p.properties.Other_Danger_Signs !== null 
        ? p.properties.Other_Danger_Signs.toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(';')
            .toString()
            .replace(/_/g, ' ')
        : p.properties.Other_Danger_Signs;

      //clientCounselled
      const clientChoices = p.properties.counsel_topic;
      const choiceGroups = clientChoices ? clientChoices.split(' ') : null;
      const clientCounselled = choiceGroups
        ? choiceGroups
            .map(cg => {
              return counselMap[cg];
            })
            .join(';')
        : choiceGroups;

      // fpMethodDistributed
      const fpStatus = p.properties.FP_commodity;
      const fpValue =
        fpStatus && fpStatus !== ''
          ? fpStatus
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return fpMethodMap[value] || value;
              })
          : undefined;
      const fpMethodDistributed = fpValue ? fpValue.join(';') : undefined;

      // placeOfDelivery
      const pFacility = p.properties.Delivery_Type;
      const placeOfDelivery =
        pFacility === 'Skilled'
          ? 'Facility'
          : pFacility === 'Unskilled'
          ? 'Home'
          : undefined;

      // reasonForNotTakingFP
      const rStatus = p.properties.No_FPmethod_reason;
      const rValue =
        rStatus && rStatus !== ''
          ? rStatus
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return reasonMapping[value] || value;
              })
          : undefined;
      const reasonForNotTakingFP = rValue ? rValue.join(';') : undefined;

      const recordType = p.properties.Record_Type;

      return {
        // TODO @aleksa, Source__c is causing an error
        Source__c: true,
        CommCare_ID__c: p.case_id,
  
        //HMN 05072023 'Primary_Caregiver_Lookup__r.CommCare_ID__c':p.properties.caretaker_case_id,
        //HMN 05072023 'Mother__r.CommCare_ID__c': p.properties.mother_case_id,
        'Household__r.CommCare_Code__c':
          p.properties.parent_id || p.indices.parent.case_id,
        commcare_location_id__c: p.properties.commcare_location_id,
        CommCare_Username__c: p.properties.commcare_username,
        Telephone__c: p.properties.contact_phone_number,

        Consent_for_data_use__c: p.properties.data_sharing_consent,
        CommCare_HH_Code__c: p.indices.parent.case_id,
        Client_Status__c: p.properties.Client_Status,
        Catchment__c: fetchReference(p.properties.owner_id, 'catchment'),
        Area__c: fetchReference(p.properties.owner_id, 'area'),
        Household_Village__c: fetchReference(p.properties.owner_id, 'village'),
        Name: unbornOrName,
        Chronic_illness__c: chronicIllness,
        Currently_enrolled_in_school__c: p.properties.enrolled_in_school,
        Education_Level__c: p.properties.Education_Level !== null && p.properties.Education_Level !== undefined
          ? p.properties.Education_Level.toString().replace(/_/g, ' ')
          : null,
        Relation_to_the_head_of_the_household__c: relationToTheHead,
        Gender__c: p.properties.Gender !== undefined ? p.properties.Gender : null,
        Disability__c: disabilityC,
        Other_disability__c: otherDisability,
        Use_mosquito_net__c: p.properties.sleep_under_net,
        Birth_Certificate__c: p.properties.birth_certificate,
        Child_Status__c: childStatus,
        'RecordType.Name':
          recordType === 'Unborn' || recordType === ''
            ? 'Child'
            : recordType.toString().replace(/_/g, ' '), //convert Unborn children to Child RT
        //TT5 Mother Information  =====================//
        MCH_booklet__c: p.properties.mch_booklet,
        Reason_for_not_taking_a_pregnancy_test__c: p.properties.No_Preg_Test
          ? p.properties.No_Preg_Test.toString().replace(/_/g, ' ')
          : undefined,
        Pregnancy_danger_signs__c: p.properties.pregnancy_danger_signs
          ? pregDangerMap[p.properties.pregnancy_danger_signs]
          : undefined,
        Individual_birth_plan_counselling__c:
          p.properties.individual_birth_plan,
        Child_Danger_Signs__c: childDangerSigns,
        //HAWI =====================//

        Unique_Patient_Code__c: p.properties.Unique_Patient_Code,
        Active_in_Support_Group__c: p.properties.Active_in_Support_Group,
        Preferred_Care_Facility__c: p.properties.Preferred_Care_Facility,
        Currently_on_ART_s__c: p.properties.ART,
        ART_Regimen__c: p.properties.ARVs,
        HAWI_Defaulter__c: p.properties.default === 'Yes' ? true : false,
        Date_of_Default__c: p.properties.date_of_default,
        Know_HIV_status__c: p.properties.known_hiv_status,
        HIV_Status__c: p.properties.hiv_status,
        //Illness ========================//
        Persons_temperature__c: p.properties.temperature,
        Days_since_illness_start__c: p.properties.duration_of_sickness,
        Current_Malaria_Status__c: p.properties.malaria_test_results,
        Malaria_test__c: p.properties.malaria_test,
        Last_Malaria_Home_Test__c: p.properties.malaria_test_date,
        Last_Malaria_Home_Treatment__c: cleanChoice(
          p.properties.malaria_test_date
        ),
        Cough_over_14days__c: p.properties.symptoms_check_cough,
        TB_patients_therapy_observed__c: p.properties.observed_tb_therapy,
        Injuries_or_wounds__c: p.properties.wounds_or_injuries,
        Pulse_Oximeter__c: p.properties.pulse_oximeter_available,
        Heart_Rate_Pulse_Oximeter__c: p.properties.heart_rate_pulse_oximeter,
        Oxygen_Concentration_Pulse_Oximeter__c:
          p.properties.oxygen_concentration,
        Can_child_drink__c: p.properties.can_child_drink,
        Antibiotic_provided_for_fast_breathing__c: cleanChoice(
          p.properties.antibiotic_fast_breathing
        ),
        Antibiotic_provided_for_chest_indrawing__c: cleanChoice(
          p.properties.antibiotic_chest_indrawing
        ),
        Default_on_TB_treatment__c: cleanChoice(
          p.properties.default_tb_treatment
        ),
        Treatment_Distribution__c: cleanChoice(
          p.properties.distributed_treatments
        ),
        //Delivery  =====================//
        Immediate_Breastfeeding__c: p.properties.Breastfeeding_Delivery,
        Place_of_Delivery__c: placeOfDelivery,
        Delivery_Facility__c: p.properties.Delivery_Facility
          ? p.properties.Delivery_Facility.toString().replace(/_/g, ' ')
          : null,
        Delivery_Facility_Other__c: p.properties.Delivery_Facility_Other,
        //Family Planning  =====================//
        LMP__c: p.properties.LMP,
        Family_Planning__c: p.properties.family_planning,
        Family_Planning_Method__c: p.properties.family_planning_method,
        FP_Method_Distributed__c: fpMethodDistributed,
        Reasons_for_not_taking_FP_method__c: reasonForNotTakingFP,
        Pregnant__c: p.properties.Pregnant === 'Yes' ? true : false,
        Date_of_Delivery__c: p.properties.delivery_date,
        Counselled_on_FP_Methods__c: p.properties.CounselledFP_methods,
        Client_counselled_on__c: clientCounselled,
        Client_provided_with_FP__c: cleanChoice(
          p.properties[
            'was_the_woman_15-49yrs_provided_with_family_planning_commodities_by_chv'
          ]
        ),
        Received_pregnancy_test__c:
          p.properties.did_you_adminsiter_a_pregnancy_test,
        Pregnancy_test_result__c: p.properties.pregnancy_test_result,
        Gravida__c: p.properties.Gravida,
        Parity__c: p.properties.Parity,
        //TT5 Child Information  =====================//
        Exclusive_Breastfeeding__c: p.properties.Exclusive_Breastfeeding,
        Counselled_on_Exclusive_Breastfeeding__c: p.properties.counseling,
        Newborn_visited_48_hours_of_delivery__c:
          p.properties.newborn_visited_48_hours_of_delivery,
        Newborn_visit_counselling__c: cleanChoice(
          p.properties.did_you_consel_the_mother_on1
        ),
        mother_visited_48_hours_of_the_delivery__c:
          p.properties.visit_mother_48,
        Mother_visit_counselling__c: cleanChoice(
          p.properties.did_you_consel_the_mother_on2
        ),
        Newborn_visited_by_a_CHW_within_6_days__c:
          p.properties.visit_6_days_from_delivery,
        //Nutrition  =====================//
        Caretaker_action_after_muac_screening__c:
          p.properties.mother_screened_muac_action,
        Caretaker_muac_findings__c:
          p.properties.mother_screened_child_muac_result,
        Food_groups_3_times_a_day__c: p.properties.food_groups,
        Caretaker_screened_for_muac_this__c: cleanChoice(
          p.properties.mother_screened_child_muac
        ),
        Caretaker_trained_in_muac__c: cleanChoice(
          p.properties.mother_trained_muac
        ),
        of_Caretaker_MUAC_screenings__c: p.properties.mother_nb_screening,
        Current_Height__c: p.properties.current_height,
        Current_MUAC__c: p.properties.MUAC,
        Current_Nutrition_Status__c: p.properties.Nutrition_Status
          ? nutritionMap[p.properties.Nutrition_Status]
          : undefined,
        //TT5 & HAWI  =====================//
        TT5_Mother_Registrant__c: p.properties.Pregnant == 'Yes' ? 'Yes' : null,
        Enrollment_Date__c:
          p.properties.age < 5 || p.properties.Pregnant == 'Yes'
            ? p.server_date_modified
            : null,
        HAWI_Enrollment_Date__c:
          p.properties.hiv_status == 'positive' ? p.server_date_modified : null,
        Thrive_Thru_5_Registrant__c:
          p.properties.age < 5 || p.properties.Pregnant == 'Yes' ? 'Yes' : 'No',
        HAWI_Registrant__c:
          p.properties.hiv_status == 'positive' ? 'Yes' : 'No',
        //ANC  =====================//
        ANC_1__c:
          p.properties.ANC_1 && p.properties.ANC_1 !== ''
            ? p.properties.ANC_1
            : undefined,
        ANC_2__c:
          p.properties.ANC_2 && p.properties.ANC_2 !== ''
            ? p.properties.ANC_2
            : undefined,
        ANC_3__c:
          p.properties.ANC_3 && p.properties.ANC_3 !== ''
            ? p.properties.ANC_3
            : undefined,
        ANC_4__c:
          p.properties.ANC_4 && p.properties.ANC_4 !== ''
            ? p.properties.ANC_4
            : undefined,
        ANC_5__c:
          p.properties.ANC_5 && p.properties.ANC_5 !== ''
            ? p.properties.ANC_5
            : undefined,
        Date_of_Birth__c:
          p.properties.DOB && p.properties.DOB !== ''
            ? p.properties.DOB.replace(/\\/g, '-')
            : undefined,
        //Immunization  =====================//
        // Child_missed_immunization_type__c:
        //   p.form.TT5.Child_Information.Immunizations.immunization_type,
        BCG__c: p.properties.BCG,
        OPV_0__c: p.properties.OPV_0,
        Measles_6__c: p.properties.Measles_6,
        Measles_9__c: p.properties.Measles_9,
        Measles_18__c: p.properties.Measles_18,
        OPV_1__c: p.properties.OPV_PCV_Penta_1,
        OPV_2__c: p.properties.OPV_PCV_Penta_2,
        OPV_3__c: p.properties.OPV_PCV_Penta_3,
        Rotavirus_1__c: p.properties.rotavirus_1,
        Rotavirus_2__c: p.properties.rotavirus_2,
        IPV__c: p.properties.IPV,
        Vitamin_A_12__c: p.properties.Vitamine_A,
        Vitamin_A_18__c: p.properties.Vitamine_A_2,
        Vitamin_A_24__c: p.properties.Vitamine_A_3,
        Deworming_12__c: p.properties.Deworming_1,
        Deworming_18__c: p.properties.Deworming_2,
        Deworming_24__c: p.properties.Deworming_3,
        //ECD  =====================//
        Did_you_counsel_caregiver_on__c: cleanChoice(
          p.properties.did_you_counsel_the_caregiver_on_delayed_milestones
        ),
        Delayed_Milestone__c: cleanChoice(
          p.properties.does_the_child_has_a_delayed_milestone
        ),
        Child_has_2_or_more_play_items__c: cleanChoice(
          p.properties.does_the_child_has_2_or_more_play_items_at_home
        ),
        Child_has_3_or_more_picture_books__c: cleanChoice(
          p.properties.does_the_child_has_3_or_more_picture_books
        ),
        Delayed_Milestones_Counselled_On__c: p.properties
          .which_delayed_milestone_area_did_you_counsel_the_caregiver_on
          ? milestoneMap[
              p.properties
                .which_delayed_milestone_area_did_you_counsel_the_caregiver_on
            ]
          : undefined,
        Delayed_Milestone_Type__c: p.properties.which_delayed_milestone
          ? milestoneTypeMap[p.properties.which_delayed_milestone]
          : undefined,
        //Death  =====================//
        Date_of_Death__c: p.properties.Date_of_Death,
        Cause_of_Death__c: p.properties.cause_of_death_dead
          ? p.properties.cause_of_death_dead.toString().replace(/_/g, ' ')
          : p.properties.cause_of_death_dead,
        Verbal_autopsy__c: p.properties.verbal_autopsy,
        //Closing  =====================//
        Last_Modified_Date_CommCare__c: p.date_modified,
        Case_Closed_Date__c: p.date_closed,
      };
    });

  sfRecordMapping.forEach(rec => {
    Object.entries(rec).forEach(([key, value]) => {
      if (value === '' || value === null) rec[key] = undefined;
    });
  });

  // TODO clean up after QA
  // console.log(JSON.stringify(caregiverMapping, null, 2), 'careGiver');
  // console.log(JSON.stringify(motherMapping, null, 2), 'Mother');
   //console.log(JSON.stringify(sfRecordMapping, null, 2), 'sfRecordMapping');
  // console.log(JSON.stringify(householdMapping, null, 2), 'householdMapping');
  // console.log(
  //   JSON.stringify(headOfHouseholdMapping, null, 2),
  //   'headOfHouseholdMapping'
  // );

  return {
    ...state,
    motherMapping,
    sfRecordMapping,
    caregiverMapping,
    householdMapping,
    headOfHouseholdMapping,
  };
});


// TODO, Clean up when pass QA
 /*fn(state => {
   state.sfRecordMapping.forEach(rec => {
    Object.entries(rec).forEach(([key, value]) => {
       if (typeof key !== 'string') throw `${key} is not a string`;
    });
   });
   return state;
 });
*/
// bulk(
//   'Household__c',
//   'upsert',
//   {
//     extIdField: 'CommCare_Code__c',
//     failOnError: true,
//     allowNoOp: true,
//   },
//   state => {
//     console.log('Bulk upserting...');
//     return state.householdMapping;
//   }
// );

// TODO, Clean up when pass QA
// upsert data to SF
// upsertIf(
//   state.data.properties.commcare_username !== 'test.2021' &&
//     state.data.properties.test_user !== 'Yes',
//   'Person__c',
//   'CommCare_ID__c',
//   state => state.sfRecord
// );

bulk(
  'Person__c',
  'upsert',
  {
    extIdField: 'CommCare_ID__c',
    failOnError: true,
    allowNoOp: true,
    pollTimeout: 360000,
  },
  state => {
    console.log('Bulk upserting persons ::');
    //HMN commented this
    //console.log(JSON.stringify(state.sfRecordMapping, null, 2));
    return state.sfRecordMapping;
  }
);
// TODO, Clean up when pass QA
// upsertIf(
//   state.data.properties.commcare_username !== 'test.2021' &&
//     state.data.properties.test_user !== 'Yes' &&
//     state.data.properties.caretaker_case_id !== undefined &&
//     state.data.properties.caretaker_case_id !== '',
//   'Person__c',
//   'CommCare_ID__c',
//   fields(
//     relationship('Primary_Caregiver_Lookup__r', 'CommCare_ID__c', state => {
//       return (caregiver = dataValue('properties.caretaker_case_id')(state));
//     }),
//     field('CommCare_ID__c', dataValue('case_id'))
//   )
// );

bulk(
  'Person__c',
  'upsert',
  {
    extIdField: 'CommCare_ID__c',
    failOnError: true,
    allowNoOp: true,
    pollTimeout: 360000,
  },
  state => {
    console.log('Bulk upserting primary caregiver Persons ::');
    //console.log(JSON.stringify(state.caregiverMapping, null, 2));
    return state.caregiverMapping;
  }
);

// TODO, Clean up when pass QA
// upsertIf(
//   state.data.properties.commcare_username !== 'test.2021' &&
//     state.data.properties.test_user !== 'Yes' &&
//     state.data.properties.mother_case_id !== undefined &&
//     state.data.properties.mother_case_id !== '',
//   'Person__c',
//   'CommCare_ID__c',
//   fields(
//     relationship('Mother__r', 'CommCare_ID__c', state => {
//       return (caregiver = dataValue('properties.mother_case_id')(state));
//     }),
//     field('CommCare_ID__c', dataValue('case_id'))
//   )
// );
bulk(
  'Person__c',
  'upsert',
  {
    extIdField: 'CommCare_ID__c',
    failOnError: true,
    allowNoOp: true,
    pollTimeout: 360000,
  },
  state => {
    console.log('Bulk upserting mother Person::');
   // console.log(JSON.stringify(state.motherMapping, null, 2));
    return state.motherMapping;
  }
);

// TODO, Clean up when pass QA
// upsertIf(
//   state.data.properties.commcare_username !== 'test.2021' &&
//     state.data.properties.test_user !== 'Yes' &&
//     state.data.properties.head_of_household_case_id !== undefined &&
//     state.data.properties.head_of_household_case_id !== '',
//   'Household__c',
//   'CommCare_Code__c',
//   fields(
//     field('CommCare_Code__c', dataValue('indices.parent.case_id')),
//     relationship(
//       'Head_of_Household__r',
//       'CommCare_ID__c',
//       dataValue('properties.head_of_household_case_id')
//     )
//   )
// );

bulk(
  'Household__c',
  'upsert',
  {
    extIdField: 'CommCare_Code__c',
    failOnError: true,
    allowNoOp: true,
    concurrencyMode: 'serial',
    pollTimeout: 360000,
  },
  state => {
    console.log('Bulk upserting head of household field on HH ::');
   // console.log(JSON.stringify(state.headOfHouseholdMapping, null, 2));
    return state.headOfHouseholdMapping;
  }
);
