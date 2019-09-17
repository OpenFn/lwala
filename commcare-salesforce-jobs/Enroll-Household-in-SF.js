//MOH513 Enroll Household Form
//Alters CommCare Person arrays so that they are formatted as arrays instead of just single values.
alterState((state) =>{
  const person=state.data.form.Person;
  if(!Array.isArray(person)){
    state.data.form.Person=[person];
  }
  return state;
});

upsert("Household__c", "MOH_household_code__c",fields(
  field("MOH_household_code__c", dataValue("form.moh_code")),
  field("Name","New Household"),
  field("Source__c", true),
  field("Household_CHW__c",dataValue("form.CHW_ID")),
  relationship("Catchment__r","Name", dataValue("form.catchment")),// check
  field("Area__c", dataValue("form.area")),// check
  field("Household_village__c", dataValue("form.village")),
  field("Total_Number_of_Members__c", dataValue("form.Total_Number_of_Members")),
  //field("Deaths_in_the_last_6_months__c", dataValue("form.Household_Information.deaths_in_past_6_months")),
  field("Deaths_in_the_last_6_months__c", function(state){
    const death = state.data.form.Household_Information.deaths_in_past_6_months;
    return (death > 0 ? "Yes" : "No");
  }),
  field("Access_to_safe_water__c", dataValue("form.Household_Information.Safe_Water")),
  field("Treats_Drinking_Water__c", dataValue("form.Household_Information.Treats_Drinking_Water")),
  field("Tippy_Tap__c", dataValue("form.Household_Information.Active_Handwashing_Station")),
  field("Pit_Latrine__c", dataValue("form.Household_Information.Functional_Latrine")),
  field("Rubbish_Pit__c", dataValue("form.Household_Information.Rubbish_Pit")),
  field("Drying_Rack__c", dataValue("form.Household_Information.Drying_Rack")),
  field("Kitchen_Garden__c", dataValue("form.Household_Information.Kitchen_Garden")),
  field("Cookstove__c", dataValue("form.Household_Information.Improved_Cooking_Method")),
  field("Clothe__c", dataValue("form.Household_Information.Clothesline")),
  //field("WASH_Compliant__c", dataValue("form.Household_Information.WASH_Compliant")),
  //field("Core_WASH_Compliant__c", dataValue("form.Household_Information.Core_WASH_Compliant")),
  combine(function(state){
    if(dataValue("form.Person[0].Source")(state)==1){
      each(dataPath("form.Person[*]"),
        create("Person__c",fields(
          field("CommCare_ID__c",dataValue("case.@case_id")),
          field("Name",dataValue("Basic_Information.Person_Name")),
          field("Source__c", true),
          field("Household_CHW__c",dataValue("form.CHW_ID")), //will this map?
          relationship("Location__c","Catchment__r.Name", dataValue("form.catchment")),// check
          relationship("Location__c","Area__r", dataValue("form.area")),// check
          field("Household_village__c", dataValue("form.village")),
          field("Relation_to_the_head_of_the_household__c",dataValue("Basic_Information.relation_to_hh")),
          relationship("RecordType","Name",function(state){
              return(dataValue("Basic_Information.Record_Type")(state).toString().replace(/_/g," "));
          }),
          field("Child_Status__c",dataValue("Basic_Information.Child_Status")),
          field("Date_of_Birth__c",dataValue("Basic_Information.DOB")),
          field("Gender__c",dataValue("Basic_Information.Gender")),
          field("Age_Based_on_Date_of_Birth__c",dataValue("case.update.age")),
          field("Child_Status__c",dataValue("Basic_Information.Check_Unborn_Child")),
          field("Child_Status__c",dataValue("Basic_Information.Child_Status")),
          field("Birth_Certificate__c",dataValue("Basic_Information.birth_certificate")),
          field("Currently_enrolled_in_school__c",dataValue("Basic_Information.Child_Status")),
          field("Education_Level__c",dataValue("Basic_Information.Education_Level")),
          field("Telephone__c",dataValue("Basic_Information.Contact_Info.contact_phone_number")),
          field("Family_Planning__c",dataValue("Basic_Information.family_planning.Currently_on_family_planning")),
          field("Family_Planning_Method__c",dataValue("Basic_Information.family_planning.Family_Planning_Method")),
          field("Use_mosquito_net__c",dataValue("Basic_Information.person_info.sleep_under_net")),
          field("Chronic_illness__c",dataValue("Basic_Information.person_info.chronic_illness")),
          field("Two_weeks_or_more_cough__c",dataValue("Basic_Information.person_info.cough_for_2wks")),//transform
          field("Reason_for_a_referral__c",dataValue("Basic_Information.person_info.refer_for_cough")),//transform
          field("Knowledge_of_HIV_status__c",dataValue("Basic_Information.person_info.hiv_status")),
          field("HIV_Status__c",dataValue("Basic_Information.person_info.hiv_status")),
          field("Disability__c",dataValue("Basic_Information.person_info.disability")),
          field("Other_disability__c",dataValue("Basic_Information.person_info.sleep_under_net")),
          field("LMP__c",dataValue("TT5.Child_Information.ANCs.LMP")),
          field("ANC_1__c",dataValue("TT5.Child_Information.ANCs.ANC_1")),
          field("ANC_2__c",dataValue("TT5.Child_Information.ANCs.ANC_2")),
          field("ANC_3__c",dataValue("TT5.Child_Information.ANCs.ANC_3")),
          field("ANC_4__c",dataValue("TT5.Child_Information.ANCs.ANC_4")),
          field("ANC_5__c",dataValue("TT5.Child_Information.ANCs.ANC_5")),
          field("Delivery_Facility__c",dataValue("TT5.Child_Information.Delivery_Information.Birth_Facility")),
          field("BCG__c",dataValue("TT5.Child_Information.Immunizations.BCG")),
          field("OPV_0__c",dataValue("TT5.Child_Information.Immunizations.OPV_0")),
          field("OPV_PCV_Penta_1__c",dataValue("TT5.Child_Information.Immunizations.OPV_PCV_Penta_1")),
          field("OPV_PCV_Penta_2__c",dataValue("TT5.Child_Information.Immunizations.OPV_PCV_Penta_2")),
          field("Measles_6__c",dataValue("TT5.Child_Information.Immunizations.Measles_6")),
          field("Measles_9__c",dataValue("TT5.Child_Information.Immunizations.Measles_9")),
          field("Measles_18__c",dataValue("TT5.Child_Information.Immunizations.Measles_18")),
          field("Vitamin_A__c",dataValue("TT5.Child_Information.nutrition.vitamin_a")),
          field("Food_groups_3_times_a_day__c",dataValue("TT5.Child_Information.nutrition.food_groups")),
          field("Initial_MUAC__c",dataValue("TT5.Child_Information.nutrition.MUAC")),
          field("Pregnant__c",dataValue("TT5.Mother_Information.Pregnant")),
          field("Gravida__c",dataValue("TT5.Mother_Information.Pregnancy_Information.Gravida")),
          field("Parity__c",dataValue("TT5.Mother_Information.Pregnancy_Information.Parity"))

        )))
      }
    })
));
