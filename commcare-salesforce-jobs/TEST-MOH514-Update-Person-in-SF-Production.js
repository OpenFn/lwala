// MOH514 - Update Person form
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.Clinical_Services")(state) !==
    undefined
  ) {
    const clinical = state.data.form.TT5.Child_Information.Clinical_Services;
    if (!Array.isArray(clinical)) {
      state.data.form.TT5.Child_Information.Clinical_Services = [clinical];
    }
  }

  if (dataValue("form.HAWI.Clinical_Services_Rendered")(state) !== undefined) {
    const clinical1 = state.data.form.HAWI.Clinical_Services_Rendered;
    if (!Array.isArray(clinical1)) {
      state.data.form.HAWI.Clinical_Services_Rendered = [clinical1];
    }
  }

  state.cleanChoice = function (state, choice) {
    if (choice) {
      return choice.charAt(0).toUpperCase() + choice.slice(1).replace("_", " ");
    } else {
      return "";
    }
  };

  state.handleMultiSelect = function (state, multiField) {
    return multiField
      ? multiField
          .replace(/ /gi, ";")
          .toLowerCase()
          .split(";")
          .map((value) => {
            return (
              value.charAt(0).toUpperCase() + value.slice(1).replace("_", " ")
            );
            //return value;
          })
          .join(";")
      : "";
  };

  const counselMap = {
    anc_visits: "ANC Visits",
    early_initiation_of_anc_less_than_3_months:
      "Early initiation of ANC (less than 3 months)",
    completing_recomended_anc_visits: "Completing recomended ANC visits",
    danger_signs: "Danger signs",
    skilled_birth: "Skilled birth",
    immunization: "Immunization",
    individual_birth_plan: "Individual Birth Plan",
    emergency_preparedness: "Emergency preparedness",
    childcare_and_affection: "Childcare and affection",
    nutrition_counseling: "Nutrition counseling",
    growth_monitoring: "Growth monitoring",
    exclusive_breastfeeding: "Exclusive breastfeeding",
    complementary_feeding: "Sleeping under LLITN",
    sleeping_under_llitn: "Knowing HIV status",
    knowing_hiv_status: "Indoor pollution",
    indoor_pollution: "Personal Hygiene",
    personal_hygiene: "Safe drinking water",
    safe_drinking_water: "Safe disposal of human waste",
    safe_disposal_of_human_waste: "Complementary feeding",
  };

  const serviceMap = {
    Scheduled_PSC_Apt: "Scheduled PSC Apt",
    Adverse_Drug_Reaction_Side_Effect: "Adverse Drug Reaction/Side Effect",
    Malnutrition: "Malnutrition",
    Malaria: "Malaria",
    TB: "TB",
    Treatment_for_Other_OIs: "Treatment for other Ols",
    ARI: "ARI",
    Anemia: "Anemia",
    Diarrhea: "Diarrhea",
    Pregnancy_Care: "Pregnancy Care (ANC)",
    Family_Planning: "Family Planning (FP)",
    Preconception_Counseling: "Preconception Counseling",
    Injury: "Injury",
    Other: "Other",
  };

  const reasonMapping = {
    lack_of_access_to_fp_information: "Lack of access to FP information",
    no_access_to_fp_services_hospitals:
      "Lack of hospitals or places where FP services can be accessed",
    not_willing_to_use_fp_due_to_negative_effects_myths_and_misconceptions:
      "Myths and misconceptions",
    barriers_at_service_delivery_points: "Barriers at service delivery points",
    pregnant: "The client is pregnant",
    intentions_of_getting_pregnant: "Intentions of getting pregnant",
    not_sexually_active: "The client is not sexually active",
    other_barriers_culture_male_partners_parents_etc:
      "Other barriers (culture, male partners, parents, etc)",
  };

  return {
    ...state,
    counselMap,
    serviceMap,
    reasonMapping,
  };
});

