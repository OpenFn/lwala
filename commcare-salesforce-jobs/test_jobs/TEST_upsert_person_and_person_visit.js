fn(state => {
  const owner_ids = state.data.objects.map(data => data.properties.owner_id);
  const uniq_owner_ids = [...new Set(owner_ids)];

  return { ...state, uniq_owner_ids };
});

fn(state => {
  return query(
    `SELECT CommCare_User_ID__c, Id village, Parent_Geographic_Area__c area, Parent_Geographic_Area__r.Name name, Parent_Geographic_Area__r.Parent_Geographic_Area__c catchment FROM Location__c WHERE CommCare_User_ID__c IN ('${state.uniq_owner_ids.join(
      "','"
    )}') GROUP BY Id, CommCare_User_ID__c, Parent_Geographic_Area__c, Parent_Geographic_Area__r.Name, Parent_Geographic_Area__r.Parent_Geographic_Area__c`
  )(state);
});

fn(state => {
  const [reference] = state.references;

  // console.log(JSON.stringify(reference, null, 2));
  const fetchReference = (owner_id, arg) => {
    const result = reference.records.filter(
      record => record.CommCare_User_ID__c === owner_id
    );

    result.length > 0 ? result[0][arg] : undefined;
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

  const handleMultiSelectOriginal = multiField => {
    return multiField
      ? multiField
          .replace(/ /gi, ';')
          .toLowerCase()
          .split(';')
          .map(value => {
            return value;
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
    male_condoms: 'Male condoms',
    female_condoms: 'Female condoms',
    pop: 'POP',
    coc: 'COC',
    emergency_pills: 'Emergency pills',
    none: 'None',
    //HMN -12/01/2023-
    //adding normalization for the family_planning_method to Family_Planning_Method__c
    iucd: 'IUCD',
    condoms: 'Condoms',
    depo: 'Depo',
    implant: 'Implant',
    injection: 'Injection',
    pills: 'Pills',
    traditional: 'Traditional',
  };

  const symptomsMap = {
    convulsions: 'Convulsions',
    not_able_to_eatdrink: 'Not able to drink or feed at all',
    vomits_everything: 'Vomits everything',
    'chest_in-drawing': 'Chest in - drawing',
    unusually_sleepyunconscious: 'Unusually sleepy or unconscious',
    swelling_of_both_feet: 'Swelling of both feet',
    none: 'None',
  };

  const supervisorMap = {
    community_health_nurse: 'Community_health_nurse',
    chw_supervisor: 'CHW_supervisor',
    chewschas: 'Chewschas',
    other: 'Other',
    none: 'None',
  };

  const treatmentDistributionMap = {
    ors_205gltr_sachets: 'ORS (20.5h/ltr): Sachets',
    acts_6s: 'ACTs (6s)',
    acts_12s: 'ACTs (12s)',
    acts_18s: 'ACTs (18s)',
    acts_24s: 'ACTs (24s)',
    albendazole_abz_tabs: 'Albendazole (ABZ): Tabs',
    paracetamol_tabs: 'Tetracycline Eye Ointment (TEO): 1%:tube',
    tetracycline_eye_ointment_teo_1_tube:
      'Tetracycline Eye Ointment (TEO): 1%:tube',
    amoxycillin: 'Amoxycillin (125mg/5mls: Bottle',
    none: 'None',
  };

  const childDangerSignsMap = {
    none: 'None',
    Poor_Breastfeeding: 'Poor Breastfeeding',
    not_able_to_feed_since_birth_or_stopped_feeding_well:
      'Not able to feed since birth, or stopped feeding well',
    not_able_to_breastfeed: 'Not able to breastfeed',
    Fever: 'Fever',
    very_low_temperature: 'Very low temperature (35.4 C or less)',
    shivering: 'Shivering',
    Fast_Breathing: 'Fast Breathing',
    Very_Sleepy: 'Very Sleepy',
    Convulsions_and_Fits: 'Convulsions and Fits',
    only_moves_when_stimulated_or_does_not_move_even_on_stimulation:
      'Only moves when stimulated, or does not move even on stimulation',
    yellow_solebaby_body_turning_yellow_especially_eyes_palms_soles:
      'Yellow sole(Baby body turning yellow especially eyes, palms,soles)',
    bleeding_from_the_umbilical_stump: 'Bleeding from the umbilical stump',
    signs_of_local_infection_umbilicus_is_red_or_draining_pus_skin_boils_or_eye:
      'Signs of local infection: umbilicus is red or draining pus, skin boils, or eyes draining pus',
    weight_chart_using_color_coded_scales_if_red_or_yellowweight_below_25kg_or_:
      'Weight chart using color coded scales if RED or YELLOW(Weight below 2.5kg or born less than 36 weeks of age)',
    unable_to_cry: 'Unable to cry',
    cyanosis: 'Cyanosis',
    bulging_fontanelle: 'Bulging fontanelle',
  };

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
    treatmentDistributionMap,
    childDangerSignsMap,
    fetchReference,
    cleanChoice,
    handleMultiSelect,
    handleMultiSelectOriginal,
  };
});

fn(state => {
  const {
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
    treatmentDistributionMap,
    childDangerSignsMap,
    fetchReference,
    cleanChoice,
    handleMultiSelect,
    handleMultiSelectOriginal,
  } = state;

  const personVisitMapping = state.data.objects
    .filter(
      p =>
        // p.properties.username !== 'test.2021' &&
        p.properties.test_user !== 'Yes'
    )
    .map(p => {
      return {
        //CommCare_ID__c: p.form.case.@case_id,
        // CommCare_ID__c: p.id,
        //CommCare_ID__c: () => {
        //  var case_id = p.case_id;
        //  var submitted = p.properties.last_form_opened_date_and_time;
        //  return case_id + '_' +  submitted;
        //},
        CommCare_ID__c: p.case_id,

        // relationship(
        //   'Person__r',
        //   'CommCare_ID__c',
        //   p.indices.parent.case_id')
        // ),
        'Person__r.CommCare_ID__c': p.indices.parent.case_id,
        /*relationship(
        'Household_CHW__r', 
        'CommCare_ID__c', 
        p.properties.sfid,*/
        // CommCare_Visit_ID__c: p.metadata.instanceID,
        CommCare_Visit_ID__c: () => {
          var case_id = p.case_id;
          var submitted = p.properties.last_form_opened_date_and_time;
          return case_id + '_' + submitted;
        },
        Date__c: p.properties.Date,
        // Form_Submitted__c: p.properties.last_form_opened_name,
        // Birth_Status__c: p.properties.child_status,
        Catchment__c: fetchReference(p.properties.owner_id, 'catchment'),
        /*
      //HMN 05/01/2022 Caused alot of failures, removed this RecordType Field
      relationship('RecordType', 'Name: () => {
            var rt = p.properties.RecordType;
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
          },*/
        Use_mosquito_net__c: () => {
          var choice = p.properties.sleep_under_net;
          return cleanChoice(choice);
        },
        // Individual_birth_plan_counselling__c:
        //   p.properties.individual_birth_plan,
        // Reason_for_not_taking_a_pregnancy_test__c: () => {
        //   var reason = p.properties.No_Preg_Test;
        //   return reason ? reason.toString().replace(/_/g, ' ') : undefined;
        // },
        // Pregnancy_danger_signs__c: () => {
        //   var signs = p.properties.No_Preg_Test;
        //   return signs ? pregDangerMap[signs] : undefined;
        // },
        Child_Danger_Signs__c: () => {
          var signs = p.properties.Other_Danger_Signs;
          return signs ? childDangerSignsMap[signs] : undefined;
        },
        Current_Malaria_Status__c: () => {
          var choice = p.properties.malaria_test_results;
          return cleanChoice(choice);
        },
        // Malaria_Home_Test__c: p.properties.malaria_test_date,
        /*Current_Malaria_Status__c: () => {
        var choice = p.properties.Malaria_Status;
        return cleanChoice(choice);
      },*/
        // Malaria_Home_Treatment__c: p.form.treatment_and_tracking.home_treatment,
        // Malaria_Home_Treatment__c: p.properties.malaria_test_date,
        // Persons_symptoms__c: () => {
        //   var check = p.properties.symptoms_check_other;
        //   var value =
        //     check && check !== ''
        //       ? check
        //           .replace(/ /gi, ';')
        //           .split(';')
        //           .map(value => {
        //             return symptomsMap[value] || value;
        //           })
        //       : undefined;
        //   return value ? value.join(';') : undefined;
        // },
        // Active_in_Support_Group__c: p.properties.Active_in_Support_Group,
        // HAWI_Defaulter__c: () => {
        //   var hawi = p.properties.default;
        //   return hawi === 'Yes' ? true : false;
        // },
        // Date_of_Default__c: p.properties.date_of_default,
        // Persons_temperature__c: p.properties.temperature,
        Days_since_illness_start__c: p.properties.duration_of_sickness,
        Newborn_visited_48_hours_of_delivery__c:
          p.properties.newborn_visited_48_hours_of_delivery,
        // Newborn_visited_by_a_CHW_within_6_days__c:
        //   p.properties.visit_6_days_from_delivery,
        Current_Malaria_Status__c: p.properties.malaria_test_results,
        // Malaria_test__c: () => {
        //   var choice = p.properties.malaria_test;
        //   return cleanChoice(choice);
        // },
        // Fever__c: () => {
        //   var choice = p.properties.symptoms_check_fever;
        //   return cleanChoice(choice);
        // },
        // Cough__c: () => {
        //   var choice = p.properties.symptoms_check_cough;
        //   return cleanChoice(choice);
        // },
        Diarrhoea__c: () => {
          var choice = p.properties.symptoms_check_diarrhea;
          return cleanChoice(choice);
        },
        TB_patients_therapy_observed__c: p.properties.observed_tb_therapy,
        Injuries_or_wounds__c: p.properties.wounds_or_injuries,
        Currently_on_ART_s__c: p.properties.ART,
        /*ART_Regimen__c: () => {
        var choice = dataValue(
         'properties.ARVs;
        return cleanChoice(choice);
      },*/
        Immediate_Breastfeeding__c: p.properties.Breastfeeding_Delivery,
        Exclusive_Breastfeeding__c: p.properties.Exclusive_Breastfeeding,
        Counselled_on_Exclusive_Breastfeeding__c: p.properties.counseling,
        LMP__c: p.properties.when_was_your_lmp,
        Family_Planning__c: () => {
          var choice = p.properties.family_planning;
          return cleanChoice(choice);
        },
        //HMN 12/01/2023 Failures on picklist within Salesforce
        /*
      Family_Planning_Method__c: p.properties.family_planning_method,*/
        Family_Planning_Method__c: () => {
          //var status = p.form.treatment_and_tracking.distribution.distributed_treatments;
          var status = p.properties.family_planning_method;
          var value =
            status && status !== ''
              ? status
                  .replace(/ /gi, ';')
                  .split(';')
                  .map(value => {
                    return fpMethodMap[value] || value;
                  })
              : undefined;
          return value ? value.join(';') : undefined;
        },
        FP_Method_Distributed__c: () => {
          //var status = p.form.treatment_and_tracking.distribution.distributed_treatments;
          var status = p.properties.FP_commodity;
          var value =
            status && status !== ''
              ? status
                  .replace(/ /gi, ';')
                  .split(';')
                  .map(value => {
                    return fpMethodMap[value] || value;
                  })
              : undefined;
          return value ? value.join(';') : undefined;
        },
        Reasons_for_not_taking_FP_method__c: () => {
          // var reason = p.form.TT5.Mother_Information.No_FPmethod_reason;
          // return reason ? reasonMap[reason] : undefined;
          var status = p.properties.No_FPmethod_reason;
          var value =
            status && status !== ''
              ? status
                  .replace(/ /gi, ';')
                  .split(';')
                  .map(value => {
                    return reasonMap[value] || value;
                  })
              : undefined;
          return value ? value.join(';') : undefined;
        },
        Pregnant__c: () => {
          var preg = p.properties.Pregnant;
          return preg === 'Yes' ? true : false;
        },
        Counselled_on_FP_Methods__c: () => {
          var choice = p.properties.CounselledFP_methods;
          return cleanChoice(choice);
        },
        Client_counselled_on__c: () => {
          var choices =
            p.properties.counsel_topic || p.properties.counsel_topic;
          var choiceGroups = choices ? choices.split(' ') : null;
          var choicesMulti = choiceGroups
            ? choiceGroups
                .map(cg => {
                  return counselMap[cg];
                })
                .join(';')
            : choiceGroups;
          return choicesMulti;
        },
        Client_provided_with_FP__c: () => {
          var choice =
            p.properties[
              'was_the_woman_15-49yrs_provided_with_family_planning_commodities_by_chv'
            ];
          return cleanChoice(choice);
        },
        Newborn_visited_48_hours_of_delivery__c:
          p.properties.newborn_visited_48_hours_of_delivery,
        Mother_visit_counselling__c: () => {
          var choice = p.properties.did_you_consel_the_mother_on1;
          return handleMultiSelectOriginal(choice);
        },
        mother_visited_48_hours_of_the_delivery__c:
          p.properties.visit_mother_48,
        Newborn_visit_counselling__c: () => {
          var choice = p.properties.did_you_consel_the_mother_on2;
          return handleMultiSelectOriginal(choice);
        },
        Know_HIV_status__c: () => {
          var choice = p.properties.known_hiv_status;
          return cleanChoice(choice);
        },
        HIV_Status__c: p.properties.hiv_status,
        Treatment_Distribution__c: () => {
          //var status = p.form.treatment_and_tracking.distribution.distributed_treatments;
          var status = p.properties.distributed_treatments;
          var value =
            status && status !== ''
              ? status
                  .replace(/ /gi, ';')
                  .split(';')
                  .map(value => {
                    return treatmentDistributionMap[value] || value;
                  })
              : undefined;
          return value ? value.join(';') : undefined;
        },
        Current_Weight__c: p.properties.Current_Weight,
        Current_Height__c: p.properties.current_height,
        Current_MUAC__c: p.properties.MUAC,
        Food_groups_3_times_a_day__c: p.properties.food_groups,
        Nutrition_Case_Managed__c: p.properties.nutrition_case_managed,
        Nutrition_Danger_Signs__c: () => {
          var choice = p.properties.nutrition_danger_signs;
          return handleMultiSelectOriginal(choice);
        },
        Why_was_nutrition_case_not_managed__c:
          p.properties.nutrition_case_not_managed_why,
        Community_Nutrition_Treatment__c:
          p.properties.nutrition_treatment_severe,
        Community_Nutrition_Treatment__c:
          p.properties.nutrition_treatment_moderate,
        Why_was_nutrition_treatment_not_given__c:
          p.properties.nutrition_treatment_not_given,
        Current_Nutrition_Status__c: () => {
          var status = p.properties.Nutrition_Status;
          return status ? nutritionMap[status] : undefined;
        },
        Default_on_TB_treatment__c: () => {
          var choice = p.properties.default_tb_treatment;
          return cleanChoice(choice);
        },
        Received_pregnancy_test__c: () => {
          var choice = p.properties.did_you_adminsiter_a_pregnancy_test;
          return cleanChoice(choice);
        },
        Pregnancy_test_result__c: () => {
          var choice = p.properties.pregnancy_test_result;
          return cleanChoice(choice);
        },
        Chronic_illness__c: () => {
          var choice =
            p.properties.please_specify_which_chronic_illness_the_person_has;
          var choice2 = handleMultiSelect(choice);
          return choice2 ? choice2.replace(/_/g, ' ') : '';
        },
        /*field(
            'Birth_Certificate__c',
            p.form.Status.birth_certificate')
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
        Childs_breath_per_minute__c: p.properties.breaths_per_minuite,
        Child_chest_in_drawing__c: p.properties.Child_chest_in_drawing_c,
        Caregiver_counseled_on_delayed_milestone__c:
          p.properties.did_you_counsel_the_caregiver_on_delayed_milestones,
        Delayed_Milestone__c:
          p.properties.does_the_child_has_a_delayed_milestone,
        Child_has_2_or_more_play_items__c:
          p.properties.does_the_child_has_2_or_more_play_items_at_home,
        Child_has_3_more_picture_books__c:
          p.properties.does_the_child_has_3_or_more_picture_books,
        Delayed_Milestones_Counselled_On__c: () => {
          var ms =
            p.properties
              .which_delayed_milestone_area_did_you_counsel_the_caregiver_on;
          return ms ? milestoneMap[ms] : undefined;
        },
        Delayed_Milestone_Type__c: () => {
          var ms = p.properties.which_delayed_milestone;
          return ms ? milestoneTypeMap[ms] : undefined;
        },
        Caretaker_trained_in_muac__c: p.properties.mother_trained_muac,
        Caretaker_screened_for_muac_this__c:
          p.properties.mother_screened_child_muac,
        Caretaker_muac_findings__c:
          p.properties.mother_screened_child_muac_result,
        Caretaker_action_after_muac_screening__c:
          p.properties.mother_screened_muac_action,
        of_Caretaker_MUAC_screenings__c: p.properties.mother_nb_screening,
        Pulse_Oximeter__c: p.properties.pulse_oximeter_available,
        Heart_Rate_Pulse_Oximeter__c: p.properties.heart_rate_pulse_oximeter,
        Oxygen_Concentration_Pulse_Oximeter__c:
          p.properties.oxygen_concentration,
        Can_child_drink__c: p.properties.can_child_drink,
        Antibiotic_provided_for_fast_breathing__c:
          p.properties.antibiotic_fast_breathing,
        Antibiotic_provided_for_chest_indrawing__c:
          p.properties.antibiotic_chest_indrawing,
        Supervisor_Visit__c: () => {
          var check = p.properties.supervisor_visit;
          var value =
            check && check !== ''
              ? check
                  .replace(/ /gi, ';')
                  .split(';')
                  .map(value => {
                    return supervisorMap[value] || value;
                  })
              : undefined;
          return value ? value.join(';') : undefined;
        },
        /*
      //HMN- 05012023 - Removed Visit_Closed_Date__c: p.date_closed,
      //Because I could not find it in Salesforce. It was causing errors on staging
      Visit_Closed_Date__c: p.date_closed,
      */
        //Case_Closed_Date__c:  () => {
        //  var closed = p.date_closed;
        //  var date = p.date_modified;
        //  return closed && closed == true ? date : undefined;
        // })
      };
    });

  console.log(JSON.stringify(personVisitMapping, null, 2));
  return { ...state, personVisitMapping };
});

// bulk(
//   'Person_visit__c',
//   'upsert',
//   {
//     extIdField: 'CommCare_ID__c',
//     failOnError: true,
//     allowNoOp: true,
//   },
//   state => {
//     console.log('Bulk upserting person visit...');
//     return state.personVisitMapping;
//   }
// );
