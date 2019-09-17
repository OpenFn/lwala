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
  field("MOH_household_code__c", dataValue("$.form.moh_code")),  field("CommCare_Code__c",dataValue("$.form.case.@case_id")),
  field("CommCare_Code__c",dataValue("$.form.case.@case_id")),
  //DONT MAP - field("Household_Code__c", dataValue("$.form.moh_code")),
  //DONT MAP - field("Name",dataValue("$.form.moh_code")),
  field("Source__c", true),
  //relationship("Household_CHW__r","Name", dataValue("form.CHW_Name")),
  field("Household_CHW__c",dataValue("$.form.CHW_ID")),
  relationship("Catchment__r","Name", dataValue("$.form.catchment")),// check
  field("Area__c", dataValue("$.form.area")),// check
  field("Household_village__c", dataValue("$.form.village")),
  //field("Total_Number_of_Members__c", dataValue("form.Total_Number_of_Members")),
  //field("Deaths_in_the_last_6_months__c", dataValue("form.Household_Information.deaths_in_past_6_months")),
  field("Deaths_in_the_last_6_months__c", function(state){
    const death = state.data.form.Household_Information.deaths_in_past_6_months;
    return (death > 0 ? "Yes" : "No");
  }),
  field("Access_to_safe_water__c", dataValue("$.form.Household_Information.Safe_Water")),
  field("Treats_Drinking_Water__c", dataValue("$.form.Household_Information.Treats_Drinking_Water")),
  field("Tippy_Tap__c", dataValue("form.Household_Information.Active_Handwashing_Station")),
  field("Pit_Latrine__c", dataValue("$.form.Household_Information.Functional_Latrine")),
  field("Rubbish_Pit__c", dataValue("$.form.Household_Information.Rubbish_Pit")),
  field("Drying_Rack__c", dataValue("$.form.Household_Information.Drying_Rack")),
  field("Kitchen_Garden__c", dataValue("$.form.Household_Information.Kitchen_Garden")),
  field("Cookstove__c", dataValue("$.form.Household_Information.Improved_Cooking_Method")),
  field("Clothe__c", dataValue("$.form.Household_Information.Clothesline"))
  )),
  upsert("Visit__c", "CommCare_Visit_ID__c", fields(
    field("CommCare_Visit_ID__c", dataValue("id")),
    relationship("Household__r", "MOH_household_code__c", dataValue("$.form.moh_code")),
    field("Name", "Supervisor Visit"),
    field("Supervisor_Visit__c", dataValue("$.form.supervisor_visit")),
    field("Household_CHW__c",dataValue("$.form.CHW_ID")),
    relationship("Catchment__r","Name", dataValue("$.form.catchment")),
    field("Date__c",dataValue("$.form.Person[0].Date"))
  )),
  each(
    dataPath("$.form.Person[*]"),
    upsert("Person__c","CommCare_ID__c", fields(
      relationship("Household__r", "MOH_household_code__c", state.data.form.moh_code),
      field("CommCare_ID__c",dataValue("case.@case_id")),
      field("CommCare_HH_Code__c", dataValue("case.index.parent.#text")),
      relationship("RecordType","Name",dataValue("Basic_Information.Record_Type")),
      field("Name",function(state){
        var name1=dataValue("Basic_Information.Person_Name")(state);
        var name2=name1.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        return name2;
      }),
      field("Source__c", true),
      relationship("Catchment__r","Name", dataValue("catchment")),// check
      field("Client_Status__c", "Active"), //Do we hardcode?
      field("Area__c", state.data.form.area),// check
      field("Household_village__c", state.data.form.village),
    //  field("Relation_to_the_head_of_the_household__c",dataValue("Basic_Information.relation_to_hh")),
      field("Child_Status__c",dataValue("Basic_Information.Child_Status")),
      field("Date_of_Birth__c",dataValue("Basic_Information.DOB")),
      field("Gender__c",dataValue("Basic_Information.Gender")),
    //  field("Age_Based_on_Date_of_Birth__c",dataValue("case.update.age")),
      field("Child_Status__c",dataValue("Basic_Information.Check_Unborn_Child")),
      field("Child_Status__c",dataValue("Basic_Information.Child_Status")),
      field("Birth_Certificate__c",dataValue("Basic_Information.birth_certificate")),
      field("Education_Level__c",dataValue("Basic_Information.Education_Level")),
      field("Telephone__c",dataValue("Basic_Information.Contact_Info.contact_phone_number")),
      field("Family_Planning__c",dataValue("Basic_Information.family_planning.Currently_on_family_planning")),
      field("Family_Planning_Method__c",dataValue("Basic_Information.family_planning.Family_Planning_Method")),
      field("Use_mosquito_net__c",dataValue("Basic_Information.person_info.sleep_under_net")),
      field("Two_weeks_or_more_cough__c",dataValue("Basic_Information.person_info.cough_for_2wks")),
      field("Chronic_illness__c",dataValue("Basic_Information.person_info.chronic_illness")), //transform multi-select?
      //field("Chronic_illness__c",function(state){ <trasnform>}),
      //field("Reason_for_a_refferal__c",dataValue("Basic_Information.person_info.refer_for_cough")),// to transform
      field("Reason_for_a_refferal__c",function(state){
        var cough = dataValue("Basic_Information.person_info.refer_for_cough")(state)
        return (cough=="yes" ? "Coughing for more than two weeks" : "");
      }),
      field("Knowledge_of_HIV_status__c",dataValue("Basic_Information.person_info.known_hiv_status")),
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
      field("OPV_1__c",dataValue("TT5.Child_Information.Immunizations.OPV_PCV_Penta_1")),
      field("OPV_2__c",dataValue("TT5.Child_Information.Immunizations.OPV_PCV_Penta_2")),
      field("Measles_6__c",dataValue("TT5.Child_Information.Immunizations.Measles_6")),
      field("Measles_9__c",dataValue("TT5.Child_Information.Immunizations.Measles_9")),
      field("Measles_18__c",dataValue("TT5.Child_Information.Immunizations.Measles_18")),
      field("Vitamin_A__c",dataValue("TT5.Child_Information.nutrition.vitamin_a")),
      field("Food_groups_3_times_a_day__c",dataValue("TT5.Child_Information.nutrition.food_groups")),
      field("Initial_MUAC__c",dataValue("TT5.Child_Information.nutrition.MUAC")),
      field("Pregnant__c", function(state){
        var preg = dataValue("TT5.Mother_Information.Pregnant")(state)
        return (preg == "No" ? false : true);
      }),
      field("Gravida__c",dataValue("TT5.Mother_Information.Pregnancy_Information.Gravida")),
      field("Parity__c",dataValue("TT5.Mother_Information.Pregnancy_Information.Parity"))
    ))
  )
