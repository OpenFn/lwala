//MOH513 Enroll Household Form ... TESTING location hierarchy changes
//Alters CommCare Person arrays so that they are formatted as arrays instead of just single values.
alterState((state) => {
  const person = state.data.form.Person;
  if (!Array.isArray(person)) {
    state.data.form.Person = [person];
  }

  titleCase = (str) => {
    var splitStr = str.toLowerCase().split(" ");
    for (var i = 0; i < splitStr.length; i++) {
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ");
  };

  const reasonMapping = {
    pregnant: "The client is pregnant",
    intentions_of_getting_pregnant: "Intentions of getting pregnant",
    lack_of_access_to_fp_information: "Lack of access to FP information",
    not_sexually_active: "The client is not sexually active",
    other_barriers_culture_male_partners_parents_etc:
      "Other barriers (culture, male partners, parents, etc)",
    no_access_to_fp_services_hospitals:
      "Lack of hospitals or places where FP services can be accessed",
    not_willing_to_use_fp_due_to_negative_effects_myths_and_misconceptions:
      "Myths and misconceptions",
    barriers_at_service_delivery_points: "Barriers at service delivery points",
  };

  state.area = state.data.form.area;
  state.catchment = state.data.form.catchment;


  return { ...state, reasonMapping };
});

//Upserting Household, checks if Household exists via MOH Household Code
upsert(
  "Household__c",
  "CommCare_Code__c",
  fields(
    field("CommCare_Username__c", dataValue('form.meta.username')),
    field("MOH_household_code__c", dataValue("form.moh_code")),
    field("CommCare_Code__c", dataValue("form.case.@case_id")),
    field("Source__c", true),
    field("Household_CHW__c", state => {
      var chw = dataValue("form.CHW_ID")(state);
      return chw === 'a030800001zQrk' ? 'a030800001zQrk5' : chw ? chw : undefined;
    }),
    //field("Household_CHW__c", "a031x000002S9lm"), //HARDCODED FOR SANDBOX TESTING --> To replace with line above
    //== LOCATION FIELD UPDATESS =====================//
    relationship("Catchment__r", "Name", state => {
      var location = state.data.form.location_info;
      var catchment = state.data.form.catchment; 
      return catchment && catchment!== '' ? 
      catchment : 
      location === '' || location === undefined ? 
      'Unknown Location' : location.catchment_name;
    }), 
    field("Area__c", dataValue("form.area")),
    // relationship("Area__r", "Name", state => { //New mapping after locations update
    //   var location = state.data.form.location_info;
    //   var area = state.data.form.area; 
    //   return area && area!== '' ? 
    //   area : 
    //   location === '' || location === undefined ? 
    //   'Unknown Location' : location.area_name;
    // }), 
    relationship("Village__r", "Name", dataValue("form.location_info.village_name")),
    field("Household_village__c", dataValue("form.location_info.village_name")),
    //=========================================================//
    field("Deaths_in_the_last_6_months__c", (state) => {
      var death = dataValue(
        "form.Household_Information.deaths_in_past_6_months"
      )(state);
      return death > 0 ? "Yes" : "No";
    }),
    field(
      "Access_to_safe_water__c",
      dataValue("form.Household_Information.Safe_Water")
    ),
    field(
      "Treats_Drinking_Water__c",
      dataValue("form.Household_Information.Treats_Drinking_Water")
    ),
    field(
      "Tippy_Tap__c",
      dataValue("form.Household_Information.Active_Handwashing_Station")
    ),
    field(
      "Pit_Latrine__c",
      dataValue("form.Household_Information.Functional_Latrine")
    ),
    field(
      "Rubbish_Pit__c",
      dataValue("form.Household_Information.Rubbish_Pit")
    ),
    field(
      "Drying_Rack__c",
      dataValue("form.Household_Information.Drying_Rack")
    ),
    field(
      "Kitchen_Garden__c",
      dataValue("form.Household_Information.Kitchen_Garden")
    ),
    field(
      "Cookstove__c",
      dataValue("form.Household_Information.Improved_Cooking_Method")
    ),
    field("Clothe__c", dataValue("form.Household_Information.Clothesline")),
    field(
      "WASH_Trained__c",
      dataValue("form.Household_Information.WASH_Trained")
    ),
    field(
      "Total_household_people__c",
      dataValue("form.Total_Number_of_Members")
    ),
    field("Health_insurance__c", dataValue("form.health_insurace_cover")),
    field(
      "Health_insurance_active_status__c",
      dataValue("form.healthinsurance_active")
    ),
    field("Health_insurance_type__c", (state) => {
      var status = dataValue("form.health_insurance")(state);
      return status && status === "other_please_specify_if_active"
        ? "Other"
        : status === "nhif"
          ? "NHIF"
          : status === "Linda_mama" || "linda_mama"
            ? "Linda mama"
            : status;
    }),
    field(
      "Other_Health_Insurance__c",
      dataValue("form.if_other_please_specify")
    ),
    field("Work_with_TBA__c", dataValue("form.tba")),
    field("TBA_name__c", dataValue("form.which_tba"))
  )
);

//Upsert Person via CommCare case ID for each person enrolled
alterState((state) => {
  if (dataValue("form.Person[0].Source")(state) == 1) {
    return beta.each(
      dataPath("form.Person[*]"),
      upsert(
        "Person__c",
        "CommCare_ID__c",
        fields(
          //relationship("Household__r", "CommCare_Code__c", dataValue("case.index.parent.#text")),
          field("CommCare_ID__c", dataValue("case.@case_id")),
          field("CommCare_HH_Code__c", dataValue("case.index.parent.#text")),
          relationship(
          'Household__r',
          'CommCare_Code__c',
          dataValue("case.index.parent.#text")),
          relationship("RecordType", "Name", (state) => {
            var rt = dataValue("Basic_Information.Record_Type")(state);
            var status = dataValue("Basic_Information.Child_Status")(state);
            return status == "Unborn"
              ? "Child"
              : rt.toString().replace(/_/g, " "); //convert Unborn children to Child RT
          }),
          field("Name", (state) => {
            var status = dataValue("Basic_Information.Child_Status")(state);
            var name1 = dataValue("Basic_Information.Name")(state);
            var name2 =
              name1 === undefined || name1 === ""
                ? "Unborn Child"
                : name1.replace(/\w\S*/g, function (txt) {
                  return (
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  );
                });
            return status !== "Unborn" ? name2 : "Unborn Child";
          }),
          field("Source__c", true),
          field("Client_Status__c", "Active"),
          relationship("Catchment__r", "Name", state => {
            var catchment = state.catchment;
            return catchment === '' || catchment === undefined ? 'Unknown Location' : catchment;
          }), // check
          field("Area__c", state => {
            var area = state.area;
            return area === '' || area === undefined ? 'a002400000k6IKi' : area;
          }),
          field("Household_Village__c", state.data.form.village),
          field("Relation_to_the_head_of_the_household__c", (state) => {
            var relation = dataValue("Basic_Information.relation_to_hh")(state);
            var toTitleCase =
              relation !== undefined
                ? relation.toString().replace(/_/g, " ")
                : null;
            return toTitleCase !== null
              ? toTitleCase.charAt(0).toUpperCase() + toTitleCase.slice(1)
              : null;
          }),
          field("Active_TT5_Mother__c", (state) => {
            var preg = dataValue("TT5.Mother_Information.Pregnant")(state);
            return preg == "Yes" ? "Yes" : null;
          }),
          field("TT5_Mother_Registrant__c", (state) => {
            var preg = dataValue("TT5.Mother_Information.Pregnant")(state);
            return preg == "Yes" ? "Yes" : null;
          }),
          field("Active_in_Thrive_Thru_5__c", (state) => {
            var age = dataValue("Basic_Information.age")(state);
            var preg = dataValue("TT5.Mother_Information.Pregnant")(state);
            return age < 5 || preg == "Yes" ? "Yes" : "No";
          }),
          field("Active_in_HAWI__c", (state) => {
            var status = dataValue("Basic_Information.person_info.hiv_status")(
              state
            );
            return status == "positive" ? "Yes" : "No";
          }),
          field("Enrollment_Date__c", (state) => {
            var age = dataValue("Basic_Information.age")(state);
            var date = dataValue("Date")(state);
            var preg = dataValue("TT5.Mother_Information.Pregnant")(state);
            return age < 5 || preg == "Yes" ? date : null;
          }),
          field("HAWI_Enrollment_Date__c", (state) => {
            var status = dataValue("Basic_Information.person_info.hiv_status")(
              state
            );
            var date = dataValue("Date")(state);
            return status == "positive" ? date : null;
          }),
          field("Thrive_Thru_5_Registrant__c", (state) => {
            var age = dataValue("Basic_Information.age")(state);
            var preg = dataValue("TT5.Mother_Information.Pregnant")(state);
            return age < 5 || preg == "Yes" ? "Yes" : "No";
          }),
          field("HAWI_Registrant__c", (state) => {
            var status = dataValue("Basic_Information.person_info.hiv_status")(
              state
            );
            return status == "positive" ? "Yes" : "No";
          }),
          field("Date_of_Birth__c", dataValue("Basic_Information.DOB")),
          field("Child_Status__c", (state) => {
            var dob = dataValue("Basic_Information.DOB")(state);
            var status = dataValue("Basic_Information.Child_Status")(state);
            return dob !== undefined || status == "Born" ? "Born" : "Unborn"; //what about deceased?
          }),
          field("Gender__c", dataValue("Basic_Information.Gender")),
          field(
            "Birth_Certificate__c",
            dataValue("Basic_Information.birth_certificate")
          ),
          field("Education_Level__c", (state) => {
            var edu = dataValue("Basic_Information.Education_Level")(state);
            return edu !== undefined ? edu.toString().replace(/_/g, " ") : null;
          }),
          field(
            "Currently_enrolled_in_school__c",
            dataValue("Basic_Information.enrolled_in_school")
          ),
          field(
            "Telephone__c",
            dataValue("Basic_Information.Contact_Info.contact_phone_number_short")
          ),
          field("Family_Planning__c", (state) => {
            var plan = dataValue(
              "Basic_Information.family_planning.Currently_on_family_planning"
            )(state);
            return plan ? "Yes" : plan;
          }),
          field("Family_Planning_Method__c", (state) => {
            var method = dataValue(
              "Basic_Information.family_planning.Family_Planning_Method"
            )(state);
            return method ? method.toString().replace(/_/g, " ") : method;
          }),
          field("Reasons_for_not_taking_FP_method__c", (state) => {
            var reason = dataValue(
              "Basic_Information.family_planning.No_FPmethod_reason"
            )(state);
            return reason ? state.reasonMapping[reason] : "";
          }),
          field(
            "Use_mosquito_net__c",
            dataValue("Basic_Information.person_info.sleep_under_net")
          ),
          field(
            "Two_weeks_or_more_cough__c",
            dataValue("Basic_Information.person_info.cough_for_2wks")
          ),
          field("Chronic_illness__c", (state) => {
            var value = dataValue(
              "Basic_Information.person_info.chronic_illness"
            )(state);
            var illness =
              value !== undefined
                ? value
                  .toLowerCase()
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(";")
                : null;
            return illness !== null
              ? illness.toString().replace(/_/g, " ")
              : null;
          }),
          field(
            "Knowledge_of_HIV_status__c",
            dataValue("Basic_Information.person_info.known_hiv_status")
          ),
          field(
            "HIV_Status__c",
            dataValue("Basic_Information.person_info.hiv_status")
          ),
          field("Disability__c", (state) => {
            var disability = dataValue(
              "Basic_Information.person_info.disability"
            )(state);
            var toTitleCase =
              disability !== undefined
                ? disability
                  .toLowerCase()
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(";")
                : null;
            return toTitleCase;
          }),
          field("Other_disability__c", (state) => {
            var disability = dataValue(
              "Basic_Information.person_info.other_disability"
            )(state);
            var toTitleCase =
              disability !== undefined
                ? disability
                  .toLowerCase()
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(";")
                : null;
            return toTitleCase;
          }),
          field(
            "Unique_Patient_Code__c",
            dataValue("HAWI.Unique_Patient_Code")
          ),
          field(
            "Active_in_Support_Group__c",
            dataValue("HAWI.Active_in_Support_Group")
          ),
          field("Currently_on_ART_s__c", dataValue("HAWI.ART")),
          field("ART_Regimen__c", dataValue("form.Person.HAWI.ARVs")),
          field("Preferred_Care_Facility__c", (state) => {
            var facility = dataValue("HAWI.Preferred_Care_Facility")(state);
            return facility !== undefined
              ? facility.toString().replace(/_/g, " ")
              : null;
          }),
          field(
            "MCH_booklet__c",
            dataValue("TT5.Mother_Information.mch_booklet")
          ),
          field("LMP__c", dataValue("TT5.Child_Information.ANCs.LMP")),
          field("ANC_1__c", dataValue("TT5.Child_Information.ANCs.ANC_1")),
          field("ANC_2__c", dataValue("TT5.Child_Information.ANCs.ANC_2")),
          field("ANC_3__c", dataValue("TT5.Child_Information.ANCs.ANC_3")),
          field("ANC_4__c", dataValue("TT5.Child_Information.ANCs.ANC_4")),
          field("ANC_5__c", dataValue("TT5.Child_Information.ANCs.ANC_5")),
          field("Delivery_Facility__c", (state) => {
            var facility = dataValue(
              "TT5.Child_Information.Delivery_Information.Birth_Facility"
            )(state);
            return facility !== undefined
              ? facility.toString().replace(/_/g, " ")
              : null;
          }),
          field(
            "Delivery_Facility_Other__c",
            dataValue("TT5.Child_Information.Delivery_Information.Other")
          ),
          field("Place_of_Delivery__c", (state) => {
            var facility = dataValue(
              "TT5.Child_Information.Delivery_Information.Skilled_Unskilled"
            )(state);
            if (facility !== undefined) {
              return facility == "Skilled" ? "Facility" : "Home";
            }
            return facility;
          }),
          field("BCG__c", dataValue("TT5.Child_Information.Immunizations.BCG")),
          field(
            "OPV_0__c",
            dataValue("TT5.Child_Information.Immunizations.OPV_0")
          ),
          field(
            "OPV_1__c",
            dataValue("TT5.Child_Information.Immunizations.OPV_PCV_Penta_1")
          ),
          field(
            "OPV_2__c",
            dataValue("TT5.Child_Information.Immunizations.OPV_PCV_Penta_2")
          ),
          field(
            "OPV_3__c",
            dataValue("TT5.Child_Information.Immunizations.OPV_PCV_Penta_3")
          ),
          field(
            "Measles_6__c",
            dataValue("TT5.Child_Information.Immunizations.Measles_6")
          ),
          field(
            "Measles_9__c",
            dataValue("TT5.Child_Information.Immunizations.Measles_9")
          ),
          field(
            "Measles_18__c",
            dataValue("TT5.Child_Information.Immunizations.Measles_18")
          ),
          field(
            "Vitamin_A__c",
            dataValue("TT5.Child_Information.nutrition.vitamin_a")
          ),
          field(
            "Food_groups_3_times_a_day__c",
            dataValue("TT5.Child_Information.nutrition.food_groups")
          ),
          field(
            "Initial_MUAC__c",
            dataValue("TT5.Child_Information.nutrition.MUAC")
          ),
          field(
            "Exclusive_Breastfeeding__c",
            dataValue(
              "TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding"
            )
          ),
          field("Pregnant__c", (state) => {
            var preg = dataValue("TT5.Mother_Information.Pregnant")(state);
            return preg == "Yes" ? true : false;
          }),
          field(
            "Gravida__c",
            dataValue("TT5.Mother_Information.Pregnancy_Information.Gravida")
          ),
          field(
            "Parity__c",
            dataValue("TT5.Mother_Information.Pregnancy_Information.Parity")
          ),
          field(
            "Nutrition_referral__c",
            dataValue("TT5.Child_Information.nutrition.Referral")
          ),
          field(
            "Nutrition_referral_date__c",
            dataValue("TT5.Child_Information.nutrition.date_malnutrition")
          ),
          field(
            "HIV_counseling_and_testing_referral_date__c",
            dataValue("Basic_Information.person_info.when_hiv")
          ),
          field(
            "Received_pregnancy_test__c",
            dataValue(
              "Basic_Information.family_planning.did_you_adminsiter_a_pregnancy_test"
            )
          ),
          field(
            "Pregnancy_test_result__c",
            dataValue("Basic_Information.family_planning.pregnancy_test_result")
          ),
          field(
            "Pregnancy_referral__c",
            dataValue("Basic_Information.family_planning.refer_preg")
          ),
          field(
            "Pregnancy_referral_date__c",
            dataValue("Basic_Information.family_planning.referal_pregnancy")
          ),
          field("Family_Planning__c", (state) => {
            var plan = dataValue(
              "Basic_Information.family_planning.Currently_on_family_planning"
            )(state);
            return plan ? "Yes" : plan;
          }),
          field("Family_Planning_Method__c", (state) => {
            var method = dataValue(
              "Basic_Information.family_planning.Family_Planning_Method"
            )(state);
            return method ? method.toString().replace(/_/g, " ") : method;
          }),
          field("Reason_for_not_taking_a_pregnancy_test__c", (state) => {
            var reason = dataValue(
              "Basic_Information.family_planning.No_Preg_Test"
            )(state);
            return reason ? reason.toString().replace(/_/g, " ") : reason;
          })
        )
      )
    )(state);
  }

  console.log("No first person found, not upserting.");
  return state;
});

each(
  merge(
    dataPath("$.form.household_deaths.deaths[*]"),
    fields(
      field("caseId", dataValue("form.case.@case_id")),
      field("catchment", dataValue("form.catchment")),
      field("Date", dataValue("form.Date"))
    )
  ),
  upsertIf(
    state.data.form.household_deaths &&
    state.data.form.household_deaths.deaths_in_past_6_months > 0, //only insert deceased Person if deaths
    "Person__c",
    "CommCare_ID__c",
    fields(
      field("CommCare_ID__c", (state) => {
        var age = dataValue("age_dead")(state);
        return `${state.data.caseId}${age}`;
      }),
      field("CommCare_HH_Code__c", dataValue("caseId")),
      relationship("RecordType", "Name", (state) => {
        var age = dataValue("age_dead")(state);
        var gender = dataValue("gender_dead")(state);
        var rt = "";
        if (age < 5) {
          rt = "Child";
        } else if (age < 18) {
          rt = "Youth";
        } else if (gender === "female") {
          rt = "Female Adult";
        } else {
          rt = "Male Adult";
        }
        return rt;
      }),
      field("Name", "Deceased Person"),
      field("Source__c", true),
      relationship("Catchment__r", "Name", dataValue("catchment")),
      field("Client_Status__c", "Deceased"),
      field("Dead_age__c", dataValue("age_dead")),
      field("Cause_of_Death__c", (state) => {
        var cause = dataValue("cause_of_death_dead")(state);
        return cause !== undefined ? cause.toString().replace(/_/g, " ") : null;
      }),
      field("Verbal_autopsy__c", dataValue("verbal_autopsy")),
      field("Client_Status__c", "Deceased"),
      field("Active_in_Thrive_Thru_5__c", "No"),
      field("Active_in_HAWI__c", "No"),
      field("Active_TT5_Mother__c", "No"),
      field("TT5_Mother_Registrant__c", "No"),
      field("Date_of_Death__c", dataValue("Date")),
      field("Inactive_Date__c", dataValue("Date"))
    )
  )
);