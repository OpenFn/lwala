// create constants and functions
fn(state => {
  state.cleanChoice = function (state, choice) {
    if (choice) {
      return choice.charAt(0).toUpperCase() + choice.slice(1).replace('_', ' ');
    } else {
      return '';
    }
  };

  state.handleMultiSelect = function (state, multiField) {
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
  };
});

// get data from SF
query(
  `SELECT Id, Parent_Geographic_Area__c, Parent_Geographic_Area__r.Name, Parent_Geographic_Area__r.Parent_Geographic_Area__c FROM Location__c WHERE CommCare_User_ID__c = '${dataValue(
    'properties.owner_id'
  )(state)}'`
);

// build IDs from queried SF data
fn(state => ({
  ...state,
  data: {
    ...state.data,
    villageNewId:
      state.references[0].records && state.references[0].records.length !== 0
        ? state.references[0].records[0].Id
        : undefined,
    areaNewId:
      state.references[0].records && state.references[0].records.length !== 0
        ? state.references[0].records[0].Parent_Geographic_Area__c
        : undefined,
    catchmentNewId:
      state.references[0].records && state.references[0].records.length !== 0
        ? state.references[0].records[0].Parent_Geographic_Area__r
          ? state.references[0].records[0].Parent_Geographic_Area__r
              .Parent_Geographic_Area__c
          : undefined
        : undefined,
  },
}));

upsertIf(
  state.data.properties.commcare_username !== 'openfn.test' &&
    state.data.properties.commcare_username !== 'test.2022' &&
    state.data.properties.test_user  !== 'No', 
  'Household__c',
  'CommCare_Code__c',
  fields(
    field('CommCare_Code__c', state => {
      return (
        dataValue('indices.parent.case_id')(state) ||
        dataValue('properties.parent_id')(state)
      );
    })
  )
),