// Evaluates client status and how to upsert Person records
alterState((state) => {
  if (
    dataValue("form.Status.Client_Status")(state) == "Active" &&
    dataValue("form.Source")(state) == 1 &&
    dataValue("metadata.username")(state) !== "test.2021"
  ) {
    // Deliveries
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        field(
          "deworming_medication__c",
          dataValue("form.TT5.Child_Information.Deworming")
        ), // new mapping for deworming
        field("Source__c", 1),
        field("CommCare_ID__c", dataValue("form.case.@case_id")),
        relationship(
          "Household__r",
          "CommCare_Code__c",
          dataValue("form.HH_ID")
        ),
        field(
          "MCH_booklet__c",
          dataValue("form.TT5.Mother_Information.mch_booklet")
        ),
        field("Telephone__c", dataValue("form.Status.updated_phone_number")),
        field("CommCare_HH_Code__c", dataValue("form.HH_ID")),
        field("Client_Status__c", dataValue("form.Status.Client_Status")),
        field("Name", (state) => {
          var name1 = dataValue("form.Person_Name")(state);
          var unborn = dataValue(
            "form.ANCs.pregnancy_danger_signs.Delivery_Information.Person_Name"
          )(state);
          var name2 =
            name1 === undefined || name1 === "" || name1 === null
              ? unborn
              : name1.replace(/\w\S*/g, function (txt) {
                  return (
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  );
                });
          return name1 !== null ? name2 : "Unborn Child";
        }),
        field(
          "Gender__c",
          dataValue(
            "form.ANCs.pregnancy_danger_signs.Delivery_Information.Person_Sex"
          )
        ), // new mapping for sex after delivery
        relationship("RecordType", "Name", (state) => {
          var rt = dataValue("form.RecordType")(state);
          return rt === "Unborn" || rt === ""
            ? "Child"
            : rt.toString().replace(/_/g, " "); //convert Unborn children to Child RT
        }),
        field("Reason_for_a_refferal__c", (state) => {
          var purpose = dataValue("form.Purpose_of_Referral")(state);
          var service = dataValue("form.Reason_for_Service")(state);
          var referral =
            purpose == null && service == "Malaria Case" ? "Malaria" : purpose;
          var reason =
            referral === "HIV_Testing_and_Counseling"
              ? "HIV counselling or Testing"
              : referral === "Pregnancy Care"
              ? "Pregnancy Care (ANC)"
              : referral;
          return reason !== undefined
            ? reason.toString().replace(/_/g, " ")
            : null;
        }),
        field("Purpose_of_referral__c", (state) => {
          var purpose =
            dataValue("form.TT5.Child_Information.Clinical_Services.Purpose")(
              state
            ) ||
            dataValue(
              "form.TT5.Child_Information.Nutrition2.Purpose_of_Referral"
            )(state) ||
            dataValue(
              "form.treatment_and_tracking.Referral.Purpose_of_Referral"
            )(state) ||
            //dataValue('form.Purpose_of_Referral')(state) ||
            // dataValue('form.TT5.Child_Information.Danger_Signs.danger_sign_referral.Danger_Signs_Purpose_of_Referral')(state) ||
            dataValue("form.treatment_and_tracking.CCMM.Purpose_of_Referral")(
              state
            ) ||
            //dataValue('form.ANCs.pregnancy_danger_signs.danger_sign_referral.Purpose_of_Referral')(state) ||
            dataValue("form.TT5.Child_Information.Clinical_Services.Purpose")(
              state
            );

          var reason =
            purpose && purpose === "HIV_Testing_and_Counseling"
              ? "HIV Testing and Counseling"
              : purpose === "Pregnancy_Care"
              ? "Pregnancy Care (ANC)"
              : purpose;
          return reason !== undefined
            ? reason.toString().replace(/_/g, " ")
            : null;
        }),
        field("Individual_birth_plan_counselling__c", (state) => {
          var plan1 = dataValue(
            "form.TT5.Child_Information.pregnancy_danger_signs.individual_birth_plan"
          )(state);
          var plan2 = dataValue(
            "form.ANCs.pregnancy_danger_signs.individual_birth_plan"
          )(state);
          return plan2 ? plan2 : plan1;
        }),
        field("Reason_for_not_taking_a_pregnancy_test__c", (state) => {
          var reason = dataValue("form.TT5.Mother_Information.No_Preg_Test")(
            state
          );
          return reason !== undefined
            ? reason.toString().replace(/_/g, " ")
            : null;
        }),
        field("Pregnancy_danger_signs__c", (state) => {
          var signs = dataValue(
            "form.TT5.Child_Information.pregnancy_danger_signs.pregnancy_danger_signs"
          )(state);
          var newSign = "";
          if (signs !== undefined) {
            signs = signs
              .toLowerCase()
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(";");
            return (newSign = signs
              ? signs.toString().replace(/_/g, " ")
              : signs);
          } else {
            return (newSign = null);
          }
          return newSign;
        }),
        field("Child_Danger_Signs__c", (state) => {
          var signs = dataValue(
            "form.TT5.Child_Information.Danger_Signs.Other_Danger_Signs"
          )(state);
          var newSign = "";
          if (signs !== undefined) {
            signs = signs
              .toLowerCase()
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(";");
            return (newSign = signs.toString().replace(/_/g, " "));
          } else {
            return signs;
          }
        }),
        field("Child_Status__c", (state) => {
          var status = dataValue("form.case.update.child_status")(state);
          var rt = dataValue("form.RecordType")(state);
          //if(status!==undefined && rt=="Unborn" && status!=="Yes"){ //Q: child_status not present?
          if (status !== undefined && rt == "Unborn") {
            status = "Unborn";
          } else if (status !== undefined && rt == "Born") {
            status = "Born";
          }
          return status;
        }),
        field("Current_Malaria_Status__c", dataValue("form.Malaria_Status")),
        field(
          "Counselled_on_Exclusive_Breastfeeding__c",
          dataValue(
            "form.TT5.Child_Information.Exclusive_Breastfeeding.counseling"
          )
        ), //multiselect?
        field(
          "Unique_Patient_Code__c",
          dataValue("form.case.update.Unique_Patient_Code")
        ),
        field(
          "Active_in_Support_Group__c",
          dataValue("form.case.update.Active_in_Support_Group")
        ),
        field(
          "Preferred_Care_Facility__c",
          dataValue("form.HAWI.Preferred_Care_F.Preferred_Care_Facility")
        ),
        field("HAWI_Defaulter__c", (state) => {
          var hawi = dataValue("form.HAWI.Preferred_Care_F.default")(state);
          return hawi == "Yes" ? true : false;
        }),
        field(
          "Date_of_Default__c",
          dataValue("form.HAWI.Preferred_Care_F.date_of_default")
        ),
        field(
          "Persons_temperature__c",
          dataValue("form.treatment_and_tracking.temperature")
        ),
        field(
          "Days_since_illness_start__c",
          dataValue("form.treatment_and_tracking.duration_of_sickness")
        ),
        field(
          "Newborn_visited_48_hours_of_delivery__c",
          dataValue(
            "form.TT5.Child_Information.newborn_visited_48_hours_of_delivery"
          )
        ),
        field(
          "Last_Malaria_Home_Test__c",
          dataValue("form.treatment_and_tracking.malaria_test_date")
        ),
        field(
          "Current_Malaria_Status__c",
          dataValue("form.treatment_and_tracking.malaria_test_results")
        ),
        field(
          "Last_Malaria_Home_Treatment__c",
          dataValue("form.TT5.Child_Information.CCMM.Home_Treatment")
        ),
        field(
          "Malaria_Follow_Up__c",
          dataValue("form.TT5.Child_Information.CCMM.Fever-Follow-Up_By_Date")
        ),
        field(
          "Malaria_Facility__c",
          dataValue("form.TT5.Child_Information.CCMM.malaria_referral_facility")
        ),
        field(
          "Malaria_Referral__c",
          dataValue("form.TT5.Child_Information.CCMM.Referral_Date")
        ),
        field(
          "Fever_over_7days__c",
          dataValue("form.treatment_and_tracking.symptoms_check_fever")
        ),
        field(
          "Cough_over_14days__c",
          dataValue("form.treatment_and_tracking.symptoms_check_cough")
        ),
        field(
          "Diarrhoea_over_14days__c",
          dataValue("form.treatment_and_tracking.symptoms_check_diarrhea")
        ),
        field(
          "Diarrhoea_less_than_14_days__c",
          dataValue("form.treatment_and_tracking.mild_symptoms_check_diarrhea")
        ),
        field(
          "TB_patients_therapy_observed__c",
          dataValue("form.treatment_and_tracking.observed_tb_therapy")
        ),
        //field("Injuries_and_wounds_managed__c", dataValue("Injuries_and_wounds_managed")),
        field(
          "Injuries_or_wounds__c",
          dataValue("form.treatment_and_tracking.wounds_or_injuries")
        ),
        field("Currently_on_ART_s__c", dataValue("form.HAWI.ART")),
        field("ART_Regimen__c", dataValue("form.HAWI.ARVs")),
        field(
          "Immediate_Breastfeeding__c",
          dataValue(
            "form.ANCs.pregnancy_danger_signs.Delivery_Information.Breastfeeding_Delivery"
          )
        ),
        field("Verbal_autopsy__c", dataValue("form.Status.verbal_autopsy")),
        field("Date_of_Birth__c", dataValue("form.case.update.DOB")),
        field("Place_of_Delivery__c", (state) => {
          var facility = dataValue("form.TT5.Child_Information.Delivery_Type")(
            state
          );
          if (facility !== undefined) {
            return facility == "Skilled" ? "Facility" : "Home";
          }
          return facility;
        }),
        field("Delivery_Facility__c", (state) => {
          var facility = dataValue(
            "form.TT5.Child_Information.Delivery_Facility"
          )(state);
          return facility !== undefined
            ? facility.toString().replace(/_/g, " ")
            : null;
        }),
        field(
          "Delivery_Facility_Other__c",
          dataValue("form.TT5.Child_Information.Delivery_Facility_Other")
        ),
        field(
          "Exclusive_Breastfeeding__c",
          dataValue(
            "form.TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding"
          )
        ),
        field(
          "Counselled_on_Exclusive_Breastfeeding__c",
          dataValue(
            "form.TT5.Child_Information.Exclusive_Breastfeeding.counseling"
          )
        ),
        field("Family_Planning__c", (state) => {
          var method1 = dataValue(
            "form.Basic_Information.family_planning.Currently_on_family_planning"
          )(state);
          var method2 = dataValue(
            "form.TT5.Mother_Information.family_planning"
          )(state);
          return method2 ? "Yes" : method1;
        }),
        field("Family_Planning_Method__c", (state) => {
          var method1 = dataValue(
            "form.Basic_Information.family_planning.Family_Planning_Method"
          )(state);
          var method2 = dataValue(
            "form.TT5.Mother_Information.family_planning_method"
          )(state);
          return method2
            ? method2.toString().replace(/_/g, " ")
            : method1
            ? method1.toString().replace(/_/g, " ")
            : method1;
        }),
        field("Reasons_for_not_taking_FP_method__c", (state) => {
          var reason = dataValue(
            "form.TT5.Mother_Information.No_FPmethod_reason"
          )(state);
          return reason ? state.reasonMapping[reason] : "";
        }),
        field("Pregnant__c", (state) => {
          var preg = dataValue("form.TT5.Mother_Information.Pregnant")(state);
          return preg == "Yes" ? true : false;
        }),
        field(
          "Counselled_on_FP_Methods__c",
          dataValue("form.TT5.Mother_Information.CounselledFP_methods")
        ),
        field("Client_counselled_on__c", (state) => {
          var choices = dataValue(
            "form.treatment_and_tracking.counseling.counsel_topic"
          )(state);
          var choiceGroups = choices ? choices.split(" ") : null;
          var choicesMulti = choiceGroups
            ? choiceGroups
                .map((cg) => {
                  return state.counselMap[cg];
                })
                .join(";")
            : choiceGroups;
          return choicesMulti;
        }),
        field("Client_provided_with_FP__c", (state) => {
          var choice = dataValue(
            "form.TT5.Mother_Information.was_the_woman_15-49yrs_provided_with_family_planning_commodities_by_chv"
          )(state);
          return state.cleanChoice(state, choice);
        }),
        field(
          "Newborn_visited_48_hours_of_delivery__c",
          dataValue(
            "form.TT5.Child_Information.newborn_visited_48_hours_of_delivery"
          )
        ),
        field("Newborn_visit_counselling__c", (state) => {
          var choice = dataValue(
            "form.TT5.Child_Information.did_you_consel_the_mother_on1"
          )(state);
          return state.cleanChoice(state, choice);
        }),
        field(
          "mother_visited_48_hours_of_the_delivery__c",
          dataValue("form.TT5.Child_Information.visit_mother_48")
        ),
        field("Mother_visit_counselling__c", (state) => {
          var choice = dataValue(
            "form.TT5.Child_Information.did_you_consel_the_mother_on2"
          )(state);
          return state.cleanChoice(state, choice);
        }),
        field("Mother_ANC_Referral__c", dataValue("form.ANCs.refer_for_anc")),
        field("ANC_referral_date__c", dataValue("form.ANCs.refer_anc")),
        field(
          "Mother_Skilled_Delivery_Referral__c",
          dataValue("form.ANCs.pregnancy_danger_signs.refer_skilled_delivery")
        ),
        field(
          "Mother_skilled_Ref_date__c",
          dataValue("form.ANCs.pregnancy_danger_signs.refer_skilled_delivery1")
        ),
        field(
          "Woman_referred_for_FP_services__c",
          dataValue(
            "form.TT5.Mother_Information.was_the_woman_referred_for_family_planning_services"
          )
        ),
        field("Family_planning_services_referral_date__c", (state) => {
          var referred = dataValue(
            "form.TT5.Mother_Information.was_the_woman_referred_for_family_planning_services"
          )(state);
          return referred == "yes"
            ? dataValue("form.TT5.Mother_Information.date_today")(state)
            : null;
        }),
        field(
          "Mother_PNC_referral__c",
          dataValue(
            "form.ANCs.pregnancy_danger_signs.Delivery_Information.refer_pnc"
          )
        ),
        field(
          "Mother_PNC_referral_date__c",
          dataValue(
            "form.ANCs.pregnancy_danger_signs.Delivery_Information.refer_the_mother_for_pnc"
          )
        ),
        field(
          "Immunizations_referral__c",
          dataValue(
            "form.TT5.Child_Information.Immunizations.did_you_refer_the_child_0-11_months_for_immunization"
          )
        ),
        field(
          "Immunizations_referral_date__c",
          dataValue(
            "form.TT5.Child_Information.Immunizations.refer_immunization"
          )
        ),
        field(
          "Vitamin_A_supplement_referral__c",
          dataValue(
            "form.TT5.Child_Information.Immunizations.did_you_refer_the_child_6-59_months_for_vitamin_a_supplements"
          )
        ),
        field(
          "Vitamin_A_supplement_referral_date__c",
          dataValue(
            "form.TT5.Child_Information.Immunizations.refer_vitamin_a_supplements"
          )
        ),
        field(
          "Cough_14_days_referral__c",
          dataValue(
            "form.treatment_and_tracking.did_you_refer_the_client_for_cough_14_days"
          )
        ),
        field(
          "Cough_14_days_referral_date__c",
          dataValue("form.treatment_and_tracking.refer_14days")
        ),
        field("Know_HIV_status__c", dataValue("form.known_hiv_status")),
        field(
          "HIV_counselling_and_testing_referral__c",
          dataValue("form.did_you_refer_for_hiv_counselling_and_testing_htc")
        ),
        field(
          "HIV_counseling_and_testing_referral_date__c",
          dataValue("form.refer_hiv")
        ),
        field("Treatment_Distribution__c", (state) => {
          var choice = dataValue(
            "form.treatment_and_tracking.distribution.distributed_treatments"
          )(state);
          return state.cleanChoice(state, choice);
        }),
        field(
          "Nutrition_referral_date__c",
          dataValue("form.TT5.Child_Information.Nutrition2.date_malnutrition")
        ),
        field(
          "Nutrition_referral__c",
          dataValue("form.TT5.Child_Information.Nutrition2.Referral")
        ),
        field(
          "Current_Height__c",
          dataValue("form.TT5.Child_Information.Nutrition.current_height")
        ),
        field("Cause_of_Death__c", (state) => {
          var choice = dataValue("form.Status.Cause_of_Death")(state);
          return state.cleanChoice(state, choice);
        }),
        field(
          "ART_treatment_referral_date__c",
          dataValue("form.HAWI.when_ART_refer")
        ),
        field(
          "ART_treatment_referral__c",
          dataValue("form.HAWI.did_you_refer")
        ),
        field(
          "ART_treatment_referral_date__c",
          dataValue("form.HAWI.when_ART_refer")
        ),
        field("ART_treatment_referral__c", dataValue("form.HAWI.default")),
        field(
          "Immunizations_referral_date__c",
          dataValue(
            "form.TT5.Child_Information.Immunizations.referral_for_immunization"
          )
        ),
        field(
          "Immunizations_referral__c",
          dataValue(
            "form.TT5.Child_Information.Immunizations.refer_immunization_type"
          )
        ),
        field(
          "Child_missed_immunization_type__c",
          dataValue(
            "form.TT5.Child_Information.Immunizations.immunization_type"
          )
        ),
        field(
          "TB_treatment_referral_date__c",
          dataValue("form.treatment_and_tracking.refer_clientTB")
        ),
        field(
          "TB_referral__c",
          dataValue("form.treatment_and_tracking.tb_treatment")
        ),
        field("Default_on_TB_treatment__c", (state) => {
          var choice = dataValue(
            "form.treatment_and_tracking.default_tb_treatment"
          )(state);
          return state.cleanChoice(state, choice);
        }),
        field(
          "Received_pregnancy_test__c",
          dataValue(
            "form.TT5.Mother_Information.did_you_adminsiter_a_pregnancy_test"
          )
        ),
        field(
          "Pregnancy_test_result__c",
          dataValue("form.TT5.Mother_Information.pregnancy_test_result")
        ),
        field(
          "Pregnancy_referral__c",
          dataValue("form.TT5.Mother_Information.refer_preg")
        ),
        field(
          "Pregnancy_referral_date__c",
          dataValue("form.TT5.Mother_Information.referal_pregnancy")
        ),
        field("Chronic_illness__c", (state) => {
          var choice = dataValue(
            "form.please_specify_which_chronic_illness_the_person_has"
          )(state);
          var choice2 = state.handleMultiSelect(state, choice);
          return choice2 ? choice2.replace(/_/g, " ") : "";
        }),
        field(
          "Chronic_illness_referral__c",
          dataValue("form.did_you_refer_the_client_for_any_chronic_illness")
        ),
        field(
          "Chronic_illness_referral_date__c",
          dataValue("form.date_chronic_illness")
        ),
        field(
          "Birth_Certificate__c",
          dataValue("form.Status.birth_certificate")
        ),
        field(
          "Child_zinc__c",
          dataValue(
            "form.TT5.Child_Information.Clinical_Services.diarrhea_clinic_treatment_zinc"
          )
        ),
        field(
          "Child_ORS__c",
          dataValue(
            "form.TT5.Child_Information.Clinical_Services.diarrhea_clinic_treatment_ORS"
          )
        ),
        field(
          "Childs_breath_per_minute__c",
          dataValue("form.psbi.breaths_per_minuite")
        ),
        field(
          "Child_fast_breathing_referral_date__c",
          dataValue("form.psbi.Fast_breathing_followup_date__c")
        ),
        field(
          "Fast_breathing_followup_date__c",
          dataValue("form.psbi.when_did_you_follow_up_for_fast_breathing")
        ),
        field(
          "Child_chest_in_drawing__c",
          dataValue("form.psbi.Child_chest_in_drawing_c")
        ),
        field(
          "Child_chest_in_drawing_referral_date__c",
          dataValue("form.psbi.Child_chest_in_drawing_referral_date_c")
        ),
        field("Childs_chest_indrawing_followup__c", (state) => {
          var choice = dataValue("form.psbi.Childs_chest_indrawing_followup_c")(
            state
          );
          var choice2 = choice ? choice.split(" ").join(";") : choice;
          return choice2 ? choice2.replace(/_/g, " ") : choice2;
        })
      )
    )(state);
  }
  // Transfer Outs
  else if (dataValue("form.Status.Client_Status")(state) == "Transferred_Out") {
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        field("CommCare_ID__c", dataValue("form.case.@case_id")),
        field("Source__c", 1),
        field("Name", (state) => {
          var name1 = dataValue("form.Person_Name")(state);
          var name2 = name1.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
          return name2;
        }),
        field("Client_Status__c", "Transferred Out"),
        field("TT5_Mother_Registrant__c", "No"),
        field("Active_TT5_Mother__c", "No"),
        field("Active_in_Thrive_Thru_5__c", "No"),
        field("Thrive_Thru_5_Registrant__c", "No"),
        field("Inactive_Date__c", dataValue("form.Date")),
        field("Active_in_HAWI__c", "No"),
        field("Active_TT5_Mother__c", "No"),
        field(
          "Date_of_Transfer_Out__c",
          dataValue("form.Status.Date_of_Transfer_Out")
        )
      )
    )(state);
  }
  // Lost to Follow Up
  else if (
    dataValue("form.Status.Client_Status")(state) == "Lost_to_Follow_Up"
  ) {
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        field("Source__c", 1),
        field("CommCare_ID__c", dataValue("form.case.@case_id")),
        field("Name", (state) => {
          var name1 = dataValue("form.Person_Name")(state);
          var name2 = name1.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
          return name2;
        }),
        field("Client_Status__c", "Lost to Follow-Up"),
        field("Active_in_Thrive_Thru_5__c", "No"),
        field("Active_TT5_Mother__c", "No"),
        field("TT5_Mother_Registrant__c", "No"),
        field("Active_in_HAWI__c", "No"),
        field("Date_Last_Seen__c", dataValue("form.Status.Date_Last_Seen")),
        field("Inactive_Date__c", dataValue("form.Date"))
      )
    )(state);
  }
  // Graduated from Thrive Thru 5
  else if (
    dataValue("form.Status.Client_Status")(state) == "Graduated_From_TT5"
  ) {
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        field("Source__c", 1),
        field("CommCare_ID__c", dataValue("form.case.@case_id")),
        field("Name", (state) => {
          var name1 = dataValue("form.Person_Name")(state);
          var name2 = name1.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
          return name2;
        }),
        field("Client_Status__c", "Graduated From TT5"),
        field("Active_in_Thrive_Thru_5__c", "No"),
        field("Active_TT5_Mother__c", "No"),
        field("TT5_Mother_Registrant__c", "No"),
        field("Active_in_HAWI__c", "No"),
        field("Active_TT5_Mother__c", "No"),
        field("Date_Last_Seen__c", dataValue("form.Status.Date_Last_Seen")),
        field("Inactive_Date__c", dataValue("form.Date"))
      )
    )(state);
  }
  // Data entry error
  else if (
    dataValue("form.Status.Client_Status")(state) == "Data_Entry_Error"
  ) {
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        field("Source__c", 1),
        field("CommCare_ID__c", dataValue("form.case.@case_id")),
        field("Name", (state) => {
          var name1 = dataValue("form.Person_Name")(state);
          var name2 = name1.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
          return name2;
        }),
        field("Client_Status__c", "Data Entry Error"),
        field("Active_in_Thrive_Thru_5__c", "No"),
        field("Active_TT5_Mother__c", "No"),
        field("TT5_Mother_Registrant__c", "No"),
        field("Active_in_HAWI__c", "No"),
        field("Inactive_Date__c", dataValue("form.Date"))
      )
    )(state);
  }
  // Deceased
  else if (dataValue("form.Status.Client_Status")(state) == "Deceased") {
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        field("Source__c", 1),
        field("CommCare_ID__c", dataValue("form.case.@case_id")),
        field("Name", (state) => {
          var name1 = dataValue("form.Person_Name")(state);
          var name2 = name1.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
          return name2 + "deceased";
        }),
        field("Verbal_autopsy__c", dataValue("form.Status.verbal_autopsy")),
        field("Client_Status__c", "Deceased"),
        field("Child_Status__c", "Deceased"),
        field("Active_in_Thrive_Thru_5__c", "No"),
        field("Thrive_Thru_5_Registrant__c", "No"),
        field("Active_in_HAWI__c", "No"),
        field("Active_TT5_Mother__c", "No"),
        field("TT5_Mother_Registrant__c", "No"),
        field("Date_of_Death__c", dataValue("form.Status.Date_of_Death")),
        field("Cause_of_Death__c", (state) => {
          var death = dataValue("form.Status.Cause_of_Death")(state);
          return death ? death.toString().replace(/_/g, " ") : death;
        }),
        field("Inactive_Date__c", dataValue("form.Date"))
      )
    )(state);
  }

  console.log("None of the ifs matched, skipping upsert and returning state.");
  return state;
});

