fn(state => {
  const owner_ids = state.data.objects.map(data => data.properties.owner_id);
  const uniq_owner_ids = [...new Set(owner_ids)];

  return { ...state, uniq_owner_ids };
});

// get data from SF
fn(state => {
  return query(
    `SELECT CommCare_User_ID__c, Id village, Parent_Geographic_Area__c area, Parent_Geographic_Area__r.Name name, Parent_Geographic_Area__r.Parent_Geographic_Area__c catchment FROM Location__c WHERE CommCare_User_ID__c IN ('${state.uniq_owner_ids.join(
      "','"
    )}') GROUP BY Id, CommCare_User_ID__c, Parent_Geographic_Area__c, Parent_Geographic_Area__r.Name, Parent_Geographic_Area__r.Parent_Geographic_Area__c`
  )(state);
});

fn(state => {
  const [reference] = state.references;

  // console.log(JSON.stringify(reference.records, null, 2));

  const villageNewId = owner_id =>
    reference.records.filter(
      record => record.CommCare_User_ID__c === owner_id
    )[0].village;

  const areaNewId = owner_id =>
    reference.records.filter(
      record => record.CommCare_User_ID__c === owner_id
    )[0].area;

  const catchmentNewId = owner_id =>
    reference.records.filter(
      record => record.CommCare_User_ID__c === owner_id
    )[0].catchment;

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
    areaNewId,
    cleanChoice,
    villageNewId,
    catchmentNewId,
    handleMultiSelect,
  };
});