// build sfRecord before upserting
fn(state => {
  // This mapping was initially constructed with fields(field(), ...) syntax. We
  // preserve it here and use "expandReferences" but could also refactor this to
  // use standard object syntax, as Salesforce looks for { k: v, ... }.
  const originalMapping = fields(
    field('Source__c', 1),
    field('CommCare_ID__c', dataValue('case_id')),
    relationship(
      'Household__r',
      'CommCare_Code__c',
      dataValue('indices.parent.case_id')
    ),
    field('commcare_location_id__c',dataValue('properties.commcare_location_id')),
    field('CommCare_Username__c',dataValue('properties.commcare_username')),
    field('Telephone__c', dataValue('properties.contact_phone_number')), 
    field(
      'Consent_for_data_use__c',
      dataValue('properties.data_sharing_consent')
    ),
    field('CommCare_HH_Code__c', dataValue('indices.parent.case_id')),
    field('Client_Status__c', dataValue('properties.Client_Status')),
    field('Catchment__c', dataValue('catchmentNewId')),
    field('Area__c', dataValue('areaNewId')),
    field('Household_Village__c', dataValue('villageNewId')),
    field('Name', state => {
      var name1 = dataValue('properties.Person_Name')(state); //check
      var unborn = dataValue('properties.name')(state); //check
      var name2 =
        name1 === undefined || name1 === '' || name1 === null
          ? unborn
          : name1.replace(/\w\S*/g, function (txt) {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
      return name1 !== null ? name2 : 'Unborn Child';
    }),
    field('Chronic_illness__c', state => {
      var choice = dataValue(
        'properties.please_specify_which_chronic_illness_the_person_has'
      )(state);
      var choice2 = state.handleMultiSelect(state, choice);
      return choice2 ? choice2.replace(/_/g, ' ') : '';
    }),
    field(
      'Currently_enrolled_in_school__c',
      dataValue('properties.enrolled_in_school')
    ),
    field('Education_Level__c', state => {
      var level = dataValue('properties.Education_Level')(state);
      return level ? level.toString().replace(/_/g, ' ') : null;
    }),
    field('Relation_to_the_head_of_the_household__c', state => {
      var relation = dataValue('properties.relation_to_hh')(state);
      if (relation) {
        relation = relation.toString().replace(/_/g, ' ');
        var toTitleCase = relation.charAt(0).toUpperCase() + relation.slice(1);
        return toTitleCase;
      }

      return null;
    }),
    field('Gender__c',dataValue('properties.Gender')),
    field('Disability__c', state => {
      var disability = dataValue('properties.disability')(state);
      var toTitleCase =
        disability !== undefined
          ? disability
              .toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(';')
          : null;
      return toTitleCase;
    }), //need case property
    field('Other_disability__c', state => {
      var disability = dataValue('properties.other_disability')(state);
      var toTitleCase =
        disability !== undefined
          ? disability
              .toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(';')
          : null;
      return toTitleCase;
    }), //need case property

    field('Use_mosquito_net__c', dataValue('properties.sleep_under_net')), //need case property
    // field('Birth_Certificate__c',dataValue('properties.birth_certificate')),
    field('Birth_Certificate__c', dataValue('properties.birth_certificate')),
    field('Child_Status__c', state => {
      var status = dataValue('properties.Child_Status')(state);
      var rt = dataValue('properties.Record_Type')(state); //check that this is the right one
      if (status && rt === 'Unborn') {
        status = 'Unborn';
      } else if (status && rt === 'Born') {
        status = 'Born';
      }
      return status;
    }),
    //===================================================//
    relationship('RecordType', 'Name', state => {
      var rt = dataValue('properties.Record_Type')(state);
      return rt === 'Unborn' || rt === ''
        ? 'Child'
        : rt.toString().replace(/_/g, ' '); //convert Unborn children to Child RT
    }),

    //TT5 Mother Information

    field('MCH_booklet__c', dataValue('properties.mch_booklet')), //need to create a case property
    field('Reason_for_not_taking_a_pregnancy_test__c', state => {
      var reason = dataValue('properties.No_Preg_Test')(state);
      return reason ? reason.toString().replace(/_/g, ' ') : undefined;
    }),
    field('Pregnancy_danger_signs__c', state => {
      var signs = dataValue('properties.pregnancy_danger_signs')(state);
      return signs ? state.pregDangerMap[signs] : undefined;
    }),
    field(
      'Individual_birth_plan_counselling__c',
      dataValue('properties.individual_birth_plan')
    ),
    field('Child_Danger_Signs__c', state => {
      var signs = dataValue('properties.Other_Danger_Signs')(state);
      return signs
        ? signs
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(';')
            .toString()
            .replace(/_/g, ' ')
        : signs;
    }),

    //HAWI
    field(
      'Unique_Patient_Code__c',
      dataValue('properties.Unique_Patient_Code')
    ),
    field(
      'Active_in_Support_Group__c',
      dataValue('properties.Active_in_Support_Group')
    ),
    field(
      'Preferred_Care_Facility__c',
      dataValue('properties.Preferred_Care_Facility')
    ),
    field('Currently_on_ART_s__c', dataValue('properties.ART')),
    field('ART_Regimen__c', dataValue('properties.ARVs')),
    field('HAWI_Defaulter__c', state => {
      var hawi = dataValue('properties.default')(state);
      return hawi === 'Yes' ? true : false;
    }),
    field('Date_of_Default__c', dataValue('properties.date_of_default')),
    field('Know_HIV_status__c', dataValue('properties.known_hiv_status')),
    field('HIV_Status__c', dataValue('properties.hiv_status')),
    /*field('HIV_Status__c', state => {
          var status = dataValue('properties.hiv_status')(state);
          return status === 'yes'
            ? 'Known'
            : status === 'no'
            ? 'Unknown'
            : undefined;
        }),//CHECK MAPPING ON THIS ONE*/

    //Illness
    field('Persons_temperature__c', dataValue('properties.temperature')),
    field(
      'Days_since_illness_start__c',
      dataValue('properties.duration_of_sickness')
    ),
    field(
      'Current_Malaria_Status__c',
      dataValue('properties.malaria_test_results')
    ),
    field('Malaria_test__c', dataValue('properties.malaria_test')),
    field(
      'Last_Malaria_Home_Test__c',
      dataValue('properties.malaria_test_date')
    ),
    field('Cough_over_14days__c', dataValue('properties.symptoms_check_cough')),
    field(
      'TB_patients_therapy_observed__c',
      dataValue('properties.observed_tb_therapy')
    ),
    field('Injuries_or_wounds__c', dataValue('properties.wounds_or_injuries')),
    field(
      'Pulse_Oximeter__c',
      dataValue('properties.pulse_oximeter_available')
    ),
    field(
      'Heart_Rate_Pulse_Oximeter__c',
      dataValue('properties.heart_rate_pulse_oximeter')
    ),
    field(
      'Oxygen_Concentration_Pulse_Oximeter__c',
      dataValue('properties.oxygen_concentration')
    ),
    field('Can_child_drink__c', dataValue('properties.can_child_drink')),
    // field('Antibiotic_provided_for_fast_breathing__c',dataValue('properties.antibiotic_fast_breathing')),
    field('Antibiotic_provided_for_fast_breathing__c', state => {
      var choice = dataValue('properties.antibiotic_fast_breathing')(state);
      return state.cleanChoice(state, choice);
    }),
    // field('Antibiotic_provided_for_chest_indrawing__c',dataValue('properties.antibiotic_chest_indrawing')),
    field('Antibiotic_provided_for_chest_indrawing__c', state => {
      var choice = dataValue('properties.antibiotic_chest_indrawing')(state);
      return state.cleanChoice(state, choice);
    }),
    /*field('Child_zinc__c',dataValue('form.TT5.Child_Information.Clinical_Services.diarrhea_clinic_treatment_zinc')),//check
        field('Child_ORS__c',dataValue('form.TT5.Child_Information.Clinical_Services.diarrhea_clinic_treatment_ORS')),//check*/
    field('Default_on_TB_treatment__c', state => {
      var choice = dataValue('properties.default_tb_treatment')(state); //check
      return state.cleanChoice(state, choice);
    }),
    field('Treatment_Distribution__c', state => {
      var choice = dataValue('properties.distributed_treatments')(state);
      return state.cleanChoice(state, choice);
    }), //check

    //Delivery
    field(
      'Immediate_Breastfeeding__c',
      dataValue('properties.Breastfeeding_Delivery')
    ),
    field('Place_of_Delivery__c', state => {
      var facility = dataValue('properties.Delivery_Type')(state);
      return facility === 'Skilled'
        ? 'Facility'
        : facility === 'Unskilled'
        ? 'Home'
        : undefined;
    }),
    field('Delivery_Facility__c', state => {
      var facility = dataValue('properties.Delivery_Facility')(state);
      return facility ? facility.toString().replace(/_/g, ' ') : null;
    }),
    field(
      'Delivery_Facility_Other__c',
      dataValue('properties.Delivery_Facility_Other')
    ),

    //Family Planning

    field('LMP__c', dataValue('properties.LMP')),
    field('Family_Planning__c', dataValue('properties.family_planning')),
    field(
      'Family_Planning_Method__c',
      dataValue('properties.family_planning_method')
    ),
    field('FP_Method_Distributed__c', state => {
      var status = dataValue('properties.FP_commodity')(state);
      var value =
        status && status !== ''
          ? status
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return state.fpMethodMap[value] || value;
              })
          : undefined;
      return value ? value.join(';') : undefined;
    }),
    field('Reasons_for_not_taking_FP_method__c', state => {
      var status = dataValue('properties.No_FPmethod_reason')(state);
      var value =
        status && status !== ''
          ? status
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return state.reasonMapping[value] || value;
              })
          : undefined;
      return value ? value.join(';') : undefined;
    }),
    field('Pregnant__c', state => {
      var preg = dataValue('properties.Pregnant')(state);
      return preg === 'Yes' ? true : false;
    }),
    field('Date_of_Delivery__c', dataValue('properties.delivery_date')),
    field(
      'Counselled_on_FP_Methods__c',
      dataValue('properties.CounselledFP_methods')
    ),
    field('Client_counselled_on__c', state => {
      var choices =
        dataValue('properties.counsel_topic')(state) ||
        dataValue('properties.counsel_topic')(state); //need to create a case property
      var choiceGroups = choices ? choices.split(' ') : null;
      var choicesMulti = choiceGroups
        ? choiceGroups
            .map(cg => {
              return state.counselMap[cg];
            })
            .join(';')
        : choiceGroups;
      return choicesMulti;
    }), //OpenFn Question - can this be simplified now that this is a case property
    field('Client_provided_with_FP__c', state => {
      var choice = dataValue(
        'properties.was_the_woman_15-49yrs_provided_with_family_planning_commodities_by_chv'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field(
      'Received_pregnancy_test__c',
      dataValue('properties.did_you_adminsiter_a_pregnancy_test')
    ),
    field(
      'Pregnancy_test_result__c',
      dataValue('properties.pregnancy_test_result')
    ),
    field('Gravida__c', dataValue('properties.Gravida')),
    field('Parity__c', dataValue('properties.Parity')),

    //TT5 Child Information

    field(
      'Exclusive_Breastfeeding__c',
      dataValue('properties.Exclusive_Breastfeeding')
    ),
    field(
      'Counselled_on_Exclusive_Breastfeeding__c',
      dataValue('properties.counseling')
    ),
    field(
      'Newborn_visited_48_hours_of_delivery__c',
      dataValue('properties.newborn_visited_48_hours_of_delivery')
    ),
    field('Newborn_visit_counselling__c', state => {
      var choice = dataValue('properties.did_you_consel_the_mother_on1')(state);
      return state.cleanChoice(state, choice);
    }),
    field(
      'mother_visited_48_hours_of_the_delivery__c',
      dataValue('properties.visit_mother_48')
    ),
    field(
      'Visit_after_unskilled__c',
      dataValue('properties.visit_24hours_after_unskilled_delivery')
    ),
    field('Mother_visit_counselling__c', state => {
      var choice = dataValue('properties.did_you_consel_the_mother_on2')(state);
      return state.cleanChoice(state, choice);
    }),
    /*field('Newborn_visited_48_hours_of_delivery__c',dataValue('properties.newborn_visited_48_hours_of_delivery')), Duplicate Mapping*/
    field(
      'Newborn_visited_by_a_CHW_within_6_days__c',
      dataValue('properties.visit_6_days_from_delivery')
    ),

    //Nutrition

    field(
      'Caretaker_action_after_muac_screening__c',
      dataValue('properties.mother_screened_muac_action')
    ),
    field(
      'Caretaker_muac_findings__c',
      dataValue('properties.mother_screened_child_muac_result')
    ),
    field('Food_groups_3_times_a_day__c',dataValue('properties.food_groups')),
    // field('Caretaker_screened_for_muac_this__c', dataValue('properties.mother_screened_child_muac')),
    field('Caretaker_screened_for_muac_this__c', state => {
      var choice = dataValue('properties.mother_screened_child_muac')(state); //check
      return state.cleanChoice(state, choice);
    }),
    // field('Caretaker_trained_in_muac__c', dataValue('properties.mother_trained_muac')),
    field('Caretaker_trained_in_muac__c', state => {
      var choice = dataValue('properties.mother_trained_muac')(state); //check
      return state.cleanChoice(state, choice);
    }),
    field(
      'of_Caretaker_MUAC_screenings__c',
      dataValue('properties.mother_nb_screening')
    ),
    field('Current_Weight__c', dataValue('properties.Current_Weight')), //Only on task update
    field('Current_Height__c', dataValue('properties.current_height')),
    field('Current_MUAC__c', dataValue('properties.MUAC')),
    field('Current_Nutrition_Status__c', state => {
      var status = dataValue('properties.Nutrition_Status')(state);
      return status ? state.nutritionMap[status] : undefined;
    }),

    //TT5 & HAWI
    field('TT5_Mother_Registrant__c', state => {
      var preg = dataValue('properties.Pregnant')(state);
      return preg == 'Yes' ? 'Yes' : null;
    }),
    field('Enrollment_Date__c', state => {
      var age = dataValue('properties.age')(state);
      var date = dataValue('server_date_modified')(state);
      var preg = dataValue('properties.Pregnant')(state);
      return age < 5 || preg == 'Yes' ? date : null;
    }),
    field('HAWI_Enrollment_Date__c', state => {
      var date = dataValue('server_date_modified')(state);
      var status = dataValue('properties.hiv_status')(state);
      return status == 'positive' ? date : null;
    }),
    field('Thrive_Thru_5_Registrant__c', state => {
      var age = dataValue('properties.age')(state);
      var preg = dataValue('properties.Pregnant')(state);
      return age < 5 || preg == 'Yes' ? 'Yes' : 'No';
    }), //check mapping
    field('HAWI_Registrant__c', state => {
      var status = dataValue('properties.hiv_status')(state);
      return status == 'positive' ? 'Yes' : 'No';
    }),

    //ANC
    field('ANC_1__c', state => {
      var date = dataValue('properties.ANC_1')(state);
      return date && date !== '' ? date : undefined;
    }),
    field('ANC_2__c', state => {
      var date = dataValue('properties.ANC_2')(state);
      return date && date !== '' ? date : undefined;
    }),
    field('ANC_3__c', state => {
      var date = dataValue('properties.ANC_3')(state);
      return date && date !== '' ? date : undefined;
    }),
    field('ANC_4__c', state => {
      var date = dataValue('properties.ANC_4')(state);
      return date && date !== '' ? date : undefined;
    }),
    field('ANC_5__c', state => {
      var date = dataValue('properties.ANC_5')(state);
      return date && date !== '' ? date : undefined;
    }),
    field('Date_of_Birth__c', state => {
      var date = dataValue('properties.DOB')(state);
      return date && date !== '' ? date : undefined;
    }),

    //Immunization

    field(
      'Child_missed_immunization_type__c',
      dataValue('properties.immunization_type')
    ), //check
    field('BCG__c', dataValue('properties.BCG')),
    field('OPV_0__c', dataValue('properties.OPV_0')),
    field('Measles_6__c', dataValue('properties.Measles_6')),
    field('Measles_9__c', dataValue('properties.Measles_9')),
    field('Measles_18__c', dataValue('properties.Measles_18')),
    field('OPV_1__c', dataValue('properties.OPV_PCV_Penta_1')),
    field('OPV_2__c', dataValue('properties.OPV_PCV_Penta_2')),
    field('OPV_3__c', dataValue('properties.OPV_PCV_Penta_3')),
    field('Rotavirus_1__c', dataValue('properties.rotavirus_1')),
    field('Rotavirus_2__c', dataValue('properties.rotavirus_2')),
    field('IPV__c', dataValue('properties.IPV')),
    field('Vitamin_A_12__c', dataValue('properties.Vitamine_A')),
    field('Vitamin_A_18__c', dataValue('properties.Vitamine_A_2')),
    field('Vitamin_A_24__c', dataValue('properties.Vitamine_A_3')),
    field('Deworming_12__c', dataValue('properties.Deworming_1')),
    field('Deworming_18__c', dataValue('properties.Deworming_2')),
    field('Deworming_24__c', dataValue('properties.Deworming_3')),

    //ECD
    // field('Did_you_counsel_caregiver_on__c',dataValue('properties.did_you_counsel_the_caregiver_on_delayed_milestones')),
    field('Did_you_counsel_caregiver_on__c', state => {
      var choice = dataValue(
        'properties.did_you_counsel_the_caregiver_on_delayed_milestones'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    // field('Delayed_Milestone__c',dataValue('properties.does_the_child_has_a_delayed_milestone')),
    field('Delayed_Milestone__c', state => {
      var choice = dataValue(
        'properties.does_the_child_has_a_delayed_milestone'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    // field('Child_has_2_or_more_play_items__c',dataValue('properties.does_the_child_has_2_or_more_play_items_at_home')),
    field('Child_has_2_or_more_play_items__c', state => {
      var choice = dataValue(
        'properties.does_the_child_has_2_or_more_play_items_at_home'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    // field('Child_has_3_or_more_picture_books__c',dataValue('properties.does_the_child_has_3_or_more_picture_books')),
    field('Child_has_3_or_more_picture_books__c', state => {
      var choice = dataValue(
        'properties.does_the_child_has_3_or_more_picture_books'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field('Delayed_Milestones_Counselled_On__c', state => {
      var ms = dataValue(
        'properties.which_delayed_milestone_area_did_you_counsel_the_caregiver_on'
      )(state);
      return ms ? state.milestoneMap[ms] : undefined;
    }),
    field('Delayed_Milestone_Type__c', state => {
      var ms = dataValue('properties.which_delayed_milestone')(state);
      return ms ? state.milestoneTypeMap[ms] : undefined;
    }),

    //Death
    field('Date_of_Death__c', dataValue('properties.Date_of_Death')),
    field('Cause_of_Death__c', state => {
      var death = dataValue('properties.cause_of_death_dead')(state);
      return death ? death.toString().replace(/_/g, ' ') : death;
    }), //check which case property to use - there are 2
    field('Verbal_autopsy__c', dataValue('properties.verbal_autopsy')),

    //Closing
    field('Last_Modified_Date_CommCare__c', dataValue('date_modified')),
    field('Case_Closed_Date__c', state => {
      var closed = dataValue('date_closed')(state);
      var date = dataValue('date_modified')(state);
      return closed && closed == true ? date : undefined;
    }) //need case property
  );

  let sfRecord = expandReferences(originalMapping)(state);

  Object.entries(sfRecord).forEach(([key, value]) => {
    if (value === '') sfRecord[key] = undefined;
  });

  return { ...state, sfRecord };
});

// upsert data to SF
upsertIf(state.data.properties.commcare_username !== 'openfn.test' &&
    state.data.properties.commcare_username !== 'test.2022' &&
    state.data.properties.test_user  !== 'No' ,
  'Person__c', 'CommCare_ID__c', state => state.sfRecord);

upsertIf(state.data.properties.commcare_username !== 'openfn.test' &&
    state.data.properties.commcare_username !== 'test.2022' &&
    state.data.properties.test_user  !== 'No' &&
    state.data.properties.caretaker_case_id !== undefined && state.data.properties.caretaker_case_id !== '', 
    'Person__c', 'CommCare_ID__c', 
    fields(
      relationship('Primary_Caregiver_Lookup__r', 'CommCare_ID__c', state => {
      return caregiver = dataValue('properties.caretaker_case_id')(state);
      }),
     field('CommCare_ID__c', dataValue('case_id')),
    )
);

upsertIf(state.data.properties.commcare_username !== 'openfn.test' &&
    state.data.properties.commcare_username !== 'test.2022' &&
    state.data.properties.test_user  !== 'No' &&
    state.data.properties.mother_case_id !== undefined && state.data.properties.mother_case_id !== '', 
    'Person__c', 'CommCare_ID__c', 
    fields(
      relationship('Mother__r', 'CommCare_ID__c', state => {
      return caregiver = dataValue('properties.mother_case_id')(state);
      }),
      field('CommCare_ID__c', dataValue('case_id')),
    )
);

upsertIf(state.data.properties.commcare_username !== 'openfn.test' &&
    state.data.properties.commcare_username !== 'test.2022' &&
    state.data.properties.test_user  !== 'No' &&
  state.data.properties.head_of_household_case_id  !== undefined  && state.data.properties.head_of_household_case_id !== '', 
  'Household__c', 'CommCare_Code__c',
  fields(
    field('CommCare_Code__c', dataValue('indices.parent.case_id')),
    relationship('Head_of_Household__r', 'CommCare_ID__c', dataValue('properties.head_of_household_case_id')),
      )
  )
  
  //UPSERT PERSON VISIT
  query(
  `SELECT Id, Parent_Geographic_Area__c, Parent_Geographic_Area__r.Name, Parent_Geographic_Area__r.Parent_Geographic_Area__c FROM Location__c WHERE CommCare_User_ID__c = '${dataValue(
    'properties.owner_id'
  )(state)}'`
);

fn(state => {
  state.cleanChoice = function (state, choice) {
    if (choice) {
      return choice.charAt(0).toUpperCase() + choice.slice(1).replace('_', ' ');
    } else {
      return '';
    }
  };

fn(state => ({
  ...state,
  data: {
    ...state.data,
    catchmentNewId:
      state.references[0].records && state.references[0].records.length !== 0
        ? (state.references[0].records[0].Parent_Geographic_Area__r 
          ? state.references[0].records[0].Parent_Geographic_Area__r.Parent_Geographic_Area__c
          : undefined)
        : undefined,
  },
}));

  state.handleMultiSelect = function (state, multiField) {
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

  state.handleMultiSelectOriginal = function (state, multiField) {
    return multiField
      ? multiField
          .replace(/ /gi, ';')
          .toLowerCase()
          .split(';')
          .map(value => {
            return (
              value
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

  const reasonMap = {
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
    male_condoms: "Male condoms",
    female_condoms: "Female condoms",
    pop: "POP",
    coc: "COC",
    emergency_pills: "Emergency pills",
    none: "None"
  };

  const symptomsMap = {
    convulsions: 'Convulsions',
    not_able_to_eatdrink: 'Not able to drink or feed at all',
    vomits_everything: 'Vomits everything',
    'chest_in-drawing': 'Chest in - drawing',
    unusually_sleepyunconscious: 'Unusually sleepy/unconscious',
    swelling_of_both_feet: 'Swelling of both feet',
    none: "None",
  };

  const supervisorMap ={
    community_health_nurse: "Community_health_nurse",
    chw_supervisor: "CHW_supervisor",
    chewschas: "Chewschas",
    other: "Other",
    none: "None"
  };
  
  const treatmentDistributionMap = {
    ors_205gltr_sachets: 'ORS (20.5h/ltr): Sachets',
    acts_6s: 'ACTs (6s)',
    acts_12s: 'ACTs (12s)',
    acts_18s: 'ACTs (18s)',
    acts_24s: 'ACTs (24s)',
    albendazole_abz_tabs: 'Albendazole (ABZ): Tabs',
    paracetamol_tabs: 'Tetracycline Eye Ointment (TEO): 1%:tube',
    tetracycline_eye_ointment_teo_1_tube: 'Tetracycline Eye Ointment (TEO): 1%:tube',
    amoxycillin: 'Amoxycillin (125mg/5mls: Bottle',
    none: 'None'
}

  return {
    ...state,
    counselMap,
    serviceMap,
    reasonMap,
    milestoneTypeMap,
    milestoneMap,
    nutritionMap,
    pregDangerMap,
    fpMethodMap,
    symptomsMap,
    supervisorMap,
    treatmentDistributionMap
  };
});

upsertIf(state.data.properties.username !== 'openfn.test' &&
    state.data.properties.username !== 'test.2022' &&
    state.data.properties.test_user  !== 'No' ,
  'Person_visit__c',
  'CommCare_ID__c',
  fields(
    //field('CommCare_ID__c', dataValue('form.case.@case_id')),
    // field('CommCare_ID__c', dataValue('id')),
    field('CommCare_ID__c', state => {
      var case_id = dataValue('case_id')(state);
      var submitted = dataValue('properties.last_form_submitted_date_and_time')(state);
      return case_id + '_' +  submitted;
    }),

    relationship(
      'Person__r',
      'CommCare_ID__c',
      dataValue('case_id')  //this is a HH case ID
    ),
    /*relationship(
      'Household_CHW__r', 
      'CommCare_ID__c', 
      dataValue('properties.sfid')),*/
    field('CommCare_Visit_ID__c',dataValue('metadata.instanceID')),
    field('Date__c',dataValue('properties.Date')),
    field('Form_Submitted__c', dataValue('last_form_submitted_for_this_record')),
    field('Birth_Status__c',dataValue('properties.child_status')),
    field('Catchment__c', dataValue('catchmentNewId')),
    relationship('RecordTypeId', 'Name', state => {
          var rt = dataValue('properties.Record_Type')(state);
          if (rt === 'Unborn' || rt === 'Child') {
            return 'Child Visit';
          };
          if (rt === 'Youth') {
            return 'Youth Visit';
          };
          if (rt === 'Male Adult') {
            return 'Adult Male Visit';
          };
          if (rt === 'Female Adult') {
            return 'Adult Female Visit';
          };
        }),
    field('Use_mosquito_net__c', state => {
      var choice = dataValue(
        'properties.sleep_under_net'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field(
      'Individual_birth_plan_counselling__c',
      dataValue('properties.individual_birth_plan')
    ),
    field('Reason_for_not_taking_a_pregnancy_test__c', state => {
      var reason = dataValue('properties.No_Preg_Test')(state);
      return reason ? reason.toString().replace(/_/g, ' ') : undefined;
    }),
    field('Pregnancy_danger_signs__c', state => {
      var signs = dataValue(
        'properties.No_Preg_Test'
      )(state);
      return signs ? state.pregDangerMap[signs] : undefined;
    }),
    field('Other_Danger_Signs__c', state => {
      var signs = dataValue(
        'properties.Other_Danger_Signs'
      )(state);
      return signs
        ? signs
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(';')
            .toString()
            .replace(/_/g, ' ')
        : signs;
    }),
     field('Current_Malaria_Status__c', state => {
      var choice = dataValue(
        'properties.malaria_test_results'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field('Malaria_Home_Test__c', dataValue('properties.malaria_test_date')),
    /*field('Current_Malaria_Status__c', state => {
      var choice = dataValue(
        'properties.Malaria_Status'
      )(state);
      return state.cleanChoice(state, choice);
    }),*/
    // field('Malaria_Home_Treatment__c',dataValue('form.treatment_and_tracking.home_treatment')),
    field('Malaria_Home_Treatment__c', state => {
      var choice = dataValue(
        'properties.malaria_test_date'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field('Persons_symptoms__c', state => {
      var check = dataValue('properties.symptoms_check_other')(state);
      var value =
        check && check !== ''
          ? check
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return state.symptomsMap[value] || value;
              })
          : undefined;
      return value ? value.join(';') : undefined;
    }),
    field('Active_in_Support_Group__c', dataValue('properties.Active_in_Support_Group')),
    field('HAWI_Defaulter__c', state => {
      var hawi = dataValue('properties.default')(state);
      return hawi === 'Yes' ? true : false;
    }),
    field(
      'Date_of_Default__c',
      dataValue('properties.date_of_default')
    ),
    field(
      'Persons_temperature__c',
      dataValue('properties.temperature')
    ),
    field(
      'Days_since_illness_start__c',
      dataValue('properties.duration_of_sickness')
    ),
    field(
      'Newborn_visited_48_hours_of_delivery__c',
      dataValue(
        'properties.newborn_visited_48_hours_of_delivery'
      )
    ),
    field(
      'Newborn_visited_by_a_CHW_within_6_days__c',
      dataValue('properties.visit_6_days_from_delivery')
    ),
    field(
      'Current_Malaria_Status__c',
      dataValue('properties.malaria_test_results')
    ),
    field('Malaria_test__c', state => {
      var choice = dataValue(
        'properties.malaria_test'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field('Fever__c', state => {
      var choice = dataValue(
        'properties.symptoms_check_fever'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field('Cough__c', state => {
      var choice = dataValue(
        'properties.symptoms_check_cough'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field('Diarrhoea__c', state => {
      var choice = dataValue(
       'properties.symptoms_check_diarrhea'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field(
      'TB_patients_therapy_observed__c',
      dataValue('properties.observed_tb_therapy')
    ),
    field(
      'Injuries_or_wounds__c',
      dataValue('properties.wounds_or_injuries')
    ),
    field('Currently_on_ART_s__c', dataValue('properties.ART')),
    field('ART_Regimen__c', dataValue('properties.ARVs')),
    field(
      'Immediate_Breastfeeding__c',
      dataValue(
        'properties.Breastfeeding_Delivery'
      )
    ),
    field(
      'Exclusive_Breastfeeding__c',
      dataValue(
        'properties.Exclusive_Breastfeeding'
      )
    ),
    field(
      'Counselled_on_Exclusive_Breastfeeding__c',
      dataValue('properties.counseling')
    ),
    field('LMP__c',dataValue('properties.LMP')),
     field('Family_Planning__c', state => {
      var choice = dataValue(
        'properties.family_planning'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field(
      'Family_Planning_Method__c',
      dataValue('properties.family_planning_method')
    ),
     field('FP_Method_Distributed__c', state => {
          //var status = dataValue('form.treatment_and_tracking.distribution.distributed_treatments')(state);
          var status = dataValue('properties.FP_commodity')(state);
          var value =
            status && status !== ''
              ? status
                  .replace(/ /gi, ';')
                  .split(';')
                  .map(value => {
                    return state.fpMethodMap[value] || value;
                  })
              : undefined;
          return value ? value.join(';') : undefined;
        }),
    field('Reasons_for_not_taking_FP_method__c', state => {
      // var reason = dataValue('form.TT5.Mother_Information.No_FPmethod_reason')(state);
      // return reason ? state.reasonMap[reason] : undefined;
      var status = dataValue('properties.No_FPmethod_reason')(state);
          var value =
            status && status !== ''
              ? status
                  .replace(/ /gi, ';')
                  .split(';')
                  .map(value => {
                    return state.reasonMap[value] || value;
                  })
              : undefined;
          return value ? value.join(';') : undefined;
    }),
    field('Pregnant__c', state => {
      var preg = dataValue('properties.Pregnant')(state);
      return preg === 'Yes' ? true : false;
    }),
    field('Counselled_on_FP_Methods__c', state => {
      var choice = dataValue(
       'properties.CounselledFP_methods'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field('Client_counselled_on__c', state => {
      var choices =
        dataValue('properties.counsel_topic')(
          state
        ) || dataValue('properties.counsel_topic')(state);
      var choiceGroups = choices ? choices.split(' ') : null;
      var choicesMulti = choiceGroups
        ? choiceGroups
            .map(cg => {
              return state.counselMap[cg];
            })
            .join(';')
        : choiceGroups;
      return choicesMulti;
    }),
    field('Client_provided_with_FP__c', state => {
      var choice = dataValue(
        'properties.was_the_woman_15-49yrs_provided_with_family_planning_commodities_by_chv'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field(
      'Newborn_visited_48_hours_of_delivery__c',
      dataValue(
        'properties.newborn_visited_48_hours_of_delivery'
      )
    ),
    field('Mother_visit_counselling__c', state => {
      var choice = dataValue(
        'properties.did_you_consel_the_mother_on1'
      )(state);
      return state.handleMultiSelectOriginal(state, choice);
    }),
    field(
      'mother_visited_48_hours_of_the_delivery__c',
      dataValue('properties.visit_mother_48')
    ),
    field('Newborn_visit_counselling__c', state => {
      var choice = dataValue(
        'properties.did_you_consel_the_mother_on2'
      )(state);
      return state.handleMultiSelectOriginal(state, choice);
    }),
    field('Know_HIV_status__c', state => {
      var choice = dataValue(
        'properties.known_hiv_status'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field('HIV_Status__c', dataValue('properties.hiv_status')),
    field('Treatment_Distribution__c', state => {
          //var status = dataValue('form.treatment_and_tracking.distribution.distributed_treatments')(state);
          var status = dataValue('properties.distributed_treatments')(state);
          var value =
            status && status !== ''
              ? status
                  .replace(/ /gi, ';')
                  .split(';')
                  .map(value => {
                    return state.treatmentDistributionMap[value] || value;
                  })
              : undefined;
          return value ? value.join(';') : undefined;
        }),
    field(
      'Current_Weight__c',
      dataValue('properties.Current_Weight')
    ),
    field(
      'Current_Height__c',
      dataValue('properties.current_height')
    ),
    field(
      'Current_MUAC__c',
      dataValue('properties.MUAC')
    ),
    field('Food_groups_3_times_a_day__c',dataValue('properties.food_groups')),
    field('Current_Nutrition_Status__c', state => {
      var status = dataValue(
        'properties.Nutrition_Status'
      )(state);
      return status ? state.nutritionMap[status] : undefined;
    }),
    field('Default_on_TB_treatment__c', state => {
      var choice = dataValue(
       'properties.default_tb_treatment'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field('Received_pregnancy_test__c', state => {
      var choice = dataValue(
        'properties.did_you_adminsiter_a_pregnancy_test'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field('Pregnancy_test_result__c', state => {
      var choice = dataValue(
        'properties.pregnancy_test_result'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field('Chronic_illness__c', state => {
      var choice = dataValue(
        'properties.please_specify_which_chronic_illness_the_person_has'
      )(state);
      var choice2 = state.handleMultiSelect(state, choice);
      return choice2 ? choice2.replace(/_/g, ' ') : '';
    }),
    /*field(
          'Birth_Certificate__c',
          dataValue('form.Status.birth_certificate')
        ),
        field(
          'Child_zinc__c',
          dataValue(
            'form.TT5.Child_Information.Clinical_Services.diarrhea_clinic_treatment_zinc'
          )
        ),
        field(
          'Child_ORS__c',
          dataValue(
            'form.TT5.Child_Information.Clinical_Services.diarrhea_clinic_treatment_ORS'
          )
        ),*/
    field(
      'Childs_breath_per_minute__c',
      dataValue('properties.breaths_per_minuite')
    ),
    field(
      'Child_chest_in_drawing__c',
      dataValue('properties.Child_chest_in_drawing_c')
    ),
    field(
      'Caregiver_counseled_on_delayed_milestone__c',
      dataValue(
        'properties.did_you_counsel_the_caregiver_on_delayed_milestones'
      )
    ),
    field(
      'Delayed_Milestone__c',
      dataValue(
         'properties.does_the_child_has_a_delayed_milestone'
      )
    ),
    field(
      'Child_has_2_or_more_play_items__c',
      dataValue(
         'properties.does_the_child_has_2_or_more_play_items_at_home'
      )
    ),
    field(
      'Child_has_3_more_picture_books__c',
      dataValue(
        'properties.does_the_child_has_3_or_more_picture_books'
      )
    ),
    field('Delayed_Milestones_Counselled_On__c', state => {
      var ms = dataValue(
        'properties.which_delayed_milestone_area_did_you_counsel_the_caregiver_on'
      )(state);
      return ms ? state.milestoneMap[ms] : undefined;
    }),
    field('Delayed_Milestone_Type__c', state => {
      var ms = dataValue('properties.which_delayed_milestone')(
        state
      );
      return ms ? state.milestoneTypeMap[ms] : undefined;
    }),
    field(
      'Caretaker_trained_in_muac__c',
      dataValue('properties.mother_trained_muac')
    ),
    field(
      'Caretaker_screened_for_muac_this__c',
      dataValue(
       'properties.mother_screened_child_muac'
      )
    ),
    field(
      'Caretaker_muac_findings__c',
      dataValue(
        'properties.mother_screened_child_muac_result'
      )
    ),
    field(
      'Caretaker_action_after_muac_screening__c',
      dataValue(
        'properties.mother_screened_muac_action'
      )
    ),
    field(
      'of_Caretaker_MUAC_screenings__c',
      dataValue('properties.mother_nb_screening')
    ),
    field('Pulse_Oximeter__c', dataValue('properties.pulse_oximeter_available')),
    field(
      'Heart_Rate_Pulse_Oximeter__c',
      dataValue('properties.heart_rate_pulse_oximeter')
    ),
    field(
      'Oxygen_Concentration_Pulse_Oximeter__c',
      dataValue('properties.oxygen_concentration')
    ),
    field('Can_child_drink__c', dataValue('properties.can_child_drink')),
    field(
      'Antibiotic_provided_for_fast_breathing__c',
      dataValue('properties.antibiotic_fast_breathing')
    ),
    field(
      'Antibiotic_provided_for_chest_indrawing__c',
      dataValue('properties.antibiotic_chest_indrawing')
    ),
    field('Supervisor_Visit__c', state => {
      var check = dataValue('properties.supervisor_visit')(state);
      var value =
        check && check !== ''
          ? check
              .replace(/ /gi, ';')
              .split(';')
              .map(value => {
                return state.supervisorMap[value] || value;
              })
          : undefined;
      return value ? value.join(';') : undefined;
    }),
    //field('Last_Modified_Date_CommCare__c', dataValue('server_modified_on')),
    field('Case_Closed_Date__c', state => {
      var closed = dataValue('date_closed')(state);
      var date = dataValue('date_modified')(state);
      return closed && closed == true ? date : undefined;
    })
  )
);