// Person is added to TT5 ?
alterState((state) => {
  if (
    (dataValue("form.case.update.TT5_enrollment_status")(state) ==
      "Enrolled in TT5" ||
      dataValue("form.age")(state) < 5 ||
      dataValue("form.case.update.Active_in_TT5")(state) == "Yes" ||
      dataValue("form.case.update.Pregnant") == "Yes") &&
    dataValue("form.Status.Client_Status")(state) == "Active"
  ) {
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        field("CommCare_ID__c", dataValue("form.case.@case_id")),
        field("Active_in_Thrive_Thru_5__c", "Yes"),
        field("Enrollment_Date__c", dataValue("metadata.timeEnd")),
        field("Thrive_Thru_5_Registrant__c", "Yes"),
        field("Active_TT5_Mother__c", (state) => {
          var preg = dataValue("form.case.update.Pregnant")(state);
          return preg == "Yes" ? "Yes" : null;
        }),
        field("TT5_Mother_Registrant__c", (state) => {
          var preg = dataValue("form.case.update.Pregnant")(state);
          return preg == "Yes" ? "Yes" : null;
        })
      )
    )(state);
  }

  console.log("No person was added to TT5, skipping upsert.");
  return state;
});

//Person over age 5 / NOT active in TT5
alterState((state) => {
  if (
    (dataValue("form.age")(state) > 5 ||
      dataValue("form.case.update.Active_in_TT5")(state) == "No") &&
    dataValue("form.Status.Client_Status")(state) == "Active"
  ) {
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        field("CommCare_ID__c", dataValue("form.case.@case_id")),
        field("Active_in_Thrive_Thru_5__c", "No"),
        field("Thrive_Thru_5_Registrant__c", "No")
      )
    )(state);
  }

  console.log("No person over age 5, skipping upsert.");
  return state;
});