// build sfRecord before upserting
fn(state => {
  const {
    areaNewId,
    counselMap,
    villageNewId,
    catchmentNewId,
    reasonMapping,
    milestoneTypeMap,
    milestoneMap,
    nutritionMap,
    pregDangerMap,
    fpMethodMap,
    cleanChoice,
    handleMultiSelect,
  } = state;

  const householdMapping = [
    ...new Map(
      state.data.objects
        .filter(
          p =>
            p.properties.commcare_username !== 'test.2021' &&
            p.properties.test_user !== 'Yes'
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

  const headOfHouseholdMapping = state.data.objects
    .filter(
      p =>
        p.properties.commcare_username !== 'test.2021' &&
        p.properties.test_user !== 'Yes' &&
        p.properties.head_of_household_case_id !== undefined &&
        p.properties.head_of_household_case_id !== ''
    )
    .map(p => {
      return {
        CommCare_Code__c: p.indices.parent.case_id,
        'Head_of_Household__r.CommCare_ID__c':
          p.properties.head_of_household_case_id,
      };
    });

  const motherMapping = state.data.objects
    .filter(
      p =>
        p.properties.commcare_username !== 'test.2021' &&
        p.properties.test_user !== 'Yes' &&
        p.properties.mother_case_id !== undefined &&
        p.properties.mother_case_id !== ''
    )
    .map(p => {
      return {
        'Mother__r.CommCare_ID__c': () => {
          return (caregiver = p.properties.mother_case_id);
        },
        CommCare_ID__c: p.case_id,
      };
    });

  const caregiverMapping = state.data.objects
    .filter(
      p =>
        p.properties.commcare_username !== 'test.2021' &&
        p.properties.test_user !== 'Yes' &&
        p.properties.caretaker_case_id !== undefined &&
        p.properties.caretaker_case_id !== ''
    )
    .map(p => {
      return {
        'Primary_Caregiver_Lookup__r.CommCare_ID__c': () => {
          return (caregiver = p.properties.caretaker_case_id);
        },
        CommCare_ID__c: p.case_id,
      };
    });

  const sfRecordMapping = state.data.objects
    .filter(
      p =>
        p.properties.commcare_username !== 'test.2021' &&
        p.properties.test_user !== 'Yes'
    )
    .map(p => {
      /*  field(
          'deworming_medication__c',
          dataValue('form.TT5.Child_Information.Deworming')
        ),depracated field*/
      return {
        Source__c: 1,
        CommCare_ID__c: p.case_id,
        'Household__r.CommCare_Code__c': p.indices.parent.case_id,
        commcare_location_id__c: p.properties.commcare_location_id,
        CommCare_Username__c: p.properties.commcare_username,
        Telephone__c: p.properties.contact_phone_number,

        Consent_for_data_use__c: p.properties.data_sharing_consent,
        CommCare_HH_Code__c: p.indices.parent.case_id,
        Client_Status__c: p.properties.Client_Status,
        Catchment__c: catchmentNewId(p.properties.owner_id),
        Area__c: areaNewId(p.properties.owner_id),
        Household_Village__c: villageNewId(p.properties.owner_id),
        Name: () => {
          var name1 = p.properties.Person_Name; //check
          var unborn = p.properties.name; //check
          var name2 =
            name1 === undefined || name1 === '' || name1 === null
              ? unborn
              : name1.replace(/\w\S*/g, function (txt) {
                  return (
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  );
                });
          return name1 !== null ? name2 : 'Unborn Child';
        },
        Chronic_illness__c: () => {
          var choice =
            p.properties.please_specify_which_chronic_illness_the_person_has;
          var choice2 = handleMultiSelect(choice);
          return choice2 ? choice2.replace(/_/g, ' ') : '';
        },

        Currently_enrolled_in_school__c: p.properties.enrolled_in_school,
        Education_Level__c: () => {
          var level = p.properties.Education_Level;
          return level ? level.toString().replace(/_/g, ' ') : null;
        },
        Relation_to_the_head_of_the_household__c: () => {
          var relation = p.properties.relation_to_hh;
          if (relation) {
            relation = relation.toString().replace(/_/g, ' ');
            var toTitleCase =
              relation.charAt(0).toUpperCase() + relation.slice(1);
            return toTitleCase;
          }

          return null;
        },
        Gender__c: p.properties.Gender,
        Disability__c: () => {
          var disability = p.properties.disability;
          var toTitleCase =
            disability !== undefined
              ? disability
                  .toLowerCase()
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(';')
              : null;
          return toTitleCase;
        },
        Other_disability__c: () => {
          var disability = p.properties.other_disability;
          var toTitleCase =
            disability !== undefined
              ? disability
                  .toLowerCase()
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(';')
              : null;
          return toTitleCase;
        },
        Use_mosquito_net__c: p.properties.sleep_under_net,
        // Birth_Certificate__c,p.properties.birth_certificate,
        Birth_Certificate__c: p.properties.birth_certificate,
        Child_Status__c: () => {
          var status = p.properties.Child_Status;
          var rt = p.properties.Record_Type; //check that this is the right one
          if (status && rt === 'Unborn') {
            status = 'Unborn';
          } else if (status && rt === 'Born') {
            status = 'Born';
          }
          return status;
        },
        //===================================================//
        // relationship('RecordType', 'Name', state => {
        //   var rt = p.properties.Record_Type;
        //   return rt === 'Unborn' || rt === ''
        //     ? 'Child'
        //     : rt.toString().replace(/_/g, ' '); //convert Unborn children to Child RT
        // }),
        //TT5 Mother Information  =====================//
        MCH_booklet__c: p.properties.mch_booklet,
        Reason_for_not_taking_a_pregnancy_test__c: () => {
          var reason = p.properties.No_Preg_Test;
          return reason ? reason.toString().replace(/_/g, ' ') : undefined;
        },
        Pregnancy_danger_signs__c: () => {
          var signs = p.properties.pregnancy_danger_signs;
          return signs ? pregDangerMap[signs] : undefined;
        },
        Individual_birth_plan_counselling__c:
          p.properties.individual_birth_plan,
        Child_Danger_Signs__c: () => {
          var signs = p.properties.Other_Danger_Signs;
          return signs
            ? signs
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(';')
                .toString()
                .replace(/_/g, ' ')
            : signs;
        },
        //HAWI =====================//

        Unique_Patient_Code__c: p.properties.Unique_Patient_Code,
        Active_in_Support_Group__c: p.properties.Active_in_Support_Group,
        Preferred_Care_Facility__c: p.properties.Preferred_Care_Facility,
        Currently_on_ART_s__c: p.properties.ART,
        ART_Regimen__c: p.properties.ARVs,
        HAWI_Defaulter__c: () => {
          var hawi = p.properties.default;
          return hawi === 'Yes' ? true : false;
        },
        Date_of_Default__c: p.properties.date_of_default,
        Know_HIV_status__c: p.properties.known_hiv_status,
        HIV_Status__c: p.properties.hiv_status,
        //Illness ========================//
        Persons_temperature__c: p.properties.temperature,
        Days_since_illness_start__c: p.properties.duration_of_sickness,
        Current_Malaria_Status__c: p.properties.malaria_test_results,
        Malaria_test__c: p.properties.malaria_test,
        Last_Malaria_Home_Test__c: p.properties.malaria_test_date,
        Last_Malaria_Home_Treatment__c: () => {
          var choice = p.properties.malaria_test_date;
          return cleanChoice(choice);
        },
        Cough_over_14days__c: p.properties.symptoms_check_cough,
        TB_patients_therapy_observed__c: p.properties.observed_tb_therapy,
        Injuries_or_wounds__c: p.properties.wounds_or_injuries,
        Pulse_Oximeter__c: p.properties.pulse_oximeter_available,
        Heart_Rate_Pulse_Oximeter__c: p.properties.heart_rate_pulse_oximeter,
        Oxygen_Concentration_Pulse_Oximeter__c:
          p.properties.oxygen_concentration,
        Can_child_drink__c: p.properties.can_child_drink,
        Antibiotic_provided_for_fast_breathing__c: () => {
          var choice = p.properties.antibiotic_fast_breathing;
          return cleanChoice(choice);
        },
        Antibiotic_provided_for_chest_indrawing__c: () => {
          var choice = p.properties.antibiotic_chest_indrawing;
          return cleanChoice(choice);
        },
        Default_on_TB_treatment__c: () => {
          var choice = p.properties.default_tb_treatment; //check
          return cleanChoice(choice);
        },
        Treatment_Distribution__c: () => {
          var choice = p.properties.distributed_treatments;
          return cleanChoice(choice);
        },
        //Delivery  =====================//
        Immediate_Breastfeeding__c: p.properties.Breastfeeding_Delivery,
        Place_of_Delivery__c: () => {
          var facility = p.properties.Delivery_Type;
          return facility === 'Skilled'
            ? 'Facility'
            : facility === 'Unskilled'
            ? 'Home'
            : undefined;
        },
        Delivery_Facility__c: () => {
          var facility = p.properties.Delivery_Facility;
          return facility ? facility.toString().replace(/_/g, ' ') : null;
        },
        Delivery_Facility_Other__c: p.properties.Delivery_Facility_Other,
        //Family Planning  =====================//
        LMP__c: p.properties.LMP,
        Family_Planning__c: p.properties.family_planning,
        Family_Planning_Method__c: p.properties.family_planning_method,
        FP_Method_Distributed__c: () => {
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
          var status = p.properties.No_FPmethod_reason;
          var value =
            status && status !== ''
              ? status
                  .replace(/ /gi, ';')
                  .split(';')
                  .map(value => {
                    return reasonMapping[value] || value;
                  })
              : undefined;
          return value ? value.join(';') : undefined;
        },
        Pregnant__c: () => {
          var preg = p.properties.Pregnant;
          return preg === 'Yes' ? true : false;
        },
        Date_of_Delivery__c: p.properties.delivery_date,
        Counselled_on_FP_Methods__c: p.properties.CounselledFP_methods,
        Client_counselled_on__c: () => {
          var choices = p.properties.counsel_topic;
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
        Newborn_visit_counselling__c: () => {
          var choice = p.properties.did_you_consel_the_mother_on1;
          return cleanChoice(choice);
        },
        mother_visited_48_hours_of_the_delivery__c:
          p.properties.visit_mother_48,
        Mother_visit_counselling__c: () => {
          var choice = p.properties.did_you_consel_the_mother_on2;
          return cleanChoice(choice);
        },
        Newborn_visited_by_a_CHW_within_6_days__c:
          p.properties.visit_6_days_from_delivery,
        //Nutrition  =====================//
        Caretaker_action_after_muac_screening__c:
          p.properties.mother_screened_muac_action,
        Caretaker_muac_findings__c:
          p.properties.mother_screened_child_muac_result,
        Food_groups_3_times_a_day__c: p.properties.food_groups,
        Caretaker_screened_for_muac_this__c: () => {
          var choice = p.properties.mother_screened_child_muac;
          return cleanChoice(choice);
        },
        Caretaker_trained_in_muac__c: () => {
          var choice = p.properties.mother_trained_muac;
          return cleanChoice(choice);
        },
        of_Caretaker_MUAC_screenings__c: p.properties.mother_nb_screening,
        Current_Weight__c: p.properties.Current_Weight, //Only on task update
        Current_Height__c: p.properties.current_height,
        Current_MUAC__c: p.properties.MUAC,
        Current_Nutrition_Status__c: () => {
          var status = p.properties.Nutrition_Status;
          return status ? nutritionMap[status] : undefined;
        },
        //TT5 & HAWI  =====================//
        TT5_Mother_Registrant__c: () => {
          var preg = p.properties.Pregnant;
          return preg == 'Yes' ? 'Yes' : null;
        },
        Enrollment_Date__c: () => {
          var age = p.properties.age;
          var date = p.server_date_modified;
          var preg = p.properties.Pregnant;
          return age < 5 || preg == 'Yes' ? date : null;
        },
        HAWI_Enrollment_Date__c: () => {
          var date = p.server_date_modified;
          var status = p.properties.hiv_status;
          return status == 'positive' ? date : null;
        },
        Thrive_Thru_5_Registrant__c: () => {
          var age = p.properties.age;
          var preg = p.properties.Pregnant;
          return age < 5 || preg == 'Yes' ? 'Yes' : 'No';
        },
        HAWI_Registrant__c: () => {
          var status = p.properties.hiv_status;
          return status == 'positive' ? 'Yes' : 'No';
        },
        //ANC  =====================//
        ANC_1__c: () => {
          var date = p.properties.ANC_1;
          return date && date !== '' ? date : undefined;
        },
        ANC_2__c: () => {
          var date = p.properties.ANC_2;
          return date && date !== '' ? date : undefined;
        },
        ANC_3__c: () => {
          var date = p.properties.ANC_3;
          return date && date !== '' ? date : undefined;
        },
        ANC_4__cL: () => {
          var date = p.properties.ANC_4;
          return date && date !== '' ? date : undefined;
        },
        ANC_5__c: () => {
          var date = p.properties.ANC_5;
          return date && date !== '' ? date : undefined;
        },
        Date_of_Birth__c: () => {
          var date = p.properties.DOB;
          return date && date !== '' ? date : undefined;
        },
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
        Did_you_counsel_caregiver_on__c: () => {
          var choice =
            p.properties.did_you_counsel_the_caregiver_on_delayed_milestones;
          return cleanChoice(choice);
        },
        Delayed_Milestone__c: () => {
          var choice = p.properties.does_the_child_has_a_delayed_milestone;
          return cleanChoice(choice);
        },
        Child_has_2_or_more_play_items__c: () => {
          var choice =
            p.properties.does_the_child_has_2_or_more_play_items_at_home;
          return cleanChoice(choice);
        },
        Child_has_3_or_more_picture_books__c: () => {
          var choice = p.properties.does_the_child_has_3_or_more_picture_books;
          return cleanChoice(choice);
        },
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
        //Death  =====================//
        Date_of_Death__c: p.properties.Date_of_Death,
        Cause_of_Death__c: () => {
          var death = p.properties.cause_of_death_dead;
          return death ? death.toString().replace(/_/g, ' ') : death;
        },
        Verbal_autopsy__c: p.properties.verbal_autopsy,
        //Closing  =====================//
        Last_Modified_Date_CommCare__c: p.date_modified,
        Case_Closed_Date__c: p.date_closed,
      };
    });

  sfRecordMapping.forEach(rec => {
    Object.entries(rec).forEach(([key, value]) => {
      if (value === '') rec[key] = undefined;
    });
  });

  // console.log(JSON.stringify(sfRecordMapping, null, 2));
  return {
    ...state,
    motherMapping,
    sfRecordMapping,
    caregiverMapping,
    householdMapping,
    headOfHouseholdMapping,
  };
});

// upsertIf(
//   state.data.properties.commcare_username !== 'test.2021' &&
//     state.data.properties.test_user !== 'Yes',
//   'Household__c',
//   'CommCare_Code__c',
//   fields(
//     field('CommCare_Code__c', state => {
//       return (
//         dataValue('indices.parent.case_id')(state) ||
//         dataValue('properties.parent_id')(state)
//       );
//     })
//   )
// ),

bulk(
  'Household__c',
  'upsert',
  {
    extIdField: 'CommCare_Code__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => {
    console.log('Bulk upserting...');
    return state.householdMapping;
  }
);

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
  },
  state => {
    console.log('Bulk upserting person...');
    return state.sfRecordMapping;
  }
);

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
  },
  state => {
    console.log('Bulk upserting primary caregiver...');
    return state.caregiverMapping;
  }
);

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
  },
  state => {
    console.log('Bulk upserting mother...');
    return state.motherMapping;
  }
);

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
  },
  state => {
    console.log('Bulk upserting head of household...');
    return state.headOfHouseholdMapping;
  }
);
