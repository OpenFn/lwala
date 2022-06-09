query(
  `SELECT Id, Parent_Geographic_Area__c, Parent_Geographic_Area__r.Name, Parent_Geographic_Area__r.Parent_Geographic_Area__c FROM Location__c WHERE CommCare_User_ID__c = '${dataValue(
    'form.owner_id'
  )(state)}'`
);

fn(state => {

  const yesNoToBoolean = item => {
    return item === 'Yes' ? true : false;
  }

  const transformReason = (reason, map) => {
  return reason ? map[reason] : '';
  }

  const joinMap = (status, map) => {
              var value =
                status && status !== ''
                  ? status
                      .replace(/ /gi, ';')
                      .split(';')
                      .map(value => {
                        return map[value] || value;
                      })
                  : undefined;
              return value ? value.join(';') : undefined;
                    }

  const transformSigns = signs => {
    return signs
    ? signs
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(';')
        .toString()
        .replace(/_/g, ' ')
    : signs;
  }

  const cleanChoice = choice => {
      if (choice) {
          return choice.charAt(0).toUpperCase() + choice.slice(1).replace('_', ' ');
        } else {
          return '';
        }
  }

  const transformChoice = choice => {
    return choice ? choice.toString().replace(/_/g, ' ') : undefined;
  }

  const handleMissing = (x, path) => {
    `x.${path}` ? `x.${path}` : undefined; 
  }

  const determineRecordType = x => {
    var rt = x.form.RecordType

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
  }

  const determineChildStatus = x => {
    var status = x.form.case.update.child_status;
    var rt = x.form.RecordType;
      if (status && rt === 'Unborn') {
        status = 'Unborn';
      } else if (status && rt === 'Born') {
        status = 'Born';
      }
      return status;
  }

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

  const lookupMap = (item, map) => {
    return item ? map[item] : undefined;
  }

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
    male_condoms: "Male condoms",
    female_condoms: "Female condoms",
    pop: "POP",
    coc: "COC",
    emergency_pills: "Emergency pills",
    none: "None"
  };

  const visits = state.data.commCareSubmissions.map(x => {
    return {
      'Person__r.CommCare_ID__c': x.form.case['@case_id'],
      CommCare_Visit_ID__c: x.metadata.instanceID,
      CommCare_ID__c: x.id,
      Date__c: x.form.Date,
      // Birth_Status__c: x.form.ANCs.pregnancy_danger_signs.Delivery_Information.child_status,
      // Child_Status__c: determineChildStatus(x),
      'RecordType.Name': determineRecordType(x),
      // Use_mosquito_net__c: cleanChoice(x.form.question1.sleep_under_net),
      // Individual_birth_plan_counselling__c: x.form.ANCs.pregnancy_danger_signs.individual_birth_plan,
      // Reason_for_not_taking_a_pregnancy_test__c: transformChoice(x.form.TT5.Mother_Information.pregancy_test.No_Preg_Test),
      // Pregnancy_danger_signs__c:lookupMap(x.form.ANCs.pregnancy_danger_signs.pregnancy_danger_signs, pregDangerMap),
      // Other_Danger_Signs__c: transformSigns(x.form.TT5.Child_Information.Danger_Signs.Other_Danger_Signs),
      Current_Malaria_Status__c: x.form.Malaria_Status,
      // Malaria_Home_Test__c: x.form.treatment_and_tracking.malaria_test_date,
      // Malaria_Home_Treatment__c:x.form.treatment_and_tracking.malaria_test_date,
      // Persons_symptoms__c:x.form.treatment_and_tracking.symptoms_check_other,
      // Active_in_Support_Group__c :x.form.HAWI.Support_Group,
      // HAWI_Defaulter__c: yesNoToBoolean(x.form.HAWI.default),
      // Date_of_Default__c: x.form.HAWI.date_of_default,      
      // Persons_temperature__c: x.form.treatment_and_tracking.temperature,
      // Days_since_illness_start__c: x.form.duration_of_sickness,
      // Newborn_visited_48_hours_of_delivery__c: x.form.TT5.Child_Information.newborn_visited_48_hours_of_delivery,
      // Newborn_visited_by_a_CHW_within_6_days__c: x.form.TT5.Child_Information.visit_6_days_from_delivery,
      // Current_Malaria_Status__c: form.treatment_and_tracking.malaria_test_results,
      // Malaria_test__c: cleanChoice(x.form.treatment_and_tracking.malaria_test),
      // Fever__c: cleanChoice(x.form.treatment_and_tracking.symptoms_check_fever),
      // Cough__c: cleanChoice(x.form.treatment_and_tracking.symptoms_check_cough),
      // Diarrhoea__c: cleanChoice(x.form.treatment_and_tracking.check_diarrhea),
      // TB_patients_therapy_observed__c: x.form.treatment_and_tracking.observed_tb_therapy,
      // Injuries_or_wounds__c: x.form.treatment_and_tracking.wounds_or_injuries,
      // Currently_on_ART_s__c: x.form.HAWI.ART,
      // Immediate_Breastfeeding__c: x.form.ANCs.pregnancy_danger_signs.Delivery_Information.Breastfeeding_Delivery,
      // Exclusive_Breastfeeding__c: x.form.TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding,
      // Counselled_on_Exclusive_Breastfeeding__c: x.form.TT5.Child_Information.Exclusive_Breastfeeding.counseling,
      // LMP__c: x.form.TT5.Mother_Information.when_was_your_lmp,
      // Family_Planning__c: cleanChoice(x.form.TT5.Mother_Information.family_planning),
      // Family_Planning_Method__c: x.form.TT5.Mother_Information.family_planning_method,
      FP_Method_Distributed__c: joinMap(x.form.treatment_and_tracking.distribution.distributed_treatments, fpMethodMap), // None throws an error?
      


    }
  }
  );

  return {
    ...state,
    // counselMap,
    // serviceMap,
    // reasonMapping,
    // milestoneTypeMap,
    // milestoneMap,
    // nutritionMap,
    // pregDangerMap,
    // fpMethodMap,
    // cleanChoice,
    // determineRecordType,
    visits
  };
});