//Person is added to HAWI ?
alterState((state) => {
  if (
    (dataValue("form.case.update.HAWI_enrollment_status")(state) ==
      "Enrolled in HAWI" ||
      dataValue("form.hiv_status")(state) == "positive" ||
      dataValue("form.case.update.Active_in_HAWI")(state) == "Yes") &&
    dataValue("form.Status.Client_Status")(state) == "Active"
  ) {
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        field("CommCare_ID__c", dataValue("form.case.@case_id")),
        field("Active_in_HAWI__c", "Yes"),
        field("HAWI_Enrollment_Date__c", dataValue("metadata.timeEnd")),
        field("HAWI_Registrant__c", "Yes"),
        field("HIV_Status__c", "positive")
      )
    )(state);
  }

  console.log("No person added to HAWI, skipping upsert.");
  return state;
});

// Person is NOT enrolled in HAWI
alterState((state) => {
  if (
    dataValue("form.case.update.HAWI_enrollment_status")(state) ==
      "Not enrolled in HAWI" &&
    dataValue("form.Status.Client_Status")(state) == "Active"
  ) {
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        field("CommCare_ID__c", dataValue("form.case.@case_id")),
        field("Active_in_HAWI__c", "No"),
        field("HAWI_Registrant__c", "No")
      )
    )(state);
  }

  console.log("No person added to HAWI, skipping upsert.");
  return state;
});

//--- UPSERT SERVICE RECORDS ---/
// ANC1
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.ANCs.ANC_1")(state) ||
    dataValue("form.ANCs.ANC_1")(state)
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("Service_UID__c", (state) => {
          const id = dataValue("$.form.case.@case_id")(state);
          const date = dataValue("$.form.TT5.Child_Information.ANCs.ANC_1")(
            state
          );
          const date2 = date ? date : dataValue("form.ANCs.ANC_1")(state);
          return id + date2 + "ANC1";
        }),
        field("Source__c", 1),
        field("Reason_for_Service__c", "ANC 1"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Date__c", (state) => {
          var date = dataValue("form.TT5.Child_Information.ANCs.ANC_1")(state);
          return date ? date : state.data.form.case.update.ANC_1;
        }),
        field("Follow_Up_By_Date__c", dataValue("form.Date")),
        field("Purpose_of_Referral__c", "ANC 1"),
        field("Type_of_Service__c", "Ante-Natal Care"),
        field("RecordTypeID", "01224000000YAuK"),
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        ),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue("form.TT5.Child_Information.ANCs.Facility1")(
            state
          );
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        })
      )
    )(state);
  }

  console.log("No ANC1.");
  return state;
});

//ANC2
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.ANCs.ANC_2")(state) ||
    dataValue("form.ANCs.ANC_2")(state)
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("Service_UID__c", (state) => {
          const id = dataValue("$.form.case.@case_id")(state);
          const date = dataValue("$.form.TT5.Child_Information.ANCs.ANC_2")(
            state
          );
          const date2 = date ? date : dataValue("form.ANCs.ANC_2")(state);
          return id + date2 + "ANC2";
        }),
        field("Source__c", 1),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Reason_for_Service__c", "ANC 2"),
        field("Date__c", (state) => {
          var date = dataValue("form.TT5.Child_Information.ANCs.ANC_2")(state);
          return date ? date : state.data.form.case.update.ANC_2;
        }),
        field("Follow_Up_By_Date__c", dataValue("form.Date")),
        field("Purpose_of_Referral__c", "ANC 2"),
        field("Type_of_Service__c", "Ante-Natal Care"),
        field("RecordTypeID", "01224000000YAuK"),
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        ),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue("form.TT5.Child_Information.ANCs.Facility2")(
            state
          );
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        })
      )
    )(state);
  }

  console.log("No ANC2.");
  return state;
});

