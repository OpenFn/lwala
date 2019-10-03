//** MOH513 Enroll Person form ** -> Upserting person record based on CommCare ID
upsert("Person__c","CommCare_ID__c", fields(
  field("CommCare_ID__c",dataValue("$.form.subcase_0.case.@case_id")),
  relationship("Household__r","CommCare_Code__c",dataValue("$.form.case.@case_id")),
  field("Name",(state)=>{
    var name1=dataValue("$.form.Person.Basic_Information.Person_Name")(state);
    var name2=name1.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    return name2;
  }),
  relationship("RecordType","Name",(state)=>{
    return(dataValue("$.form.Person.Basic_Information.Record_Type")(state).toString().replace(/_/g," "));
  }),
  field("Client_Status__c", "Active"),
  field("Relation_to_the_head_of_the_household__c", (state)=>{
    var relation = dataValue("$.form.Person.Basic_Information.relation_to_hh")(state).toString().replace(/_/g," ");
    const toTitleCase = relation.charAt(0).toUpperCase() + relation.slice(1);
    return toTitleCase;
  }),
  field("Child_Status__c",dataValue("$.form.Person.Basic_Information.Child_Status")),
  field("Date_of_Birth__c",dataValue("$.form.Person.Basic_Information.DOB")),
  field("Gender__c",dataValue("$.form.Person.Basic_Information.Gender")),
  field("Birth_Certificate__c",dataValue("$.form.Person.Basic_Information.birth_certificate")),
  field("Currently_enrolled_in_school__c",dataValue("$.form.Person.Basic_Information.enrolled_in_school")),
  field("Education_Level__c", (state)=>{
    var level = dataValue("$.form.Person.Basic_Information.Education_Level")(state)
    return(level!==undefined ? level.toString().replace(/_/g," ") : null);
  }),
  field("Telephone__c",dataValue("$.form.Person.Basic_Information.Contact_Info.contact_phone_number")),
  field("Family_Planning__c",dataValue("$.form.Person.Basic_Information.family_planning.Currently_on_family_planning")),
  field("Family_Planning_Method__c",dataValue("$.form.Person.Basic_Information.family_planning.Family_Planning_Method")),
  field("Use_mosquito_net__c",dataValue("$.form.Person.Basic_Information.person_info.sleep_under_net")),
  field("Chronic_illness__c", (state)=>{
    var chronic = dataValue("$.form.Person.Basic_Information.person_info.chronic_illness")(state);
    var illness = '';
    if(chronic!==undefined){
      chronic = chronic.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(';');
      return chronic;
      illness = chronic.toString().replace(/_/g," ");
    } else { illness == null}
    //var illness = dataValue("$.form.Person.Basic_Information.person_info.chronic_illness")(state).toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(';')
    return illness;
  }),
  field("Two_weeks_or_more_cough__c",dataValue("$.form.Person.Basic_Information.person_info.cough_for_2wks")),
  field("Knowledge_of_HIV_Status__c",dataValue("$.form.Person.Basic_Information.person_info.known_hiv_status")),
  field("HIV_Status__c",dataValue("$.form.Person.Basic_Information.person_info.hiv_status")),
  field("Disability__c",(state)=>{
    var disability = dataValue("$.form.Person.Basic_Information.person_info.disability")(state);
    var toTitleCase = '';
    if(disability !==undefined){
      toTitleCase = disability.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(';');
    } else{ toTitleCase === null }
    return toTitleCase;
  }),
  field("Other_disability__c",(state)=>{
    var disability = dataValue("$.form.Person.Basic_Information.person_info.other_disability")(state);
    var toTitleCase = '';
    if(disability !==undefined){
      toTitleCase = disability.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(';');
    } else{  toTitleCase === null }
    return toTitleCase;
  }),
  field("Active_in_Thrive_Thru_5__c", (state)=>{
    var status = dataValue("$.form.Person.Basic_Information.TT5_enrollment_status")(state);
    const active = (status == "Enrolled in TT5" ? "Yes" : "No");
    return active;
  }),
  field("Active_in_HAWI__c", (state)=>{
      var status = dataValue("$.form.Person.Basic_Information.person_info.HAWI_enrollment_status")(state);
      const active = (status == "Enrolled in HAWI" ? "Yes" : "No");
      return active;
  }),
  field("LMP__c",dataValue("$.form.Person.TT5.Child_Information.ANCs.LMP")),
  field("Source__c",true),
  field("ANC_1__c",dataValue("$.form.Person.TT5.Child_Information.ANCs.ANC_1")),
  field("ANC_2__c",dataValue("$.form.Person.TT5.Child_Information.ANCs.ANC_2")),
  field("ANC_3__c",dataValue("$.form.Person.TT5.Child_Information.ANCs.ANC_3")),
  field("ANC_4__c",dataValue("$.form.Person.TT5.Child_Information.ANCs.ANC_4")),
  field("ANC_5__c",dataValue("$.form.Person.TT5.Child_Information.ANCs.ANC_5")),
  field("BCG__c",dataValue("$.form.Person.TT5.Child_Information.Immunizations.BCG")),
  field("OPV_0__c",dataValue("$.form.Person.TT5.Child_Information.Immunizations.OPV_0")),
  field("OPV_1__c",dataValue("$.form.Person.TT5.Child_Information.Immunizations.OPV_PCV_Penta_1")),
  field("OPV_2__c",dataValue("$.form.Person.TT5.Child_Information.Immunizations.OPV_PCV_Penta_2")),
  field("OPV_3__c",dataValue("$.form.Person.TT5.Child_Information.Immunizations.OPV_PCV_Penta_3")),
  field("Measles_6__c",dataValue("$.form.Person.TT5.Child_Information.Immunizations.Measles_6")),
  field("Measles_9__c",dataValue("$.form.Person.TT5.Child_Information.Immunizations.Measles_9")),
  field("Measles_18__c",dataValue("$.form.Person.TT5.Child_Information.Immunizations.Measles_18")),
  field("Pregnant__c", (state)=>{
    var preg = dataValue("$.form.Person.TT5.Mother_Information.Pregnant")(state)
    return (preg == "No" ? false : true);
  }),
  field("Gravida__c",dataValue("$.form.Person.TT5.Mother_Information.Pregnancy_Information.Gravida")),
  field("Parity__c",dataValue("$.form.Person.TT5.Mother_Information.Pregnancy_Information.Parity")),
  field("Unique_Patient_Code__c",dataValue("$.form.Person.HAWI.Unique_Patient_Code")),
  field("Active_in_Support_Group__c",dataValue("$.form.Person.HAWI.Active_in_Support_Group")),
  field("CommCare_HH_Code__c",dataValue("$.form.case.@case_id")),
  field("Currently_on_ART_s__c",dataValue("$.form.Person.HAWI.ART")),
  field("ART_Regimen__c",dataValue("$.form.Person.HAWI.ARVs")),
  field("Exclusive_Breastfeeding__c",dataValue("$.form.Person.TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding")),
  field("Vitamin_A__c",dataValue("$.form.Person.TT5.Child_Information.nutrition.vitamin_a")),
  field("Food_groups_3_times_a_day__c",dataValue("$.form.TT5.Child_Information.nutrition.food_groups")),
  field("Initial_MUAC__c",dataValue("$.form.Person.TT5.Child_Information.nutrition.MUAC")),
  field("MCH_booklet__c",dataValue("$.form.Person.TT5.Mother_Information.mch_booklet")),
  field("Preferred_Care_Facility__c", (state)=>{
    var facility= dataValue("$.form.Person.HAWI.Preferred_Care_Facility")(state);
    return (facility!==undefined ? facility.toString().replace(/_/g," ") : null)
  }),
  field("Delivery_Facility__c", (state)=>{
    var facility= dataValue("$.form.Person.TT5.Child_Information.Delivery_Information.Birth_Facility")(state);
    return (facility!==undefined ? facility.toString().replace(/_/g," ") : null)
  }),
  /*field("Place_of_Delivery__c",(state)=>{
    var facility= dataValue("$.form.Person.TT5.Child_Information.Delivery_Information.Skilled_Unskilled")(state);
    return (facility!==undefined ? facility.toString().replace(/_/g," ") : null)
  })*/
  field("Place_of_Delivery__c",(state)=>{
    var val='';
    var skilled=dataValue("$.form.Person.TT5.Child_Information.Delivery_Information.Skilled_Unskilled")(state);
    if(skilled!==undefined){
      val = (skilled =='Skilled'? 'Facility' : 'Home');
      }
    return val;
  })
)),
//**Upserting Supervisor Visit records; checks if Visit already exists via CommCare Visit ID which = CommCare submission ID
upsert("Visit__c", "CommCare_Visit_ID__c", fields(
  field("CommCare_Visit_ID__c", dataValue("id")),
  relationship("Household__r","CommCare_Code__c",dataValue("$.form.case.@case_id")),
  field("Name", "Supervisor Visit"),
  field("Supervisor_Visit__c",(state)=>{
    var visit = dataValue("$.form.supervisor_visit")(state).toString().replace(/ /g,";")
    return visit.toString().replace(/_/g," ");
  }),
  field("Date__c",dataValue("$.form.Date")),
  //field("Household_CHW__c",dataValue("$.form.Person.CHW_ID")),//NEED TO MAP CHW ID???
  field("Household_CHW__c", "a031x000002S9lm"), //HARDCODED FOR SANDBOX TESTING --> To replace with line above
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
));