bulk(
  'Person_visit__c',
  'upsert',
  {
      extIdField: 'CommCare_ID__c',
  failOnError: true,
  allowNoOp: true,
  },
  state => {
      console.log('Bulk upserting visits.');
      return state.visits;
    }

)

/*
upsert(
  'Person_visit__c',
  'CommCare_ID__c',
  fields(
   
    field('CommCare_ID__c', dataValue('id')),

  //   relationship(
  //     'Person__r',
  //     'CommCare_ID__c',
  //     dataValue("form.case.@case_id")
  //   ),


    field('CommCare_Visit_ID__c',dataValue('metadata.instanceID')),
    field('Date__c',dataValue('form.Date')),
    field('Birth_Status__c',dataValue('form.ANCs.pregnancy_danger_signs.Delivery_Information.child_status')),
 
    field('Catchment__c', dataValue('catchmentNewId')),
    field('Child_Status__c', state => {
      var status = dataValue('form.case.update.child_status')(state);
      var rt = dataValue('form.RecordType')(state);
      if (status && rt === 'Unborn') {
        status = 'Unborn';
      } else if (status && rt === 'Born') {
        status = 'Born';
      }
      return status;
    }),
    //===================================================//
    relationship('RecordType', 'Name', state => {
          var rt = dataValue('form.RecordType')(state);
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
        'form.question1.sleep_under_net'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field(
      'Individual_birth_plan_counselling__c',
      dataValue('form.ANCs.pregnancy_danger_signs.individual_birth_plan')
    ),
    field('Reason_for_not_taking_a_pregnancy_test__c', state => {
      var reason = dataValue('form.TT5.Mother_Information.pregnancy_test.No_Preg_Test')(state);
      return reason ? reason.toString().replace(/_/g, ' ') : undefined;
    }),
    field('Pregnancy_danger_signs__c', state => {
      var signs = dataValue(
        'form.ANCs.pregnancy_danger_signs.pregnancy_danger_signs'
      )(state);
      return signs ? state.pregDangerMap[signs] : undefined;
    }),
    field('Other_Danger_Signs__c', state => {
      var signs = dataValue(
        'form.TT5.Child_Information.Danger_Signs.Other_Danger_Signs'
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
    field('Current_Malaria_Status__c', dataValue('form.Malaria_Status')),
    field('Malaria_Home_Test__c', dataValue('form.treatment_and_tracking.malaria_test_date')),
    field('Malaria_Home_Treatment__c',dataValue('form.treatment_and_tracking.malaria_test_date')),
    field('Persons_symptoms__c',dataValue('form.treatment_and_tracking/symptoms_check_other')),
   
    field('Active_in_Support_Group__c', dataValue('form.HAWI.Support_Group')),
   
    field('HAWI_Defaulter__c', state => {
      var hawi = dataValue('form.HAWI.default')(state);
      return hawi === 'Yes' ? true : false;
    }),
    field(
      'Date_of_Default__c',
      dataValue('form.HAWI.date_of_default')
    ),
    field(
      'Persons_temperature__c',
      dataValue('form.treatment_and_tracking.temperature')
    ),
    field(
      'Days_since_illness_start__c',
      dataValue('form.duration_of_sickness')
    ),
    field(
      'Newborn_visited_48_hours_of_delivery__c',
      dataValue(
        'form.TT5.Child_Information.newborn_visited_48_hours_of_delivery'
      )
    ),
    field(
      'Newborn_visited_by_a_CHW_within_6_days__c',
      dataValue('form.TT5.Child_Information.visit_6_days_from_delivery')
    ),
    field(
      'Current_Malaria_Status__c',
      dataValue('form.treatment_and_tracking.malaria_test_results')
    ),
    field('Malaria_test__c', state => {
      var choice = dataValue(
        'form.treatment_and_tracking.malaria_test'
      )(state);
      return state.cleanChoice(state, choice);
    }),
   
    field('Fever__c', state => {
      var choice = dataValue(
        'form.treatment_and_tracking.symptoms_check_fever'
      )(state);
      return state.cleanChoice(state, choice);
    }),
   
    field('Cough__c', state => {
      var choice = dataValue(
        'form.treatment_and_tracking.symptoms_check_cough'
      )(state);
      return state.cleanChoice(state, choice);
    }),
  
    field('Diarrhoea__c', state => {
      var choice = dataValue(
        'form.treatment_and_tracking.check_diarrhea'
      )(state);
      return state.cleanChoice(state, choice);
    }),
   
    field(
      'TB_patients_therapy_observed__c',
      dataValue('form.treatment_and_tracking.observed_tb_therapy')
    ),
    field(
      'Injuries_or_wounds__c',
      dataValue('form.treatment_and_tracking.wounds_or_injuries')
    ),
    field('Currently_on_ART_s__c', dataValue('form.HAWI.ART')),
    field(
      'Immediate_Breastfeeding__c',
      dataValue(
        'form.ANCs.pregnancy_danger_signs.Delivery_Information.Breastfeeding_Delivery'
      )
    ),
  
    field(
      'Exclusive_Breastfeeding__c',
      dataValue(
        'form.TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding'
      )
    ),
    field(
      'Counselled_on_Exclusive_Breastfeeding__c',
      dataValue('form.TT5.Child_Information.Exclusive_Breastfeeding.counseling')
    ),
    field('LMP__c',dataValue('form.TT5.Mother_Information.when_was_your_lmp')),
   
     field('Family_Planning__c', state => {
      var choice = dataValue(
        'form.TT5.Mother_Information.family_planning'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field(
      'Family_Planning_Method__c',
      dataValue('form.TT5.Mother_Information.family_planning_method')
    ),
     field('FP_Method_Distributed__c', state => {
          var status = dataValue('form.treatment_and_tracking.distribution.distributed_treatments')(state);
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
      var reason = dataValue('form.TT5.Mother_Information.No_FPmethod_reason')(state);
      return reason ? state.reasonMapping[reason] : '';
    }),
    field('Pregnant__c', state => {
      var preg = dataValue('form.TT5.Mother_Information.Pregnant')(state);
      return preg === 'Yes' ? true : false;
    }),
   
    field('Counselled_on_FP_Methods__c', state => {
      var choice = dataValue(
        'form.TT5.Mother_Information.CounselledFP_methods'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field('Client_counselled_on__c', state => {
      var choices =
        dataValue('form.treatment_and_tracking.counseling.counsel_topic')(
          state
        ) || dataValue('form.counseling.counsel_topic')(state);
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
        'form.TT5.Mother_Information.was_the_woman_15-49yrs_provided_with_family_planning_commodities_by_chv'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field(
      'Newborn_visited_48_hours_of_delivery__c',
      dataValue(
        'form.TT5.Child_Information.newborn_visited_48_hours_of_delivery'
      )
    ),
    field('Mother_visit_counselling__c', state => {
      var choice = dataValue(
        'form.TT5.Child_Information.did_you_consel_the_mother_on1'
      )(state);
      return state.handleMultiSelectOriginal(state, choice);
    }),
    field(
      'mother_visited_48_hours_of_the_delivery__c',
      dataValue('form.TT5.Child_Information.visit_mother_48')
    ),
    field('Newborn_visit_counselling__c', state => {
      var choice = dataValue(
        'form.TT5.Child_Information.did_you_consel_the_mother_on2'
      )(state);
      return state.handleMultiSelectOriginal(state, choice);
    }),
    field('Know_HIV_status__c', dataValue('form.HAWI.known_hiv_status')),
   
    field('HIV_Status__c', dataValue('form.HAWI.hiv_status')),
    field('Treatment_Distribution__c', state => {
      var choice = dataValue(
        'form.treatment_and_tracking.distribution.distributed_treatments'
      )(state);
      return state.handleMultiSelect(state, choice);
    }), 
    field(
      'Current_Weight__c',
      dataValue('form.TT5.Child_Information.Nutrition.current_weight')
    ),
    field(
      'Current_Height__c',
      dataValue('form.TT5.Child_Information.Nutrition.current_height')
    ),
    field(
      'Current_MUAC__c',
      dataValue('form.TT5.Child_Information.Nutrition.MUAC')
    ),
    field('Current_Nutrition_Status__c', state => {
      var status = dataValue(
        'form.TT5.Child_Information.Nutrition2.Nutrition_Status'
      )(state);
      return status ? state.nutritionMap[status] : undefined;
    }),
   
    field('Default_on_TB_treatment__c', state => {
      var choice = dataValue(
        'form.treatment_and_tracking.default_tb_treatment'
      )(state);
      return state.cleanChoice(state, choice);
    }),
    field(
      'Received_pregnancy_test__c',
      dataValue(
        'form.TT5.Mother_Information.pregancy_test.did_you_adminsiter_a_pregnancy_test'
      )
    ),
    field(
      'Pregnancy_test_result__c',
      dataValue('form.TT5.Mother_Information.pregancy_test.pregnancy_test_result')
    ),
    field('Chronic_illness__c', state => {
      var choice = dataValue(
        'form.question1.please_specify_which_chronic_illness_the_person_has'
      )(state);
      var choice2 = state.handleMultiSelect(state, choice);
      return choice2 ? choice2.replace(/_/g, ' ') : '';
    }),
    
    field(
      'Childs_breath_per_minute__c',
      dataValue('form.psbi.breaths_per_minuite')
    ),
    field(
      'Child_chest_in_drawing__c',
      dataValue('form.psbi.Child_chest_in_drawing_c')
    ),
    field(
      'Caregiver_counseled_on_delayed_milestone__c',
      dataValue(
        'form.TT5.Child_Information.ecd_milestones.did_you_counsel_the_caregiver_on_delayed_milestones'
      )
    ),
    field(
      'Delayed_Milestone__c',
      dataValue(
        'form.TT5.Child_Information.ecd_milestones.does_the_child_has_a_delayed_milestone'
      )
    ),
    field(
      'Child_has_2_or_more_play_items__c',
      dataValue(
        'form.TT5.Child_Information.ecd_milestones.does_the_child_has_2_or_more_play_items_at_home'
      )
    ),
    field(
      'Child_has_3_more_picture_books__c',
      dataValue(
        'form.TT5.Child_Information.ecd_milestones.does_the_child_has_3_or_more_picture_books'
      )
    ),
    field('Delayed_Milestones_Counselled_On__c', state => {
      var ms = dataValue(
        'form.TT5.Child_Information.ecd_milestones.which_delayed_milestone_area_did_you_counsel_the_caregiver_on'
      )(state);
      return ms ? state.milestoneMap[ms] : undefined;
    }),
    field('Delayed_Milestone_Type__c', state => {
      var ms = dataValue('form.TT5.Child_Information.ecd_milestones.which_delayed_milestone')(
        state
      );
      return ms ? state.milestoneTypeMap[ms] : undefined;
    }),
    field(
      'Caretaker_trained_in_muac__c',
      dataValue('form.TT5.Child_Information.caretaker_muac.mother_trained_muac')
    ),
    field(
      'Caretaker_screened_for_muac_this__c',
      dataValue(
        'form.TT5.Child_Information.caretaker_muac.mother_screened_child_muac'
      )
    ),
    field(
      'Caretaker_muac_findings__c',
      dataValue(
        'form.TT5.Child_Information.caretaker_muac.mother_screened_child_muac_result'
      )
    ),
    field(
      'Caretaker_action_after_muac_screening__c',
      dataValue(
        'form.TT5.Child_Information.caretaker_muac.mother_screened_muac_action'
      )
    ),
    field(
      'of_Caretaker_MUAC_screenings__c',
      dataValue('form.TT5.Child_Information.caretaker_muac.mother_nb_screening')
    ),
    field('Pulse_Oximeter__c', dataValue('form.psbi.pulse_oximeter_available')),
    field(
      'Heart_Rate_Pulse_Oximeter__c',
      dataValue('form.psbi.heart_rate_pulse_oximeter')
    ),
    field(
      'Oxygen_Concentration_Pulse_Oximeter__c',
      dataValue('form.psbi.oxygen_concentration')
    ),
    field('Can_child_drink__c', dataValue('form.psbi.can_child_drink')),
    field(
      'Antibiotic_provided_for_fast_breathing__c',
      dataValue('form.psbi.antibiotic_fast_breathing')
    ),
    field(
      'Antibiotic_provided_for_chest_indrawing__c',
      dataValue('form.psbi.antibiotic_chest_indrawing')
    ),
    field('Supervisor_Visit__c',dataValue('form.supervisor_visit')),
    //field('Last_Modified_Date_CommCare__c', dataValue('server_modified_on')),
    field('Case_Closed_Date__c', state => {
      var closed = dataValue('form.case.update.closed')(state);
      var date = dataValue('server_modified_on')(state);
      return closed && closed == true ? date : undefined;
    })
  )

)
  */
 ;  