//ANC3
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.ANCs.ANC_3")(state) ||
    dataValue("form.ANCs.ANC_3")(state)
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("Service_UID__c", (state) => {
          const id = dataValue("$.form.case.@case_id")(state);
          const date = dataValue("$.form.TT5.Child_Information.ANCs.ANC_3")(
            state
          );
          const date2 = date ? date : dataValue("form.ANCs.ANC_3")(state);
          return id + date2 + "ANC3";
        }),
        field("Source__c", true),
        field("Reason_for_Service__c", "ANC 3"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Date__c", (state) => {
          var date = dataValue("form.TT5.Child_Information.ANCs.ANC_3")(state);
          return date ? date : state.data.form.case.update.ANC_3;
        }),
        field("Follow_Up_By_Date__c", dataValue("form.Date")),
        field("Purpose_of_Referral__c", "ANC 3"),
        field("Type_of_Service__c", "CHW Mobile Survey"),
        field("RecordTypeID", "01224000000YAuK"),
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        ),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue("form.TT5.Child_Information.ANCs.Facility3")(
            state
          );
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        })
      )
    )(state);
  }

  console.log("No ANC3.");
  return state;
});

//ANC4
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.ANCs.ANC_4")(state) ||
    dataValue("form.ANCs.ANC_4")(state)
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("Service_UID__c", (state) => {
          const id = dataValue("$.form.case.@case_id")(state);
          const date = dataValue("$.form.TT5.Child_Information.ANCs.ANC_4")(
            state
          );
          const date2 = date ? date : dataValue("form.ANCs.ANC_4")(state);
          return id + date2 + "ANC4";
        }),
        field("Source__c", 1),
        field("Reason_for_Service__c", "ANC 4"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Date__c", (state) => {
          var date = dataValue("form.TT5.Child_Information.ANCs.ANC_4")(state);
          return date ? date : state.data.form.case.update.ANC_4;
        }),
        field("Follow_Up_By_Date__c", dataValue("form.Date")),
        field("Purpose_of_Referral__c", "ANC 4"),
        field("Type_of_Service__c", "Ante-Natal Care"),
        field("RecordTypeID", "01224000000YAuK"),
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        ),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue("form.TT5.Child_Information.ANCs.Facility4")(
            state
          );
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        })
      )
    )(state);
  }

  console.log("No ANC4.");
  return state;
});

//ANC5
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.ANCs.ANC_5")(state) ||
    dataValue("form.ANCs.ANC_5")(state)
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("Service_UID__c", (state) => {
          const id = dataValue("$.form.case.@case_id")(state);
          const date = dataValue("$.form.TT5.Child_Information.ANCs.ANC_5")(
            state
          );
          const date2 = date ? date : dataValue("form.ANCs.ANC_5")(state);
          return id + date2 + "ANC5";
        }),
        field("Source__c", 1),
        field("Reason_for_Service__c", "ANC 5"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Date__c", (state) => {
          var date = dataValue("form.TT5.Child_Information.ANCs.ANC_5")(state);
          return date ? date : state.data.form.case.update.ANC_5;
        }),
        field("Follow_Up_By_Date__c", dataValue("form.Date")),
        field("Purpose_of_Referral__c", "ANC 5"),
        field("Type_of_Service__c", "Ante-Natal Care"),
        field("RecordTypeID", "01224000000YAuK"),
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        ),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue("form.TT5.Child_Information.ANCs.Facility5")(
            state
          );
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        })
      )
    )(state);
  }

  console.log("No ANC5.");
  return state;
});

// BCG REVIEWED
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.Immunizations.BCG")(state) ||
    dataValue("form.case.update.BCG")(state)
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("Service_UID__c", (state) => {
          const id = dataValue("$.form.case.@case_id")(state);
          const date = dataValue(
            "$.form.TT5.Child_Information.Immunizations.BCG"
          )(state);
          const date2 = date ? date : dataValue("form.case.update.BCG")(state);
          return id + date2 + "BCG";
        }),
        field("Source__c", 1),
        field("Reason_for_Service__c", "BCG"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Date__c", (state) => {
          var date = dataValue("form.TT5.Child_Information.Immunizations.BCG")(
            state
          );
          return date ? date : state.data.form.case.update.BCG;
        }),
        field("Follow_Up_By_Date__c", dataValue("form.Date")),
        field("Type_of_Service__c", "Immunization"),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        field("RecordTypeID", "01224000000YAuK"),
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        ),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue(
            "form.TT5.Child_Information.Immunizations.Facility_BCG"
          )(state);
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        })
      )
    )(state);
  }

  console.log("Not BCG REVIEWED.");
  return state;
});

// OPV0 REVIEWED
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.Immunizations.OPV0_h")(state) ||
    dataValue("form.case.update.OPV0_h")(state)
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      //'CommCare_Code__c',
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "opv0";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          const id = dataValue("$.form.case.@case_id")(state);
          const date = dataValue(
            "$.form.TT5.Child_Information.Immunizations.OPV0_h"
          )(state);
          const date2 = date
            ? date
            : dataValue("form.case.update.OPV0_h")(state);
          return id + date2 + "OPV0";
        }),
        field("Source__c", 1),
        field("Reason_for_Service__c", "OPV0"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Date__c", (state) => {
          var date = dataValue(
            "form.TT5.Child_Information.Immunizations.OPV0_h"
          )(state);
          return date ? date : state.data.form.case.update.OPV0_h;
        }),
        field("Follow_Up_By_Date__c", dataValue("form.Date")),
        field("Type_of_Service__c", "Immunization"),
        field("RecordTypeID", "01224000000YAuK"),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        ),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue(
            "form.TT5.Child_Information.Immunizations.Facility_OPV_0"
          )(state);
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        })
      )
    )(state);
  }

  console.log("Not OPV0 reviewed.");
  return state;
});

// OPV1 REVIEWED
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.Immunizations.OPV1_h")(state) ||
    dataValue("form.case.update.OPV1_h")(state)
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      //'CommCare_Code__c',
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "opv1";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          const id = dataValue("$.form.case.@case_id")(state);
          const date = dataValue(
            "$.form.TT5.Child_Information.Immunizations.OPV1_h"
          )(state);
          const date2 = date
            ? date
            : dataValue("form.case.update.OPV1_h")(state);
          return id + date2 + "OPV1";
        }),
        field("Source__c", 1),
        field("Reason_for_Service__c", "OPV1"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Date__c", (state) => {
          var date = dataValue(
            "form.TT5.Child_Information.Immunizations.OPV1_h"
          )(state);
          return date ? date : state.data.form.case.update.OPV1_h;
        }),
        field("Follow_Up_By_Date__c", dataValue("form.Date")),
        field("Type_of_Service__c", "Immunization"),
        field("RecordTypeID", "01224000000YAuK"),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        ),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue(
            "form.TT5.Child_Information.Immunizations.Facility_OPV_1"
          )(state);
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        })
      )
    )(state);
  }

  console.log("Not OPV1 reviewed.");
  return state;
});

// OPV2
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.Immunizations.OPV2_h")(state) ||
    dataValue("form.case.update.OPV2_h")(state)
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      //'CommCare_Code__c',
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "opv2";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          const id = dataValue("$.form.case.@case_id")(state);
          const date = dataValue(
            "$.form.TT5.Child_Information.Immunizations.OPV2_h"
          )(state);
          const date2 = date
            ? date
            : dataValue("form.case.update.OPV2_h")(state);
          return id + date2 + "OPV2";
        }),
        field("Source__c", 1),
        field("Reason_for_Service__c", "OPV2"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Date__c", (state) => {
          var date = dataValue(
            "form.TT5.Child_Information.Immunizations.OPV2_h"
          )(state);
          return date ? date : state.data.form.case.update.OPV2_h;
        }),
        field("Follow_Up_By_Date__c", dataValue("form.Date")),
        field("Type_of_Service__c", "Immunization"),
        field("RecordTypeID", "01224000000YAuK"),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        ),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue(
            "form.TT5.Child_Information.Immunizations.Facility_OPV_2"
          )(state);
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        })
      )
    )(state);
  }

  console.log("Not OPV2 reviewed.");
  return state;
});

//OPV3
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.Immunizations.OPV3_h")(state) ||
    dataValue("form.case.update.OPV3_h")(state)
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      //'CommCare_Code__c',
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "opv3";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          const id = dataValue("$.form.case.@case_id")(state);
          const date = dataValue(
            "$.form.TT5.Child_Information.Immunizations.OPV3_h"
          )(state);
          const date2 = date
            ? date
            : dataValue("form.case.update.OPV3_h")(state);
          return id + date2 + "OPV3";
        }),
        field("Source__c", 1),
        field("Reason_for_Service__c", "OPV3"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Date__c", (state) => {
          var date = dataValue(
            "form.TT5.Child_Information.Immunizations.OPV3_h"
          )(state);
          return date ? date : state.data.form.case.update.OPV3_h;
        }),
        field("Type_of_Service__c", "Immunization"),
        field("RecordTypeID", "01224000000YAuK"),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        ),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue(
            "form.TT5.Child_Information.Immunizations.Facility_OPV_3"
          )(state);
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        })
      )
    )(state);
  }

  console.log("Not OPV3 reviewed.");
  return state;
});

