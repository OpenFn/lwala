//MOH513 Enroll Household Form
//Alters CommCare Person arrays so that they are formatted as arrays instead of just single values.
alterState((state) =>{
  const person=state.data.form.Person;
  if(!Array.isArray(person)){
    state.data.form.Person=[person];
  }
  function titleCase(str) {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
   }
   return splitStr.join(' ');
 }
  return state;
});
//Upserting Household, checks if Household exists via MOH Household Code
combine(function(state){
if(dataValue("form.Source")(state)==1){
  upsert("Household__c", "CommCare_Code__c",fields(
    field("MOH_household_code__c", dataValue("form.moh_code")),
    field("CommCare_Code__c",dataValue("form.case.@case_id")),
    field("Source__c", true),
    //field("Household_CHW__c",dataValue("form.CHW_ID")), //CONFIRM IDs MATCH PRODUCTION
    field("Household_CHW__c", "a031x000002S9lm"), //HARDCODED FOR SANDBOX TESTING --> To replace with line above
    relationship("Catchment__r","Name", dataValue("form.catchment")),// check
    field("Area__c", dataValue("form.area")),  //CONFIRM IDs MATCH PRODUCTION
    field("Household_village__c", dataValue("form.village")),
    field("Deaths_in_the_last_6_months__c", (state)=>{
      var death = dataValue("form.Household_Information.deaths_in_past_6_months")(state)
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
    field("WASH_Trained__c", dataValue("form.Household_Information.WASH_Trained")),
    field("Total_household_people__c", dataValue("form.Total_Number_of_Members"))
  ))(state)
 }
}),
    //Upserting Supervisor Visit records; checks if Visit already exists via CommCare Visit ID which = CommCare submission ID
  upsert("Visit__c", "CommCare_Visit_ID__c", fields(
    field("CommCare_Visit_ID__c", dataValue("id")),
    relationship("Household__r", "CommCare_Code__c", dataValue("form.case.@case_id")),
    field("Name", "CHW Visit"),
    field("Supervisor_Visit__c",(state)=>{
      var visit = dataValue("form.supervisor_visit")(state).toString().replace(/ /g,";")
      return visit.toString().replace(/_/g," ");
    }),
    field("Date__c",dataValue("metadata.timeEnd")),
    //field("Household_CHW__c",dataValue("form.CHW_ID")),
    field("Household_CHW__c", "a031x000002S9lm"), //HARDCODED FOR SANDBOX TESTING --> To replace with line above
    relationship("Catchment__r","Name", dataValue("form.catchment")),
    field("Location__latitude__s", (state)=>{
      var lat = state.data.metadata.location;
      lat = lat.substring(0, lat.indexOf(" "));
      return (lat!==null? lat : null);
    }),
   field("Location__longitude__s", (state)=>{
      var long = state.data.metadata.location;
      long = long.substring(long.indexOf(" ")+1, long.indexOf(" ")+7);
      return (long!==null? long : null);
    })
  )),
//Upsert Person via CommCare case ID for each person enrolled
each(
  dataPath("form.Person[*]"),
  upsert("Person__c","CommCare_ID__c", fields(
    relationship("Household__r", "CommCare_Code__c", dataValue("case.index.parent.#text")),
    field("CommCare_ID__c",dataValue("case.@case_id")),
    field("CommCare_HH_Code__c", dataValue("case.index.parent.#text")),
    relationship("RecordType","Name",(state)=>{
      var rt = dataValue("Basic_Information.Record_Type")(state)
      var status = dataValue("Basic_Information.Child_Status")(state)
      return(status=="Unborn" ? "Child" : rt.toString().replace(/_/g," ")); //convert Unborn children to Child RT
    }),
    field("Name",(state)=>{
      var status = dataValue("Basic_Information.Child_Status")(state)
      var name1=dataValue("Basic_Information.Person_Name")(state);
      var name2=name1.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      return (status!=="Unborn" ? name2 : "Unborn Child");
    }),
    field("Source__c", true),
    relationship("Catchment__r","Name", dataValue("catchment")),// check
    field("Client_Status__c", "Active"),//To hardcode or to set dynamically?
    field("Area__c", state.data.form.area),// check
    field("Household_village__c", state.data.form.village),
    field("Relation_to_the_head_of_the_household__c", (state)=>{
      var relation = dataValue("Basic_Information.relation_to_hh")(state);
      var toTitleCase= (relation!==undefined ? relation.toString().replace(/_/g," ") : null);
      return (toTitleCase!==null ? toTitleCase.charAt(0).toUpperCase() + toTitleCase.slice(1) : null);
    }),
    field("Active_in_Thrive_Thru_5__c", (state)=>{
      var status = dataValue("Basic_Information.TT5_enrollment_status")(state);
      return(status=="Enrolled in TT5" ? "Yes" : "No");
    }),
    field("Active_in_HAWI__c", (state)=>{
        var status = dataValue("Basic_Information.person_info.HAWI_enrollment_status")(state);
        return(status=="Enrolled in HAWI" ? "Yes" : "No");
    }),
    field("Enrollment_Date__c", (state)=>{
      var status = dataValue("form.Person.Basic_Information.TT5_enrollment_status")(state);
      var date = dataValue("metadata.timeEnd")(state);
      return (status == "Enrolled in TT5" ? date : null);
    }),
    field("HAWI_Enrollment_Date__c", (state)=>{
      var status = dataValue("Basic_Information.person_info.HAWI_enrollment_status")(state);
      var date = dataValue("metadata.timeEnd")(state);
      return (status == "Enrolled in HAWI" ? date : null);
    }),
    field("Thrive_Thru_5_Registrant__c", (state)=>{
      var status = dataValue("Basic_Information.TT5_enrollment_status")(state);
      return (status == "Enrolled in TT5" ? "Yes" : "No");
    }),
    field("HAWI_Registrant__c", (state)=>{
      var status = dataValue("Basic_Information.person_info.HAWI_enrollment_status")(state);
      return (status == "Enrolled in HAWI" ? "Yes" : "No");
    }),
    field("Date_of_Birth__c",dataValue("Basic_Information.DOB")),
    //field("Child_Status__c",dataValue("Basic_Information.Child_Status")),
    field("Child_Status__c", (state)=>{
      var dob = dataValue("Basic_Information.DOB")(state)
      var status = dataValue("Basic_Information.Child_Status")(state)
      return(dob!==undefined || status=="Born" ? "Born" : "Unborn") //what about deceased?
    }),
    field("Gender__c",dataValue("Basic_Information.Gender")),
    field("Birth_Certificate__c",dataValue("Basic_Information.birth_certificate")),
    field("Education_Level__c", (state)=>{
      var edu = dataValue("Basic_Information.Education_Level")(state)
      return(edu!==undefined? edu.toString().replace(/_/g," ") : null);
    }),
    field("Currently_enrolled_in_school__c",dataValue("Basic_Information.enrolled_in_school")),
    field("Telephone__c",dataValue("Basic_Information.Contact_Info.contact_phone_number")),
    field("Family_Planning__c",dataValue("Basic_Information.family_planning.Currently_on_family_planning")), //transform to Yes/No?
    field("Family_Planning_Method__c",dataValue("Basic_Information.family_planning.Family_Planning_Method")),
    field("Use_mosquito_net__c",dataValue("Basic_Information.person_info.sleep_under_net")),
    field("Two_weeks_or_more_cough__c",dataValue("Basic_Information.person_info.cough_for_2wks")),
    field("Chronic_illness__c", (state)=>{
      var value = dataValue("Basic_Information.person_info.chronic_illness")(state)
      var illness = (value!==undefined ? value.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(';') : null);
      return (illness!==null ? illness.toString().replace(/_/g," ") : null);
    }),
    field("Knowledge_of_HIV_status__c",dataValue("Basic_Information.person_info.known_hiv_status")),
    field("HIV_Status__c",dataValue("Basic_Information.person_info.hiv_status")),
    field("Disability__c",(state)=>{
      var disability = dataValue("Basic_Information.person_info.disability")(state);
      var toTitleCase = (disability!==undefined ? disability.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(';') : null);
      return toTitleCase;
    }),
    field("Other_disability__c",(state)=>{
      var disability = dataValue("Basic_Information.person_info.other_disability")(state);
      var toTitleCase = (disability!==undefined ? disability.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(';') : null);
      return toTitleCase;
    }),
    field("Unique_Patient_Code__c",dataValue("HAWI.Unique_Patient_Code")),
    field("Active_in_Support_Group__c",dataValue("HAWI.Active_in_Support_Group")),
    field("CommCare_HH_Code__c",dataValue("case.@case_id")),
    field("Currently_on_ART_s__c",dataValue("HAWI.ART")),
    field("ART_Regimen__c",dataValue("form.Person.HAWI.ARVs")),
    field("Preferred_Care_Facility__c", (state)=>{
      var facility= dataValue("HAWI.Preferred_Care_Facility")(state);
      return (facility!==undefined ? facility.toString().replace(/_/g," ") : null)
    }),
    field("LMP__c",dataValue("TT5.Child_Information.ANCs.LMP")),
    field("ANC_1__c",dataValue("TT5.Child_Information.ANCs.ANC_1")),
    field("ANC_2__c",dataValue("TT5.Child_Information.ANCs.ANC_2")),
    field("ANC_3__c",dataValue("TT5.Child_Information.ANCs.ANC_3")),
    field("ANC_4__c",dataValue("TT5.Child_Information.ANCs.ANC_4")),
    field("ANC_5__c",dataValue("TT5.Child_Information.ANCs.ANC_5")),
    field("Delivery_Facility__c", (state)=>{
      var facility= dataValue("TT5.Child_Information.Delivery_Information.Birth_Facility")(state);
      return (facility!==undefined ? facility.toString().replace(/_/g," ") : null)
    }),
    field("Place_of_Delivery__c",(state)=>{
      var facility=dataValue("TT5.Child_Information.Delivery_Information.Skilled_Unskilled")(state);
      if(facility!==undefined){
         return (facility=='Skilled'? 'Facility' : 'Home');
        }
      return facility;
    }),
    field("BCG__c",dataValue("TT5.Child_Information.Immunizations.BCG")),
    field("OPV_0__c",dataValue("TT5.Child_Information.Immunizations.OPV_0")),
    field("OPV_1__c",dataValue("TT5.Child_Information.Immunizations.OPV_PCV_Penta_1")),
    field("OPV_2__c",dataValue("TT5.Child_Information.Immunizations.OPV_PCV_Penta_2")),
    field("OPV_3__c",dataValue("TT5.Child_Information.Immunizations.OPV_PCV_Penta_3")),
    field("Measles_6__c",dataValue("TT5.Child_Information.Immunizations.Measles_6")),
    field("Measles_9__c",dataValue("TT5.Child_Information.Immunizations.Measles_9")),
    field("Measles_18__c",dataValue("TT5.Child_Information.Immunizations.Measles_18")),
    field("Vitamin_A__c",dataValue("TT5.Child_Information.nutrition.vitamin_a")),
    field("Food_groups_3_times_a_day__c",dataValue("TT5.Child_Information.nutrition.food_groups")),
    field("Initial_MUAC__c",dataValue("TT5.Child_Information.nutrition.MUAC")),
    field("Exclusive_Breastfeeding__c",dataValue("TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding")),
    field("Pregnant__c", (state)=>{
      var preg = dataValue("TT5.Mother_Information.Pregnant")(state)
      return (preg=="Yes" ? true : false);
    }),
    field("Gravida__c",dataValue("TT5.Mother_Information.Pregnancy_Information.Gravida")),
    field("Parity__c",dataValue("TT5.Mother_Information.Pregnancy_Information.Parity"))
  ))
);
