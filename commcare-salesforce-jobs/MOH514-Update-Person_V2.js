// MOH514 - Update Person form
fn((state) => {
  // if (
  //   dataValue("form.TT5.Child_Information.Clinical_Services")(state) !==
  //   undefined
  // ) {
  //   const clinical = state.data.form.TT5.Child_Information.Clinical_Services;
  //   if (!Array.isArray(clinical)) {
  //     state.data.form.TT5.Child_Information.Clinical_Services = [clinical];
  //   }
  // }

  // if (dataValue("form.HAWI.Clinical_Services_Rendered")(state) !== undefined) {
  //   const clinical1 = state.data.form.HAWI.Clinical_Services_Rendered;
  //   if (!Array.isArray(clinical1)) {
  //     state.data.form.HAWI.Clinical_Services_Rendered = [clinical1];
  //   }
  // }

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
    complementary_feeding: "Complementary feeding",
    sleeping_under_llitn: "Sleeping under LLITN",
    knowing_hiv_status: "Knowing HIV status",
    indoor_pollution: "Indoor pollution",
    personal_hygiene: "Personal Hygiene",
    safe_drinking_water: "Safe drinking water",
    safe_disposal_of_human_waste: "Safe disposal of human waste",
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
fn((state) => {
  if (dataValue("form.Status.Client_Status")(state) === "Active") {
    console.log("Upserting Person in SF...");
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        field(
          "deworming_medication__c",
          dataValue("form.TT5.Child_Information.Deworming")
        ),
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
        //== TODO: Ask how indicated when there is an unborn child =====//
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
        ),
        field("Child_Status__c", (state) => {
          var status = dataValue("form.case.update.child_status")(state);
          var rt = dataValue("form.RecordType")(state);
          if (status && rt === "Unborn") {
            status = "Unborn";
          } else if (status && rt === "Born") {
            status = "Born";
          }
          return status;
        }),
        //===================================================//
        relationship("RecordType", "Name", (state) => {
          var rt = dataValue("form.RecordType")(state);
          return rt === "Unborn" || rt === ""
            ? "Child"
            : rt.toString().replace(/_/g, " "); //convert Unborn children to Child RT
        }),
        field(
          "Individual_birth_plan_counselling__c",
          dataValue("form.ANCs.pregnancy_danger_signs.individual_birth_plan")
        ),
        field("Reason_for_not_taking_a_pregnancy_test__c", (state) => {
          var reason = dataValue("form.TT5.Mother_Information.No_Preg_Test")(
            state
          );
          return reason ? reason.toString().replace(/_/g, " ") : undefined;
        }),
        field("Pregnancy_danger_signs__c", (state) => {
          var signs = dataValue(
            "form.ANCs.pregnancy_danger_signs.pregnancy_danger_signs"
          )(state);
          return signs
            ? signs
                .toLowerCase()
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(";")
                .toString()
                .replace(/_/g, " ")
            : undefined;
        }),
        field("Child_Danger_Signs__c", (state) => {
          var signs = dataValue(
            "form.TT5.Child_Information.Danger_Signs.Other_Danger_Signs"
          )(state);
          return signs
            ? signs
                .toLowerCase()
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(";")
                .toString()
                .replace(/_/g, " ")
            : signs;
        }),
        field("Current_Malaria_Status__c", dataValue("form.Malaria_Status")),
        field(
          "Unique_Patient_Code__c",
          dataValue("form.HAWI.Unique_Patient_Code")
        ),
        field(
          "Active_in_Support_Group__c",
          dataValue("form.HAWI.Support_Group")
        ),
        field(
          "Preferred_Care_Facility__c",
          dataValue("form.HAWI.Preferred_Care_F.Preferred_Care_Facility")
        ),
        field("HAWI_Defaulter__c", (state) => {
          var hawi = dataValue("form.HAWI.Preferred_Care_F.default")(state);
          return hawi === "Yes" ? true : false;
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
          "Newborn_visited_by_a_CHW_within_6_days__c",
          dataValue("form.TT5.Child_Information.visit_6_days_from_delivery")
        ),
        field(
          "Last_Malaria_Home_Test__c",
          dataValue("form.treatment_and_tracking.malaria_test_date")
        ),
        field(
          "Current_Malaria_Status__c",
          dataValue("form.treatment_and_tracking.malaria_test_results")
        ),
        field("Last_Malaria_Home_Treatment__c", (state) => {
          var home = dataValue("form.treatment_and_tracking.home_treatment");
          return home === "yes"
            ? dataValue("form.treatment_and_tracking.malaria_test_date")(state)
            : undefined;
        }),
        field(
          "Malaria_Facility__c",
          dataValue("form.treatment_and_tracking..malaria_referral_facility")
        ),
        //== QUESTION: TO update these mappings?? ========///
        field(
          "Fever_over_7days__c",
          dataValue("form.treatment_and_tracking.symptoms_check_fever")
        ),
        field(
          "Cough_over_14days__c",
          dataValue("form.treatment_and_tracking.symptoms_check_cough")
        ),
        //=========================================//
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
        field(
          "Date_of_Birth__c",
          dataValue("form.ANCs.pregnancy_danger_signs.Delivery_Information.DOB")
        ),
        field("Place_of_Delivery__c", (state) => {
          var facility = dataValue("form.TT5.Child_Information.Delivery_Type")(
            state
          );
          return facility === "Skilled"
            ? "Facility"
            : facility === "Unskilled"
            ? "Home"
            : undefined;
        }),
        field("Delivery_Facility__c", (state) => {
          var facility = dataValue(
            "form.TT5.Child_Information.Delivery_Facility"
          )(state);
          return facility ? facility.toString().replace(/_/g, " ") : null;
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
        field(
          "Family_Planning__c",
          dataValue("form.TT5.Mother_Information.family_planning")
        ),
        field(
          "Family_Planning_Method__c",
          dataValue("form.TT5.Mother_Information.family_planning_method")
        ),
        field("Reasons_for_not_taking_FP_method__c", (state) => {
          var reason = dataValue(
            "form.TT5.Mother_Information.No_FPmethod_reason"
          )(state);
          return reason ? state.reasonMapping[reason] : "";
        }),
        field("Pregnant__c", (state) => {
          var preg = dataValue("form.TT5.Mother_Information.Pregnant")(state);
          return preg === "Yes" ? true : false;
        }),
        field(
          "Counselled_on_FP_Methods__c",
          dataValue("form.TT5.Mother_Information.CounselledFP_methods")
        ),
        field("Client_counselled_on__c", (state) => {
          var choices =
            dataValue("form.treatment_and_tracking.counseling.counsel_topic")(
              state
            ) || dataValue("form.counseling.counsel_topic")(state);
          var choiceGroups = choices ? choices.split(" ") : null;
          console.log(choices);
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
        field("Know_HIV_status__c", dataValue("form.HAWI.known_hiv_status")),
        field("Treatment_Distribution__c", (state) => {
          var choice = dataValue(
            "form.treatment_and_tracking.distribution.distributed_treatments"
          )(state);
          return state.cleanChoice(state, choice);
        }),
        field(
          "Current_Height__c",
          dataValue("form.TT5.Child_Information.Nutrition.current_height")
        ),
        field(
          "Child_missed_immunization_type__c",
          dataValue(
            "form.TT5.Child_Information.Immunizations.immunization_type"
          )
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
        field("Chronic_illness__c", (state) => {
          var choice = dataValue(
            "form.question1.please_specify_which_chronic_illness_the_person_has"
          )(state);
          var choice2 = state.handleMultiSelect(state, choice);
          return choice2 ? choice2.replace(/_/g, " ") : "";
        }),
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
          "Child_chest_in_drawing__c",
          dataValue("form.psbi.Child_chest_in_drawing_c")
        )
      )
    )(state);
  }
  // Transfer Outs
  else if (
    dataValue("form.Status.Client_Status")(state) === "Transferred_Out"
  ) {
    console.log("Transferred out");
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        field("CommCare_ID__c", dataValue("form.case.@case_id")),
        relationship(
          "Household__r",
          "CommCare_Code__c",
          dataValue("form.HH_ID")
        ),
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
    dataValue("form.Status.Client_Status")(state) === "Lost_to_Follow_Up"
  ) {
    console.log("Lost to follow up");
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        relationship(
          "Household__r",
          "CommCare_Code__c",
          dataValue("form.HH_ID")
        ),
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
    dataValue("form.Status.Client_Status")(state) === "Graduated_From_TT5"
  ) {
    console.log("Graduated from TT5");
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        relationship(
          "Household__r",
          "CommCare_Code__c",
          dataValue("form.HH_ID")
        ),
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
    dataValue("form.Status.Client_Status")(state) === "Data_Entry_Error"
  ) {
    console.log("Data entry error flagged in CommCare; resyncing");
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        relationship(
          "Household__r",
          "CommCare_Code__c",
          dataValue("form.HH_ID")
        ),
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
  else if (dataValue("form.Status.Client_Status")(state) === "Deceased") {
    console.log("Person is deceased");
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        relationship(
          "Household__r",
          "CommCare_Code__c",
          dataValue("form.HH_ID")
        ),
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
fn((state) => {
  if (
    (dataValue("form.case.update.TT5_enrollment_status")(state) ==
      "Enrolled in TT5" ||
      dataValue("form.age")(state) < 5 ||
      dataValue("form.case.update.Active_in_TT5")(state) === "Yes" ||
      dataValue("form.TT5.Mother_Information.Pregnant") === "Yes") &&
    dataValue("form.Status.Client_Status")(state) === "Active"
  ) {
    console.log("Person active in TT5");
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        relationship(
          "Household__r",
          "CommCare_Code__c",
          dataValue("form.HH_ID")
        ),
        field("CommCare_ID__c", dataValue("form.case.@case_id")),
        field("Active_in_Thrive_Thru_5__c", "Yes"),
        field("Enrollment_Date__c", dataValue("metadata.timeEnd")),
        field("Thrive_Thru_5_Registrant__c", "Yes"),
        field("Active_TT5_Mother__c", (state) => {
          var preg = dataValue("form.TT5.Mother_Information.Pregnant")(state);
          return preg === "Yes" ? "Yes" : null;
        }),
        field("TT5_Mother_Registrant__c", (state) => {
          var preg = dataValue("form.TT5.Mother_Information.Pregnant")(state);
          return preg === "Yes" ? "Yes" : null;
        })
      )
    )(state);
  }

  console.log("No person was added to TT5, skipping upsert.");
  return state;
});

//Person over age 5 / NOT active in TT5
fn((state) => {
  if (
    (dataValue("form.age")(state) > 5 ||
      dataValue("form.case.update.Active_in_TT5")(state) === "No") &&
    dataValue("form.Status.Client_Status")(state) === "Active"
  ) {
    console.log("Person NOT active in TT5");
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        relationship(
          "Household__r",
          "CommCare_Code__c",
          dataValue("form.HH_ID")
        ),
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
fn((state) => {
  if (
    (dataValue("form.case.update.HAWI_enrollment_status")(state) ==
      "Enrolled in HAWI" ||
      dataValue("form.hiv_status")(state) === "positive" ||
      dataValue("form.case.update.Active_in_HAWI")(state) === "Yes") &&
    dataValue("form.Status.Client_Status")(state) === "Active"
  ) {
    console.log("Person in HAWI");
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        relationship(
          "Household__r",
          "CommCare_Code__c",
          dataValue("form.HH_ID")
        ),
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
fn((state) => {
  if (
    dataValue("form.case.update.HAWI_enrollment_status")(state) ==
      "Not enrolled in HAWI" &&
    dataValue("form.Status.Client_Status")(state) === "Active"
  ) {
    console.log("Person NOT in HAWI");
    return upsert(
      "Person__c",
      "CommCare_ID__c",
      fields(
        relationship(
          "Household__r",
          "CommCare_Code__c",
          dataValue("form.HH_ID")
        ),
        field("CommCare_ID__c", dataValue("form.case.@case_id")),
        field("Active_in_HAWI__c", "No"),
        field("HAWI_Registrant__c", "No")
      )
    )(state);
  }

  console.log("No person added to HAWI, skipping upsert.");
  return state;
});