//Measles 6
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.Immunizations.Measles6_h")(state) ||
    dataValue("form.case.update.Measles6_h")(state)
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      //'CommCare_Code__c',
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "measles6";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          const id = dataValue("$.form.case.@case_id")(state);
          const date = dataValue(
            "$.form.TT5.Child_Information.Immunizations.Measles6_h"
          )(state);
          const date2 = date
            ? date
            : dataValue("form.case.update.Measles6_h")(state);
          return id + date2 + "Measles6";
        }),
        field("Source__c", 1),
        field("Reason_for_Service__c", "Measles 6"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Date__c", (state) => {
          var date = dataValue(
            "form.TT5.Child_Information.Immunizations.Measles6_h"
          )(state);
          return date ? date : state.data.form.case.update.Measles6_h;
        }),
        field("Type_of_Service__c", "Immunization"),
        field("RecordTypeID", "01224000000YAuK"),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        ),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue(
            "form.TT5.Child_Information.Immunizations.Facility_Measles_6"
          )(state);
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        })
      )
    )(state);
  }

  console.log("No measles 6.");
  return state;
});

//Measles 9
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.Immunizations.Measles9_h")(state) ||
    dataValue("form.case.update.Measles9_h")(state)
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      //'CommCare_Code__c',
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "measles9";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          const id = dataValue("$.form.case.@case_id")(state);
          const date = dataValue(
            "$.form.TT5.Child_Information.Immunizations.Measles9_h"
          )(state);
          const date2 = date
            ? date
            : dataValue("form.case.update.Measles9_h")(state);
          return id + date2 + "Measles9";
        }),
        field("Source__c", 1),
        field("Reason_for_Service__c", "Measles 9"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Date__c", (state) => {
          var date = dataValue(
            "form.TT5.Child_Information.Immunizations.Measles9_h"
          )(state);
          return date ? date : state.data.form.case.update.Measles9_h;
        }),
        field("Type_of_Service__c", "Immunization"),
        field("RecordTypeID", "01224000000YAuK"),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        ),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue(
            "form.TT5.Child_Information.Immunizations.Facility_Measles_9"
          )(state);
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        })
      )
    )(state);
  }

  console.log("No measles 9.");
  return state;
});

//Measles 18
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.Immunizations.Measles18_h")(state) ||
    dataValue("form.case.update.Measles18_h")(state)
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      //'CommCare_Code__c',
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "measles18";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          const id = dataValue("$.form.case.@case_id")(state);
          const date = dataValue(
            "$.form.TT5.Child_Information.Immunizations.Measles18_h"
          )(state);
          const date2 = date
            ? date
            : dataValue("form.case.update.Measles18_h")(state);
          return id + date2 + "Measles18";
        }),
        field("Source__c", 1),
        field("Reason_for_Service__c", "Measles 18"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Date__c", (state) => {
          var date = dataValue(
            "form.TT5.Child_Information.Immunizations.Measles18_h"
          )(state);
          return date ? date : state.data.form.case.update.Measles18_h;
        }),
        field("Type_of_Service__c", "Immunization"),
        field("RecordTypeID", "01224000000YAuK"),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        ),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue(
            "form.TT5.Child_Information.Immunizations.Facility_Measles_18"
          )(state);
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        })
      )
    )(state);
  }

  console.log("No measles 18.");
  return state;
});

//Deworming
alterState((state) => {
  if (dataValue("form.TT5.Child_Information.Deworming")(state) == "Yes") {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "deworming";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "deworming";
          return serviceId;
        }),
        field("Source__c", 1),
        field("Reason_for_Service__c", "Deworming"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Date__c", dataValue("form.Date")),
        field("Follow_Up_By_Date__c", dataValue("form.Date")),
        field("Type_of_Service__c", "Immunization"),
        field("RecordTypeID", "01224000000YAuK"),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        )
      )
    )(state);
  }

  console.log("No deworming.");
  return state;
});

//Home Based care for HAWI clients
alterState((state) => {
  if (
    dataValue("form.HAWI.Home_Based_Care.Home_Based_Care_Provided")(state) !==
      undefined &&
    dataValue("form.HAWI.Home_Based_Care.Home_Based_Care_Provided")(state) !==
      ""
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "homecare";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "homecare";
          return serviceId;
        }),
        field("Source__c", 1),
        field("Reason_for_Service__c", "Home-Based Care"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Date__c", dataValue("form.Date")),
        field("Follow_Up_By_Date__c", dataValue("form.Date")),
        field("Type_of_Service__c", "HIV"),
        field("RecordTypeID", "01224000000YAuK"),
        field("Home_Based_Care_Rendered__c", (state) => {
          var care = "";
          var str = dataValue(
            "form.HAWI.Home_Based_Care.Home_Based_Care_Provided"
          )(state);
          care = str.replace(/ /g, ";");
          care = care.replace(/_/g, " ");
          return care;
        }),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        )
      )
    )(state);
  }

  console.log("No HAWI HBC.");
  return state;
});

//Malaria cases
//Child
alterState((state) => {
  if (dataValue("form.treatment_and_tracking.malaria_test")(state) === "yes") {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "malaria";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "malaria";
          return serviceId;
        }),
        field("Source__c", 1),
        field("Date__c", dataValue("form.Date")),
        field("Follow_Up_By_Date__c", (state) => {
          var date = dataValue("form.Follow-Up_By_Date")(state);
          return date !== undefined || date !== "" ? date : null;
        }),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("Referred__c", 1),
        field("Type_of_Service__c", "Illness"),
        field("RecordTypeID", "01224000000YAuK"),
        field("Open_Case__c", 1),
        field("Purpose_of_Referral__c", "Malaria"),
        field(
          "Malaria_Status__c",
          dataValue("form.treatment_and_tracking.malaria_test_results")
        ),
        field(
          "Home_Treatment_Date__c",
          dataValue("form.TT5.Child_Information.CCMM.Home_Treatment_Date")
        ),
        field(
          "Malaria_Home_Test_Date__c",
          dataValue("form.treatment_and_tracking.malaria_test_date")
        ),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        )
      )
    )(state);
  }

  console.log("No malaria test.");
  return state;
});

//Malnutrition case
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.Nutrition2.Nutrition_Status")(
      state
    ) !== undefined
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "malnutrition";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "malnutrition";
          return serviceId;
        }),
        field("Source__c", 1),
        field("Date__c", dataValue("form.Date")),
        field("Follow_Up_By_Date__c", dataValue("form.Date")),
        field("Type_of_Service__c", "CHW Mobile Survey"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("RecordTypeID", "01224000000YAuK"),
        field("Reason_for_Service__c", "Nutrition Screening"),
        field(
          "Clinical_Visit_Date__c",
          dataValue("form.TT5.Child_Information.Nutrition2.Clinical_Date")
        ),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        ),
        field(
          "Height__c",
          dataValue("form.TT5.Child_Information.Nutrition.Height")
        ),
        field(
          "Weight__c",
          dataValue("form.TT5.Child_Information.Nutrition.Weight")
        ),
        field(
          "MUAC__c",
          dataValue("form.TT5.Child_Information.Nutrition.MUAC")
        ),
        field("Nutrition_Status__c", (state) => {
          var status = "";
          if (
            dataValue("form.TT5.Child_Information.Nutrition2.Nutrition_Status")(
              state
            ) == "normal"
          ) {
            status = "Normal";
          } else if (
            dataValue("form.TT5.Child_Information.Nutrition2.Nutrition_Status")(
              state
            ) == "moderate"
          ) {
            status = "Moderately Malnourished";
          } else if (
            dataValue("form.TT5.Child_Information.Nutrition2.Nutrition_Status")(
              state
            ) == "severe"
          ) {
            status = "Severely Malnourished";
          }
          return status;
        }),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue(
            "form.TT5.Child_Information.Nutrition2.referred_facility_malnutrition"
          )(state);
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        })
      )
    )(state);
  }

  console.log("No malnutrition.");
  return state;
});

//Referrals ... check on Site__r mappings and PNC service
//Other Referrals
alterState((state) => {
  if (
    dataValue("form.treatment_and_tracking.symptoms_other_referral")(state) ==
    "yes"
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "other";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "other";
          return serviceId;
        }),
        field("Source__c", 1),
        field("Date__c", dataValue("form.Date")),
        field("Type_of_Service__c", "CHW Mobile Survey"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : "a0308000021zm8Z";
        }),
        field("RecordTypeID", "01224000000YAuK"),
        field("Referred__c", 1),
        field("Follow_Up_By_Date__c", (state) => {
          var date = dataValue("form.Follow-Up_By_Date")(state);
          return date === null || date === "" ? null : date;
        }),
        field("Reason_for_Service__c", "Referral"),
        field("Open_Case__c", 1),
        field("Purpose_of_Referral__c", (state) => {
          var purpose = dataValue(
            "form.treatment_and_tracking.symptoms_check_other"
          )(state)
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(";");
          return purpose.toString().replace(/_/g, " ");
        }),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        )
      )
    )(state);
  }

  console.log("No other referral.");
  return state;
});

//Skilled Delivery Referral
alterState((state) => {
  if (
    dataValue(
      "form.TT5.Child_Information.pregnancy_danger_signs.refer_skilled_delivery"
    )(state) == "yes"
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "skilled_delivery";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "skilled_delivery";
          return serviceId;
        }),
        field("Source__c", 1),
        field("Date__c", dataValue("form.Date")),
        field("Type_of_Service__c", "CHW Mobile Survey"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("RecordTypeID", "01224000000YAuK"),
        field("Referred__c", 1),
        field("Follow_Up_By_Date__c", (state) => {
          var date = dataValue("form.Follow-Up_By_Date")(state);
          return date === null || date === "" ? null : date;
        }),
        field("Reason_for_Service__c", "Referral"),
        field("Open_Case__c", 1),
        field("Purpose_of_Referral__c", "Skilled Delivery"),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        )
      )
    )(state);
  }

  console.log("No skilled delivery.");
  return state;
});

//Prenancy danger signs Referral
alterState((state) => {
  if (
    dataValue(
      "form.TT5.Child_Information.pregnancy_danger_signs.danger_sign_referral.referral"
    )(state) == "Yes"
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "pregnancy_danger_signs";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "pregnancy_danger_signs";
          return serviceId;
        }),
        field("Source__c", 1),
        field(
          "Date__c",
          dataValue(
            "form.TT5.Child_Information.pregnancy_danger_signs.danger_sign_referral.referral_date"
          )
        ),
        field("Type_of_Service__c", "CHW Mobile Survey"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("RecordTypeID", "01224000000YAuK"),
        field("Referred__c", 1),
        field(
          "Follow_Up_By_Date__c",
          dataValue(
            "form.TT5.Child_Information.pregnancy_danger_signs.danger_sign_referral.Follow-Up_By_Date"
          )
        ),
        field(
          "Clinician_Comments__c",
          dataValue(
            "form.TT5.Child_Information.pregnancy_danger_signs.danger_sign_referral.Clinician_Notes"
          )
        ),
        field("Reason_for_Service__c", "Referral"),
        field("Open_Case__c", 1),
        field("Purpose_of_Referral__c", "Pregnancy Danger Signs"),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        )
      )
    )(state);
  }

  console.log("No danger signs.");
  return state;
});

//PNC Referral ---> TO UPDATE
alterState((state) => {
  if (
    dataValue(
      "form.ANCs.pregnancy_danger_signs.Delivery_Information.refer_pnc"
    )(state) == "yes"
  ) {
    //Update when Julia updates group ???
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "pnc";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "pnc";
          return serviceId;
        }),
        field("Source__c", 1),
        field("Date__c", dataValue("form.Date")),
        field("Type_of_Service__c", "CHW Mobile Survey"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("RecordTypeID", "01224000000YAuK"),
        field("Referred__c", 1),
        field("Follow_Up_By_Date__c", (state) => {
          var date = dataValue("form.Follow-Up_By_Date")(state);
          return date === null || date === "" ? null : date;
        }),
        field("Reason_for_Service__c", "Referral"),
        field("Open_Case__c", 1),
        field("Purpose_of_Referral__c", "PNC"),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        )
      )
    )(state);
  }

  console.log("No PNC.");
  return state;
});

//Malnutrition Referral
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.Nutrition2.Referral")(state) == "yes"
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "malnutrition";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "malnutrition";
          return serviceId;
        }),
        field("Source__c", 1),
        field("Date__c", dataValue("form.case.update.Date")),
        field("Type_of_Service__c", "CHW Mobile Survey"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("RecordTypeID", "01224000000YAuK"),
        field("Referred__c", 1),
        field("Follow_Up_By_Date__c", (state) => {
          var date = dataValue("form.Follow-Up_By_Date")(state);
          return date === null || date === "" ? null : date;
        }), //UPDATE
        field("Reason_for_Service__c", "Referral"),
        field("Open_Case__c", 1),
        field("Purpose_of_Referral__c", "Malnutrition"),
        field(
          "Nutrition_Status__c",
          dataValue("form.TT5.Child_Information.Nutrition2.Nutrition_Status")
        ),
        field(
          "MUAC__c",
          dataValue("form.TT5.Child_Information.Nutrition.MUAC")
        ),
        field("Clinical_facility__c", (state) => {
          var facility = dataValue(
            "form.TT5.Child_Information.Nutrition2.referred_facility_malnutrition"
          )(state);
          return facility !== undefined
            ? //? facility.toString().replace(/_/g, ' ')
              facility.charAt(0).toUpperCase() +
                facility.substr(1).toLowerCase().replace(/_/g, " ")
            : null;
        }),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        )
      )
    )(state);
  }

  console.log("No malnutrition referral.");
  return state;
});

//Child Danger Sign Referral
alterState((state) => {
  if (
    dataValue(
      "form.TT5.Child_Information.Danger_Signs.danger_sign_referral.Danger_Signs_Referral"
    )(state) == "yes"
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "child_danger_sign";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "child_danger_sign";
          return serviceId;
        }),
        field("Source__c", 1),
        field("Date__c", dataValue("form.case.update.Date")),
        field("Type_of_Service__c", "CHW Mobile Survey"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("RecordTypeID", "01224000000YAuK"),
        field("Referred__c", 1),
        field(
          "Follow_Up_By_Date__c",
          dataValue(
            "form.TT5.Child_Information.Danger_Signs.danger_sign_referral.Danger_Signs_Follow-Up_By_Date"
          )
        ),
        field("Reason_for_Service__c", "Referral"),
        field("Open_Case__c", 1),
        field("Purpose_of_Referral__c", "Child Danger Sign"),
        field(
          "Clinician_Comments__c",
          dataValue(
            "form.TT5.Child_Information.Danger_Signs.danger_sign_referral.Clinician_Notes"
          )
        ),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        )
      )
    )(state);
  }

  console.log("No danger sign referral.");
  return state;
});

//TB Referral
alterState((state) => {
  if (dataValue("form.treatment_and_tracking.TB_referral")(state) == "yes") {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "tb";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "tb";
          return serviceId;
        }),
        field("Source__c", 1),
        field("Date__c", dataValue("form.case.update.Date")),
        field("Type_of_Service__c", "CHW Mobile Survey"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("RecordTypeID", "01224000000YAuK"),
        field("Referred__c", 1),
        field("Follow_Up_By_Date__c", (state) => {
          var date = dataValue("form.Follow-Up_By_Date")(state);
          return date === null || date === "" ? null : date;
        }),
        field("Reason_for_Service__c", "Referral"),
        field("Open_Case__c", 1),
        field("Purpose_of_Referral__c", "TB"),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue(
            "form.treatment_and_tracking.TB_referral_facility"
          )(state);
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        }),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        )
      )
    )(state);
  }

  console.log("No tb referral.");
  return state;
});

//Diarrhea Referral
alterState((state) => {
  if (
    dataValue("form.treatment_and_tracking.diarrhea_referral")(state) == "yes"
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "diarrhea";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "diarrhea";
          return serviceId;
        }),
        field("Source__c", 1),
        field("Date__c", dataValue("form.case.update.Date")),
        field("Type_of_Service__c", "CHW Mobile Survey"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("RecordTypeID", "01224000000YAuK"),
        field("Referred__c", 1),
        field("Follow_Up_By_Date__c", (state) => {
          var date = dataValue("form.Follow-Up_By_Date")(state);
          return date === null || date === "" ? null : date;
        }),
        field("Reason_for_Service__c", "Referral"),
        field("Open_Case__c", 1),
        field("Purpose_of_Referral__c", "Diarrhea"),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue(
            "form.treatment_and_tracking.diarrhea_referral_facility"
          )(state);
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        }),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        )
      )
    )(state);
  }

  console.log("No diarrhea referral.");
  return state;
});

//Malaria Referral
alterState((state) => {
  if (
    dataValue("form.treatment_and_tracking.malaria_referral")(state) == "yes"
  ) {
    return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "malaria";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "malaria";
          return serviceId;
        }),
        field("Source__c", 1),
        field("Date__c", dataValue("form.case.update.Date")),
        field("Type_of_Service__c", "CHW Mobile Survey"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : chw
            ? chw
            : undefined;
        }),
        field("RecordTypeID", "01224000000YAuK"),
        field("Referred__c", 1),
        field("Follow_Up_By_Date__c", (state) => {
          var date = dataValue("form.Follow-Up_By_Date")(state);
          return date === null || date === "" ? null : date;
        }),
        field("Reason_for_Service__c", "Referral"),
        field("Open_Case__c", 1),
        field("Purpose_of_Referral__c", "Malaria"),
        relationship("Site__r", "Label__c", (state) => {
          var facility = dataValue(
            "form.treatment_and_tracking.malaria_referral_facility"
          )(state);
          if (facility === "" || facility === undefined) {
            facility = "unknown";
          }
          return facility;
        }),
        field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
        relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
        )
      )
    )(state);
  }

  console.log("No malaria referral.");
  return state;
});

//HAWI other clinical services received
alterState((state) => {
  const serviceMap = {
    Scheduled_PSC_Apt: "Scheduled PSC Apt",
    Adverse_Drug_Reaction_Side_Effect: "Adverse Drug Reaction/Side Effect",
    Malnutrition: "Malnutrition",
    Malaria: "Malaria",
    TB: "TB",
    Treatment_for_Other_OIs: "Treatment for other Ols",
    ARI: "ARI",
    Anemia: "Anemia",
    Diarrhea: "Diarrhea",
    Pregnancy_Care: "Pregnancy Care (ANC)",
    Family_Planning: "Family Planning (FP)",
    Preconception_Counseling: "Preconception Counseling",
    Injury: "Injury",
    Other: "Other",
  };

  if (dataValue("form.HAWI.Clinical_Service_Q")(state) === "yes") {
    return beta.each(
      dataPath("form.HAWI.Clinical_Services_Rendered[*]"), //CHECK IF ARRAY
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("CommCare_Code__c", (state) => {
            var id = dataValue("Case_ID")(state);
            var serviceId =
              id +
              dataValue("Purpose")(state) +
              dataValue("Clinical_Date")(state);
            return serviceId.replace(/\//g, "");
          })(state),
          field("Service_UID__c", (state) => {
            var id = dataValue("Case_ID")(state);
            var serviceId =
              id +
              dataValue("Purpose")(state) +
              dataValue("Clinical_Date")(state);
            return serviceId.replace(/\//g, "");
          })(state),
          field("Source__c", 1),
          field("Household_CHW__c", dataValue("chw")),
          field("Reason_for_Service__c", (state) => {
            var name = dataValue("Clinical_Service")(state);
            return name ? state.serviceMap[name] : name;
          }),
          field("Purpose_of_Referral__c", dataValue("Purpose")),
          field("Date__c", dataValue("Date_of_Clinical_Service")),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship("Site__r", "Label__c", (state) => {
            var facility = dataValue("Facility_of_Clinical_Service")(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            } else if (facility == "Other_Clinic") {
              facility = "Other";
            } else if (facility == "Rongo_Sub-District_Hospital") {
              facility = "Rongo_SubDistrict_Hospital";
            }
            return facility;
          }),
          field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
          relationship("Person__r", "CommCare_ID__c", dataValue("Case_ID"))
        )
      )
    )(state);
  }

  console.log("No other HAWI clinical services.");
  return state;
});

//TT5 other clinical services received
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.Clinical_Services_Q")(state) === "Yes"
  ) {
    return beta.each(
      dataPath("form.TT5.Child_Information.Clinical_Services[*]"),
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("CommCare_Code__c", (state) => {
            var id = dataValue("Case_ID")(state);
            var serviceId =
              id +
              dataValue("Purpose")(state) +
              dataValue("Clinical_Date")(state);
            return serviceId.replace(/\//g, "");
          }),
          field("Service_UID__c", (state) => {
            var id = dataValue("Case_ID")(state);
            var serviceId =
              id +
              dataValue("Purpose")(state) +
              dataValue("Clinical_Date")(state);
            return serviceId.replace(/\//g, "");
          }),
          field("Source__c", true),
          field("Household_CHW__c", dataValue("chw")),
          field("Reason_for_Service__c", (state) => {
            var reason = "";
            var name = dataValue("Clinical_Service")(state);
            if (name == "Adverse_Drug_Reaction_Side_Effect") {
              reason = "Adverse Drug Reaction/Side Effect";
            } else if (name == "Pregnancy_Care") {
              reason = "Pregnancy Care (ANC)";
            } else if (name == "Family_Planning") {
              reason = "Family Planning (FP)";
            } else if (name !== undefined) {
              reason = name.replace(/_/g, " ");
            }
            return reason;
          }),
          field("Purpose_of_Referral__c", dataValue("Purpose")),
          field("Date__c", dataValue("Clinical_Date")),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          field("Clinic_Zinc__c", dataValue("diarrhea_clinic_treatment_zinc")),
          field("Clinic_ORS__c", dataValue("diarrhea_clinic_treatment_ORS")),
          relationship("Site__r", "Label__c", (state) => {
            var facility = dataValue("Facility_Clinical")(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            }
            return facility;
          }),
          field("Age_Time_of_Service__c", dataValue("form.age")), //Added by MOTG
          relationship("Person__r", "CommCare_ID__c", dataValue("Case_ID"))
        )
      )
    )(state);
  }

  console.log("No other clinical services.");
  return state;
});

//Upsert Visit records
alterState((state) => {
  if (
    dataValue("form.Source")(state) == 1 &&
    dataValue("metadata.username")(state) !== "test.2021"
  ) {
    return upsert(
      "Visit__c",
      "CommCare_Visit_ID__c",
      fields(
        field("CommCare_Visit_ID__c", dataValue("id")),
        field("Visit_UID__c", (state) => {
          var hh = dataValue("form.HH_ID")(state);
          var date = dataValue("metadata.timeEnd")(state);
          return hh + date;
        }),
        relationship(
          "Household__r",
          "CommCare_Code__c",
          dataValue("form.HH_ID")
        ),
        field("Name", "CHW Visit"),
        field("Household_CHW__c", (state) => {
          var chw = dataValue("form.CHW_ID_Final")(state);
          return chw === "a030800001zQrk"
            ? "a030800001zQrk5"
            : "a031x000004oJe2"
            ? "a0308000021zm8Z"
            : chw
            ? chw
            : "a0308000021zm8Z";
        }),
        field("Supervisor_Visit__c", (state) => {
          var visit = dataValue("form.supervisor_visit")(state);
          if (visit !== undefined) {
            visit = visit.toString().replace(/ /g, ";");
            return visit.toString().replace(/_/g, " ");
          }
          return visit;
        }),
        field("Date__c", dataValue("metadata.timeEnd")),
        field("Location__latitude__s", (state) => {
          const location = state.data.metadata.location;
          const locationArr = location !== null ? location.split(" ") : [];
          return locationArr[0];
        }),
        field("Location__longitude__s", (state) => {
          const location = state.data.metadata.location;
          const locationArr = location !== null ? location.split(" ") : [];
          return locationArr[1];
        })
      )
    )(state);
  }

  console.log("form.Source is not 1, not upserting visit.");
  return state;
});

//Map Zinc and ors
alterState((state) => {
  if (
    dataValue("form.TT5.Child_Information.Clinical_Services_Q")(state) === "Yes"
  ) {
    return beta.each(
      dataPath("form.TT5.Child_Information.Clinical_Services[*]"),
      upsert(
        "Person__c",
        "CommCare_ID__c",
        fields(
          field("Source__c", 1),
          field("CommCare_ID__c", dataValue("Case_ID")),
          field("Child_zinc__c", (state) => {
            var zinc = dataValue("diarrhea_clinic_treatment_zinc")(state);
            return zinc === "Yes" ? "Yes" : undefined;
          }),
          field("Child_ORS__c", (state) => {
            var ors = dataValue("diarrhea_clinic_treatment_ORS")(state);
            return ors === "Yes" ? "Yes" : undefined;
          })
        )
      )
    )(state);
  }

  console.log("No zinc and ors.");
  return state;
});
//MOTG
//Immunization - Defaulter
alterState((state) => {
  if (
    dataValue("form.TT5/Child_Information/Immunizations/refer_immunization_type")(state) == "yes"
  ) {
      return upsert(
      "Service__c",
      "Service_UID__c",
      fields(
        field("CommCare_Code__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "immunization";
          return serviceId;
        }),
        field("Service_UID__c", (state) => {
          var id = dataValue("id")(state);
          var serviceId = id + "immunization";
          return serviceId;
        }),
  field("Household_CHW__c", dataValue("form.CHW_ID_Final"),
  field("Type_of_Service__c", "Immunization"),
  field("Reason_for_Service__c", "Missed immunization type"),
  field("Date__c",dataValue("form.case.update.Date"),
  field("RecordTypeID", "01224000000YAuK"),
  relationship(
          "Person__r",
          "CommCare_ID__c",
          dataValue("form.case.@case_id")
          )
      );
  }
  
//Immunization
//Family Planning
//Chronic Illness
//HIV - HTC
//HIV - Clinical
//Chest Indrawing
//Fast Breathing
//Fever
//Cough
//TB
