/*** MOH514 - Update Person form ***/
alterState((state) =>{
  if(dataValue("form.TT5.Child_Information.Clinical_Services")(state)!==undefined){
    const clinical=state.data.form.TT5.Child_Information.Clinical_Services;
    if(!Array.isArray(clinical)){
      state.data.form.TT5.Child_Information.Clinical_Services=[clinical];
    }
  }

  if(dataValue("form.HAWI.Clinical_Services_Rendered")(state)!==undefined){
    const clinical1=state.data.form.HAWI.Clinical_Services_Rendered;
    if(!Array.isArray(clinical1)){
      state.data.form.HAWI.Clinical_Services_Rendered=[clinical1];
    }
  }

  return state;
});
//Evaluates client status and how to upsert Person records
steps(
  combine( function(state) {
  if(dataValue("form.Status.Client_Status")(state)=="Active" && dataValue("form.Source")(state)==1){
  //Deliveries
     upsert("Person__c", "CommCare_ID__c", fields(
      field("deworming_medication__c", dataValue("form.TT5.Child_Information.Deworming")), //new mapping for deworming
      field("Source__c",1),
      field("CommCare_ID__c", dataValue("form.case.@case_id")),
      relationship("Household__r","CommCare_Code__c",dataValue("form.HH_ID")),
      field("CommCare_HH_Code__c",dataValue("form.HH_ID")),
      field("Client_Status__c", dataValue("form.Status.Client_Status")),
      field("Name",(state)=>{
        var name1=dataValue("form.Person_Name")(state);
        var unborn=dataValue("form.ANCs.pregnancy_danger_signs.Delivery_Information.Person_Name")(state);
        var name2=(name1===undefined || name1==='' ? unborn : name1.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}));
        return (name1!==null ? name2 : "Unborn Child");
      }),
      relationship("RecordType","Name",(state)=>{
        var rt = dataValue("form.RecordType")(state)
        return(rt==="Unborn" || rt==="" ? "Child" : rt.toString().replace(/_/g," ")); //convert Unborn children to Child RT
      }),
      field("Reason_for_a_refferal__c", (state)=>{
        var referral = dataValue("form.Purpose_of_Referral")(state);
        //var referral = dataValue("form.treatment_and_tracking.Referral.Purpose_of_Referral")(state);
        var reason = (referral==="HIV_Testing_and_Counseling" ? "HIV counselling or Testing" : referral);
        return (reason!==undefined ? reason.toString().replace(/_/g," ") : null);
      }),
      field("Individual_birth_plan_counseling__c", dataValue("form.TT5.Child_Information.pregnancy_danger_signs.individual_birth_plan")),
      field("Pregnancy_danger_signs__c", (state)=>{
        var signs = dataValue("form.TT5.Child_Information.pregnancy_danger_signs.pregnancy_danger_signs")(state);
        var newSign ='';
        if(signs !==undefined){
          signs = signs.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(';');
          return newSign = signs.toString().replace(/_/g," ");
        } else{ return newSign = null; }
        return newSign;
      }),
      field("Child_danger_signs__c", (state)=>{
        var signs = dataValue("form.TT5malariald_Information.Danger_Signs.danger_sign_referral.Danger_Signs_Purpose_of_Referral")(state);
        var newSign ='';
        if(signs !==undefined){
          signs = signs.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(';');
          return newSign = signs.toString().replace(/_/g," ");
        } else{ return newSign = null; }
        return newSign;
      }),
      field("Child_Status__c", (state)=>{
        var status = dataValue("form.case.update.child_status")(state)
        var rt = dataValue("form.RecordType")(state)
        if(status!==undefined && rt=="Unborn" && status!=="Yes"){
          status = "Unborn";
        } else{
          status = "Born";
        }
        return status;
      }),
      field("Current_Malaria_Status__c", dataValue("form.Malaria_Status")),
      field("Counselled_on_Exclusive_Breastfeeding__c", dataValue("form.TT5.Child_Information.Exclusive_Breastfeeding.counseling")), //multiselect?
      field("Unique_Patient_Code__c", dataValue("form.case.update.Unique_Patient_Code")),
      field("Active_in_Support_Group__c", dataValue("form.case.update.Active_in_Support_Group")),
      field("Preferred_Care_Facility__c",dataValue("form.HAWI.Preferred_Care_F.Preferred_Care_Facility")),
      field("HAWI_Defaulter__c",(state)=>{
        var hawi = dataValue("form.HAWI.Preferred_Care_F.default")(state)
        return(hawi=="Yes" ? true : false);
      }),
      field("Date_of_Default__c",dataValue("form.HAWI.Preferred_Care_F.date_of_default")),
      field("Persons_temperature__c",dataValue("form.treatment_and_tracking.temperature")),
      field("Days_since_illness_start__c",dataValue("form.treatment_and_tracking.duration_of_sickness")),
      field("Newborn_visited_48_hours_of_delivery__c", dataValue("form.TT5.Child_Information.newborn_visited_48_hours_of_delivery")),
      field("Last_Malaria_Home_Test__c",dataValue("form.treatment_and_tracking.malaria_test_date")),
      field("Current_Malaria_Status__c",dataValue("form.treatment_and_tracking.malaria_test_results")),
      field("Last_Malaria_Home_Treatment__c",dataValue("form.TT5.Child_Information.CCMM.Home_Treatment")),
      field("Malaria_Follow_Up__c",dataValue("form.TT5.Child_Information.CCMM.Fever-Follow-Up_By_Date")),
      field("Malaria_Facility__c",dataValue("form.TT5.Child_Information.CCMM.malaria_referral_facility")),
      field("Malaria_Referral__c",dataValue("form.TT5.Child_Information.CCMM.Referral_Date")),
      field("Fever_over_7days__c",dataValue("form.treatment_and_tracking.symptoms_check_fever")),
      field("Cough_over_14days__c",dataValue("form.treatment_and_tracking.symptoms_check_cough")),
      field("Diarrhoea_over_14days__c",dataValue("form.treatment_and_tracking.symptoms_check_diarrhea")),
      field("Diarrhoea_less_than_14_days__c",dataValue("form.treatment_and_tracking.mild_symptoms_check_diarrhea")),
      field("Default_on_TB_treatment__c",dataValue("form.treatment_and_tracking.patient_default_tb")),
      field("TB_patients_therapy_observed__c",dataValue("form.treatment_and_tracking.observed_tb_therapy")),
      //field("Injuries_and_wounds_managed__c", dataValue("Injuries_and_wounds_managed")),
      field("Injuries_or_wounds__c", dataValue("form.treatment_and_tracking.wounds_or_injuries")),
      field("Currently_on_ART_s__c", dataValue("form.HAWI.ART")),
      field("ART_Regimen__c", dataValue("form.HAWI.ARVs")),
      field("Immediate_Breastfeeding__c", dataValue("form.ANCs.pregnancy_danger_signs.Delivery_Information.Breastfeeding_Delivery")),
      field("Verbal_autopsy__c", dataValue("form.Status.verbal_autopsy")),
      field("Date_of_Birth__c",dataValue("form.case.update.DOB")),
      field("Place_of_Delivery__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.Delivery_Type")(state);
        if(facility!==undefined){
           return (facility=='Skilled'? 'Facility' : 'Home');
          }
        return facility;
      }),
      field("Delivery_Facility__c",(state)=>{
        var facility= dataValue("form.TT5.Child_Information.Delivery_Facility")(state);
        return (facility!==undefined ? facility.toString().replace(/_/g," ") : null)
      }),
      field("Exclusive_Breastfeeding__c",dataValue("form.TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding")),
      field("Counselled_on_Exclusive_Breastfeeding__c",dataValue("form.TT5.Child_Information.Exclusive_Breastfeeding.counseling")),
      field("Family_Planning__c", (state)=>{
        var method1 = dataValue("form.Basic_Information.family_planning.Currently_on_family_planning")(state)
        var method2 = dataValue("form.TT5.Mother_Information.family_planning")(state)
        return(method2!==undefined ? method2 : method1);
      }),
      field("Family_Planning_Method__c", (state)=>{
        var method1 = dataValue("form.Basic_Information.family_planning.Family_Planning_Method")(state)
        var method2 = dataValue("form.TT5.Mother_Information.family_planning_method")(state)
        return(method2!==undefined ? method2 : method1);

      }),
      field("Pregnant__c", (state)=>{
        var preg = dataValue("form.TT5.Mother_Information.Pregnant")(state)
        return (preg=="Yes" ? true : false);
      })
    ))(state)
  }
//  }
  //Transfer Outs
  else if(dataValue("form.Status.Client_Status")(state)=="Transferred_Out"){
    upsert("Person__c","CommCare_ID__c",fields(
      field("CommCare_ID__c", dataValue("form.case.@case_id")),
      field("Source__c",1),
      field("Name",(state)=>{
        var name1=dataValue("form.Person_Name")(state);
        var name2=name1.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        return name2;
      }),
      field("Client_Status__c","Transferred Out"),
      field("TT5_Mother_Registrant__c", "No"),
      field("Active_TT5_Mother__c", "No"),
      field("Active_in_Thrive_Thru_5__c","No"),
      field("Inactive_Date__c",dataValue("form.Date")),
      field("Active_in_HAWI__c","No"),
      field("Active_TT5_Mother__c","No"),
      field("Date_of_Transfer_Out__c",dataValue("form.Status.Date_of_Transfer_Out"))
    ))(state);
  }
  //Lost to Follow Up
  else if(dataValue("form.Status.Client_Status")(state)=="Lost_to_Follow_Up"){
    upsert("Person__c","CommCare_ID__c",fields(
      field("Source__c",1),
      field("CommCare_ID__c", dataValue("form.case.@case_id")),
      field("Name",(state)=>{
        var name1=dataValue("form.Person_Name")(state);
        var name2=name1.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        return name2;
      }),
      field("Client_Status__c","Lost to Follow-Up"),
      field("Active_in_Thrive_Thru_5__c","No"),
      field("Active_TT5_Mother__c", "No"),
      field("TT5_Mother_Registrant__c", "No"),
      field("Active_in_HAWI__c","No"),
      field("Date_Last_Seen__c",dataValue("form.Status.Date_Last_Seen")),
      field("Inactive_Date__c",dataValue("form.Date"))
    ))(state);
  }
  //Graduated from Thrive Thru 5
  else if(dataValue("form.Status.Client_Status")(state)=="Graduated_From_TT5"){
    upsert("Person__c","CommCare_ID__c",fields(
      field("Source__c",1),
      field("CommCare_ID__c", dataValue("form.case.@case_id")),
      field("Name",(state)=>{
        var name1=dataValue("form.Person_Name")(state);
        var name2=name1.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        return name2;
      }),
      field("Client_Status__c","Graduated From TT5"),
      field("Active_in_Thrive_Thru_5__c","No"),
      field("Active_TT5_Mother__c", "No"),
      field("TT5_Mother_Registrant__c", "No"),
      field("Active_in_HAWI__c","No"),
      field("Active_TT5_Mother__c","No"),
      field("Date_Last_Seen__c",dataValue("form.Status.Date_Last_Seen")),
      field("Inactive_Date__c",dataValue("form.Date"))

    ))(state);
  }
  //Data entry error
  else if(dataValue("form.Status.Client_Status")(state)=="Data_Entry_Error"){
    upsert("Person__c","CommCare_ID__c",fields(
      field("Source__c",1),
      field("CommCare_ID__c", dataValue("form.case.@case_id")),
      field("Name",(state)=>{
        var name1=dataValue("form.Person_Name")(state);
        var name2=name1.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        return name2;
      }),
      field("Client_Status__c","Data Entry Error"),
      field("Active_in_Thrive_Thru_5__c","No"),
      field("Active_TT5_Mother__c","No"),
      field("TT5_Mother_Registrant__c", "No"),
      field("Active_in_HAWI__c","No"),
      field("Inactive_Date__c",dataValue("form.Date"))
    ))(state);
  }
  //Deceased
  else if(dataValue("form.Status.Client_Status")(state)=="Deceased"){
    upsert("Person__c","CommCare_ID__c",fields(
      field("Source__c",1),
      field("CommCare_ID__c", dataValue("form.case.@case_id")),
      field("Name",(state)=>{
        var name1=dataValue("form.Person_Name")(state);
        var name2=name1.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        return name2;
      }),
      field("Verbal_autopsy__c", dataValue("form.Status.verbal_autopsy")),
      field("Client_Status__c","Deceased"),
      field("Active_in_Thrive_Thru_5__c","No"),
      field("Active_in_HAWI__c","No"),
      field("Active_TT5_Mother__c","No"),
      field("TT5_Mother_Registrant__c", "No"),
      field("Date_of_Death__c",dataValue("form.Status.Date_of_Death")),
      field("Cause_of_Death__c",(state)=>{
        return dataValue("form.Status.Cause_of_Death")(state).toString().replace(/_/g," ");
      }),
      field("Inactive_Date__c",dataValue("form.Date"))
    ))(state);
  }
}),
//Person is added to TT5 ?
combine(function(state){
  if(dataValue("form.case.update.TT5_enrollment_status")(state)=="Enrolled in TT5" || dataValue("form.age")(state)<5 || dataValue("form.case.update.Active_in_TT5")(state)=="Yes" || dataValue("form.case.update.Pregnant")=="Yes"){
    upsert("Person__c","CommCare_ID__c",fields(
      field("CommCare_ID__c", dataValue("form.case.@case_id")),
      field("Active_in_Thrive_Thru_5__c", "Yes"),
      field("Enrollment_Date__c", dataValue("metadata.timeEnd")),
      field("Thrive_Thru_5_Registrant__c", "Yes" ),
      field("Active_TT5_Mother__c", (state)=>{
        var preg = dataValue("form.case.update.Pregnant")(state);
        return(preg=="Yes" ? "Yes" : null );
      }),
      field("TT5_Mother_Registrant__c", (state)=>{
        var preg = dataValue("form.case.update.Pregnant")(state);
        return(preg=="Yes" ? "Yes" : null );
      })
  ))(state)
  }
}),
//Person over age 5 / NOT active in TT5
combine(function(state){
  if(dataValue("form.age")(state)>5 || dataValue("form.case.update.Active_in_TT5")(state)=="No"){
    upsert("Person__c","CommCare_ID__c",fields(
      field("CommCare_ID__c", dataValue("form.case.@case_id")),
      field("Active_in_Thrive_Thru_5__c", "No"),
      field("Thrive_Thru_5_Registrant__c", "No" )
  ))(state)
  }
}),
//Person is added to HAWI ?
combine(function(state){
  if(dataValue("form.case.update.HAWI_enrollment_status")(state)=="Enrolled in HAWI" || dataValue("form.hiv_status")(state)=="positive" || dataValue("form.case.update.Active_in_HAWI")(state)=="Yes"){
    upsert("Person__c","CommCare_ID__c",fields(
      field("CommCare_ID__c", dataValue("form.case.@case_id")),
      field("Active_in_HAWI__c", "Yes"),
      field("HAWI_Enrollment_Date__c", dataValue("metadata.timeEnd")),
      field("HAWI_Registrant__c", "Yes" ),
      field("HIV_Status__c", "positive")
  ))(state)
  }
}),
//Person is NOT enrolled in HAWI
combine(function(state){
  if(dataValue("form.case.update.HAWI_enrollment_status")(state)=="Not enrolled in HAWI"){
    upsert("Person__c","CommCare_ID__c",fields(
      field("CommCare_ID__c", dataValue("form.case.@case_id")),
      field("Active_in_HAWI__c", "No"),
      field("HAWI_Registrant__c", "No" )
  ))(state)
  }
}),
//--- UPSERT SERVICE RECORDS ---/
//ANC1
combine( function(state) {
  if(dataValue("form.TT5.Child_Information.ANCs.copy-1-of-anc_1")(state)=="click_to_enter_anc_1"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "anc_1"
        return serviceId;
      }),
      field("Source__c",1),
      field("Reason_for_Service__c","ANC 1"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Date__c",dataValue("form.TT5.Child_Information.ANCs.ANC_1")),
      field("ANC_1__c",dataValue("form.TT5.Child_Information.ANCs.ANC_1")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("Purpose_of_Referral__c","ANC 1"),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id")),
      relationship("Site__r","Label__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.ANCs.Facility1")(state);
        if(facility===''||facility===undefined){
          facility="unknown";
        }
        return facility;
      })
    ))(state);
  }
}),
//ANC2
combine( function(state) {
  if(dataValue("form.TT5.Child_Information.ANCs.copy-1-of-anc_2")(state)=="click_to_enter_anc_2"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "anc_2"
        return serviceId;
      }),
      field("Source__c",1),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Reason_for_Service__c","ANC 2"),
      field("Date__c",dataValue("form.TT5.Child_Information.ANCs.ANC_2")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("ANC_2__c",dataValue("form.TT5.Child_Information.ANCs.ANC_2")),
      field("Purpose_of_Referral__c","ANC 2"),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id")),
      relationship("Site__r","Label__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.ANCs.Facility2")(state);
        if(facility===''||facility===undefined){
          facility="unknown";
        }
        return facility;

      })
    ))(state);
  }
}),
//ANC3
combine( function(state) {
  if(dataValue("form.TT5.Child_Information.ANCs.copy-1-of-anc_3")(state)=="click_to_enter_anc_3"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "anc_3"
        return serviceId;
      }),
      field("Source__c",true),
      field("Reason_for_Service__c","ANC 3"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Date__c",dataValue("form.TT5.Child_Information.ANCs.ANC_3")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("ANC_3__c",dataValue("form.TT5.Child_Information.ANCs.ANC_3")),
      field("Purpose_of_Referral__c","ANC 3"),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id")),
      relationship("Site__r","Label__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.ANCs.Facility3")(state);
        if(facility===''||facility===undefined){
          facility="unknown";
        }
        return facility;

      })
    ))(state);

  }
}),
//ANC4
combine( function(state) {
  if(dataValue("form.TT5.Child_Information.ANCs.copy-2-of-anc_3")(state)=="click_to_enter_anc_3"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "anc_4"
        return serviceId;
      }),
      field("Source__c",1),
      field("Reason_for_Service__c","ANC 4"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Date__c",dataValue("form.TT5.Child_Information.ANCs.ANC_4")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("ANC_4__c",dataValue("form.TT5.Child_Information.ANCs.ANC_4")),
      field("Purpose_of_Referral__c","ANC 4"),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id")),
      relationship("Site__r","Label__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.ANCs.Facility4")(state);
        if(facility===''||facility===undefined){
          facility="unknown";
        }
        return facility;
      })
    ))(state);
  }
}),
//ANC5
combine( function(state) {
  if(dataValue("form.TT5.Child_Information.ANCs.copy-3-of-anc_3")(state)=="click_to_enter_anc_3"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "anc_5"
        return serviceId;
      }),
      field("Source__c",1),
      field("Reason_for_Service__c","ANC 5"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Date__c",dataValue("form.TT5.Child_Information.ANCs.ANC_5")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("ANC_5__c",dataValue("form.TT5.Child_Information.ANCs.ANC_5")),
      field("Purpose_of_Referral__c","ANC 5"),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id")),
      relationship("Site__r","Label__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.ANCs.Facility5")(state);
        if(facility===''||facility===undefined){
          facility="unknown";
        }
        return facility;
      })
    ))(state);
  }
}),
//BCG REVIEWED
combine( function(state) {
  if(dataValue("form.TT5.Child_Information.Immunizations.copy-3-of-anc_3")(state)=="click_to_enter_anc_3"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "bcg"
        return serviceId
      }),
      field("Source__c",1),
      field("Reason_for_Service__c","BCG"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Date__c",dataValue("form.TT5.Child_Information.Immunizations.BCG")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id")),
      relationship("Site__r","Label__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.Immunizations.Facility_BCG")(state);
        if(facility===''||facility===undefined){
          facility="unknown";
        }
        return facility;
      })
    ))(state);
  }
}),
//OPV0 REVIEWED
combine( function(state) {
  if(dataValue("form.TT5.Child_Information.Immunizations.anc_3")(state)=="click_to_enter_anc_3"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "opv0"
        return serviceId
      }),
      field("Source__c",1),
      field("Reason_for_Service__c","OPV0"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Date__c",dataValue("form.TT5.Child_Information.Immunizations.OPV_0")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id")),
      relationship("Site__r","Label__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.Immunizations.Facility_OPV_0")(state);
        if(facility===''||facility===undefined){
          facility="unknown";
        }
        return facility;
      })
    ))(state);
  }
}),
//OPV1 REVIEWED
combine( function(state) {
  if(dataValue("form.TT5.Child_Information.Immunizations.copy-1-of-anc_3")(state)=="click_to_enter_anc_3"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "opv1"
        return serviceId
      }),
      field("Source__c",1),
      field("Reason_for_Service__c","OPV1"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Date__c",dataValue("form.TT5.Child_Information.Immunizations.OPV_PCV_Penta_1")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id")),
      relationship("Site__r","Label__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.Immunizations.Facility_OPV_1")(state);
        if(facility===''||facility===undefined){
          facility="unknown";
        }
        return facility;
      })
    ))(state);
  }
}),
//OPV2
combine( function(state) {
  if(dataValue("form.TT5.Child_Information.Immunizations.copy-2-of-anc_3")(state)=="click_to_enter_anc_3"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "opv2"
        return serviceId
      }),
      field("Source__c",1),
      field("Reason_for_Service__c","OPV2"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Date__c",dataValue("form.TT5.Child_Information.Immunizations.OPV_PCV_Penta_2")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id")),
      relationship("Site__r","Label__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.Immunizations.Facility_OPV_2")(state);
        if(facility===''||facility===undefined){
          facility="unknown";
        }
        return facility;
      })
    ))(state);
  }
}),
//OPV3
combine( function(state) {
  if(dataValue("form.TT5.Child_Information.Immunizations.copy-4-of-anc_3")(state)=="click_to_enter_anc_3"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "opv3"
        return serviceId
      }),
      field("Source__c",1),
      field("Reason_for_Service__c","OPV3"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Date__c",dataValue("form.TT5.Child_Information.Immunizations.OPV_PCV_Penta_3")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id")),
      relationship("Site__r","Label__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.Immunizations.Facility_OPV_3")(state);
        if(facility===''||facility===undefined){
          facility="unknown";
        }
        return facility;
      })
    ))(state);
  }
}),
//Measles 6
combine( function(state) {
  if(dataValue("form.TT5.Child_Information.Immunizations.copy-5-of-anc_3")(state)=="click_to_enter_anc_3"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "measles6"
        return serviceId
      }),
      field("Source__c",1),
      field("Reason_for_Service__c","Measles 6"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Date__c",dataValue("form.TT5.Child_Information.Immunizations.Measles_6")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id")),
      relationship("Site__r","Label__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.Immunizations.Facility_Measles_6")(state);
        if(facility===''||facility===undefined){
          facility="unknown";
        }
        return facility;
      })
    ))(state);

  }
}),
//Measles 9
combine( function(state) {
  if(dataValue("form.TT5.Child_Information.Immunizations.copy-6-of-anc_3")(state)=="click_to_enter_anc_3"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "measles9"
        return serviceId
      }),
      field("Source__c",1),
      field("Reason_for_Service__c","Measles 9"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Date__c",dataValue("form.TT5.Child_Information.Immunizations.Measles_9")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id")),
      relationship("Site__r","Label__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.Immunizations.Facility_Measles_9")(state);
        if(facility===''||facility===undefined){
          facility="unknown";
        }
        return facility;
      })
    ))(state);
  }
}),
//Measles 18
combine( function(state) {
  if(dataValue("form.TT5.Child_Information.Immunizations.copy-7-of-anc_3")(state)=="click_to_enter_anc_3"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "measles18"
        return serviceId
      }),
      field("Source__c",1),
      field("Reason_for_Service__c","Measles 18"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Date__c",dataValue("form.TT5.Child_Information.Immunizations.Measles_18")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id")),
      relationship("Site__r","Label__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.Immunizations.Facility_Measles_18")(state);
        if(facility===''||facility===undefined){
          facility="unknown";
        }
        return facility;
      })
    ))(state);
  }
}),
//Deworming
combine( function(state) {
  if(dataValue("form.TT5.Child_Information.Deworming")(state)=="Yes"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "deworming"
        return serviceId
      }),
      field("Source__c",1),
      field("Reason_for_Service__c","Deworming"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Date__c",dataValue("form.Date")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id"))
    ))(state);
  }
}),
//Home Based care for HAWI clients
combine( function(state) {
  if(dataValue("form.HAWI.Home_Based_Care.Home_Based_Care_Provided")(state)!==undefined&&dataValue("form.HAWI.Home_Based_Care.Home_Based_Care_Provided")(state)!==''){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "homecare"
        return serviceId
      }),
      field("Source__c",1),
      field("Reason_for_Service__c","Home-Based Care"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Date__c",dataValue("form.Date")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000YAuK"),
      //field("Home_Based_Care_Rendered__c",'A;B;B'),
      field("Home_Based_Care_Rendered__c",(state)=>{
        var care='';
        var str=dataValue("form.HAWI.Home_Based_Care.Home_Based_Care_Provided")(state);
        care=str.replace(/ /g,";");
        care=care.replace(/_/g," ");
        return care;
      }),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id"))
    ))(state);
  }
}),
//Malaria cases
//Child
combine( function(state) {
  if(dataValue("form.treatment_and_tracking.malaria_test")(state)==="yes"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "malaria"
        return serviceId
      }),
      field("Source__c",1),
      field("Date__c",dataValue("form.Date")),
      field("Follow_Up_By_Date__c",(state)=>{
        var date = dataValue("form.Follow-Up_By_Date")(state)
        return(date!==undefined || date!==""? date : null);
      }),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("Referral_Date__c",dataValue("form.Referral_Date")),
      field("Referred__c",1),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("RecordTypeID","01224000000kOto"),
      field("Open_Case__c",1),
      field("Purpose_of_Referral__c","Malaria"),
      field("Malaria_Status__c",dataValue("form.treatment_and_tracking.malaria_test_results")),
      field("Home_Treatment_Date__c",dataValue("form.TT5.Child_Information.CCMM.Home_Treatment_Date")),
      field("Malaria_Home_Test_Date__c",dataValue("form.treatment_and_tracking.malaria_test_date")),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id"))
      ))(state);
    }
  }
),
//Malnutrition case
combine( function(state){
  if(dataValue("form.TT5.Child_Information.Nutrition2.Nutrition_Status")(state)!==undefined){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "malnutrition"
        return serviceId
      }),
      field("Source__c",1),
      field("Date__c",dataValue("form.Date")),
      field("Follow_Up_By_Date__c",dataValue("form.Date")),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("RecordTypeID","01224000000YAuK"),
      field("Reason_for_Service__c","Nutrition Screening"),
      field("Clinical_Visit_Date__c",dataValue("form.TT5.Child_Information.Nutrition2.Clinical_Date")),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id")),
      field("Height__c",dataValue("form.TT5.Child_Information.Nutrition.Height")),
      field("Weight__c",dataValue("form.TT5.Child_Information.Nutrition.Weight")),
      field("MUAC__c",dataValue("form.TT5.Child_Information.Nutrition.MUAC")),
      field("Nutrition_Status__c",(state)=>{
        var status='';
        if(dataValue("form.TT5.Child_Information.Nutrition2.Nutrition_Status")(state)=='normal'){
          status='Normal';
        }
        else if(dataValue("form.TT5.Child_Information.Nutrition2.Nutrition_Status")(state)=='moderate'){
          status='Moderately Malnourished';
        }
        else if(dataValue("form.TT5.Child_Information.Nutrition2.Nutrition_Status")(state)=='severe'){
          status='Severely Malnourished';
        }
        return status;
      }),
      relationship("Site__r","Label__c",(state)=>{
        var facility=dataValue("form.TT5.Child_Information.Nutrition2.referred_facility_malnutrition")(state);
        if(facility===''||facility===undefined){
          facility="unknown";
        }
        return facility;
      })
    ))(state);
  }
}),
//Referrals ... check on Site__r mappings and PNC service
//Other Referrals
combine( function(state){
  if(dataValue("form.treatment_and_tracking.symptoms_other_referral")(state)=="yes"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "other";
        return serviceId
      }),
      field("Source__c",1),
      field("Date__c",dataValue("form.Date")),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("RecordTypeID","01224000000kOto"),
      field("Referred__c",1),
      field("Follow_Up_By_Date__c",(state)=>{
  var date = dataValue("form.Follow-Up_By_Date")(state)
  return(date===null || date==="" ? null : date);
}),
      field("Reason_for_Service__c","Referral"),
      field("Open_Case__c",1),
      field("Purpose_of_Referral__c",(state)=>{
        var purpose = dataValue("form.treatment_and_tracking.symptoms_check_other")(state).toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(';')
        return purpose.toString().replace(/_/g," ");
      }),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id"))
    ))(state);
  }}),
//Skilled Delivery Referral
combine( function(state){
  if(dataValue("form.TT5.Child_Information.pregnancy_danger_signs.refer_skilled_delivery")(state)=="yes"){
   upsert("Service__c", "CommCare_Code__c", fields(
     field("CommCare_Code__c",(state)=>{
       var id = dataValue("id")(state);
       var serviceId = id + "skilled_delivery";
       return serviceId
     }),
     field("Source__c",1),
     field("Date__c",dataValue("form.Date")),
     field("Type_of_Service__c","CHW Mobile Survey"),
     field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
     field("RecordTypeID","01224000000kOto"),
     field("Referred__c",1),
     field("Follow_Up_By_Date__c",(state)=>{
  var date = dataValue("form.Follow-Up_By_Date")(state)
  return(date===null || date==="" ? null : date);
}),
     field("Reason_for_Service__c","Referral"),
     field("Open_Case__c",1),
     field("Purpose_of_Referral__c", "Skilled Delivery"),
     relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id"))
   ))(state);
 }}),
//Prenancy danger signs Referral
combine( function(state){
  if(dataValue("form.TT5.Child_Information.pregnancy_danger_signs.danger_sign_referral.referral")(state)=="Yes"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",(state)=>{
        var id = dataValue("id")(state);
        var serviceId = id + "pregnancy_danger_signs";
        return serviceId
      }),
      field("Source__c",1),
      field("Date__c",dataValue("form.TT5.Child_Information.pregnancy_danger_signs.danger_sign_referral.referral_date")),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
      field("RecordTypeID","01224000000kOto"),
      field("Referred__c",1),
      field("Follow_Up_By_Date__c",dataValue("form.TT5.Child_Information.pregnancy_danger_signs.danger_sign_referral.Follow-Up_By_Date")),
      field("Clinician_Comments__c",dataValue("form.TT5.Child_Information.pregnancy_danger_signs.danger_sign_referral.Clinician_Notes")),
      field("Reason_for_Service__c","Referral"),
      field("Open_Case__c",1),
      field("Purpose_of_Referral__c", "Pregnancy Danger Signs"),
      relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id"))
    ))(state);
 }}),
//PNC Referral ---> TO UPDATE
combine( function(state){
  if(dataValue("form.ANCs.pregnancy_danger_signs.Delivery_Information.refer_pnc")(state)=="yes"){ //Update when Julia updates group ???
    upsert("Service__c", "CommCare_Code__c", fields(
     field("CommCare_Code__c",(state)=>{
       var id = dataValue("id")(state);
       var serviceId = id + "pnc";
       return serviceId
     }),
     field("Source__c",1),
     field("Date__c",dataValue("form.Date")),
     field("Type_of_Service__c","CHW Mobile Survey"),
     field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
     field("RecordTypeID","01224000000kOto"),
     field("Referred__c",1),
     field("Follow_Up_By_Date__c",(state)=>{
       var date = dataValue("form.Follow-Up_By_Date")(state)
       return(date===null || date==="" ? null : date);
      }),
     field("Reason_for_Service__c","Referral"),
     field("Open_Case__c",1),
     field("Purpose_of_Referral__c", "PNC"),
     relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id"))
    ))(state);
  }}),
//Malnutrition Referral
combine( function(state){
  if(dataValue("form.TT5.Child_Information.Nutrition2.Referral")(state)=="yes"){
    upsert("Service__c", "CommCare_Code__c", fields(
     field("CommCare_Code__c",(state)=>{
       var id = dataValue("id")(state);
       var serviceId = id + "malnutrition";
       return serviceId
     }),
     field("Source__c",1),
     field("Date__c",dataValue("form.case.update.Date")),
     field("Type_of_Service__c","CHW Mobile Survey"),
     field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
     field("RecordTypeID","01224000000kOto"),
     field("Referred__c",1),
     field("Follow_Up_By_Date__c",(state)=>{
  var date = dataValue("form.Follow-Up_By_Date")(state)
  return(date===null || date==="" ? null : date);
}), //UPDATE
     field("Reason_for_Service__c","Referral"),
     field("Open_Case__c",1),
     field("Purpose_of_Referral__c", "Malnutrition"),
     field("Nutrition_Status__c",dataValue("form.TT5.Child_Information.Nutrition2.Nutrition_Status")),
     field("MUAC__c",dataValue("form.TT5.Child_Information.Nutrition.MUAC")),
     field("Nutrition_referral_facility__c", (state)=>{
       var facility = dataValue("form.TT5.Child_Information.Nutrition2.referred_facility_malnutrition")(state)
       return(facility!==undefined ? facility.toString().replace(/_/g," ") : null);
     }),
     relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id"))
    ))(state);
  }}),
//Child Danger Sign Referral
combine( function(state){
  if(dataValue("form.TT5.Child_Information.Danger_Signs.danger_sign_referral.Danger_Signs_Referral")(state)=="yes"){
    upsert("Service__c", "CommCare_Code__c", fields(
     field("CommCare_Code__c",(state)=>{
       var id = dataValue("id")(state);
       var serviceId = id + "child_danger_sign";
       return serviceId
     }),
     field("Source__c",1),
     field("Date__c",dataValue("form.case.update.Date")),
     field("Type_of_Service__c","CHW Mobile Survey"),
     field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
     field("RecordTypeID","01224000000kOto"),
     field("Referred__c",1),
     field("Follow_Up_By_Date__c",dataValue("form.TT5.Child_Information.Danger_Signs.danger_sign_referral.Danger_Signs_Follow-Up_By_Date")),
     field("Reason_for_Service__c","Referral"),
     field("Open_Case__c",1),
     field("Purpose_of_Referral__c", "Child Danger Sign"),
     field("Clinician_Comments__c",dataValue("form.TT5.Child_Information.Danger_Signs.danger_sign_referral.Clinician_Notes")),
     relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id"))
    ))(state);
  }}),
//TB Referral
combine( function(state){
  if(dataValue("form.treatment_and_tracking.TB_referral")(state)=="yes"){
    upsert("Service__c", "CommCare_Code__c", fields(
     field("CommCare_Code__c",(state)=>{
       var id = dataValue("id")(state);
       var serviceId = id + "tb";
       return serviceId
     }),
     field("Source__c",1),
     field("Date__c",dataValue("form.case.update.Date")),
     field("Type_of_Service__c","CHW Mobile Survey"),
     field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
     field("RecordTypeID","01224000000kOto"),
     field("Referred__c",1),
     field("Follow_Up_By_Date__c",(state)=>{
  var date = dataValue("form.Follow-Up_By_Date")(state)
  return(date===null || date==="" ? null : date);
}),
     field("Reason_for_Service__c","Referral"),
     field("Open_Case__c",1),
     field("Purpose_of_Referral__c", "TB"),
     relationship("Site__r","Label__c",(state)=>{
       var facility=dataValue("form.treatment_and_tracking.TB_referral_facility")(state);
       if(facility===''||facility===undefined){
         facility="unknown";
       }
       return facility;
     }),
     relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id"))
    ))(state);
  }}),
//Diarrhea Referral
combine( function(state){
  if(dataValue("form.treatment_and_tracking.diarrhea_referral")(state)=="yes"){
    upsert("Service__c", "CommCare_Code__c", fields(
     field("CommCare_Code__c",(state)=>{
       var id = dataValue("id")(state);
       var serviceId = id + "diarrhea";
       return serviceId
     }),
     field("Source__c",1),
     field("Date__c",dataValue("form.case.update.Date")),
     field("Type_of_Service__c","CHW Mobile Survey"),
     field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
     field("RecordTypeID","01224000000kOto"),
     field("Referred__c",1),
     field("Follow_Up_By_Date__c",(state)=>{
  var date = dataValue("form.Follow-Up_By_Date")(state)
  return(date===null || date==="" ? null : date);
}),
     field("Reason_for_Service__c","Referral"),
     field("Open_Case__c",1),
     field("Purpose_of_Referral__c", "Diarrhea"),
     relationship("Site__r","Label__c",(state)=>{
       var facility=dataValue("form.treatment_and_tracking.diarrhea_referral_facility")(state);
       if(facility===''||facility===undefined){
         facility="unknown";
       }
       return facility;
     }),
     relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id"))
    ))(state);
  }}),
//Malaria Referral
combine( function(state){
  if(dataValue("form.treatment_and_tracking.malaria_referral")(state)=="yes"){
    upsert("Service__c", "CommCare_Code__c", fields(
     field("CommCare_Code__c",(state)=>{
       var id = dataValue("id")(state);
       var serviceId = id + "malaria";
       return serviceId
     }),
     field("Source__c",1),
     field("Date__c",dataValue("form.case.update.Date")),
     field("Type_of_Service__c","CHW Mobile Survey"),
     field("Household_CHW__c",dataValue("form.CHW_ID_Final")),
     field("RecordTypeID","01224000000kOto"),
     field("Referred__c",1),
     field("Follow_Up_By_Date__c",(state)=>{
  var date = dataValue("form.Follow-Up_By_Date")(state)
  return(date===null || date==="" ? null : date);
}),
     field("Reason_for_Service__c","Referral"),
     field("Open_Case__c",1),
     field("Purpose_of_Referral__c", "Malaria"),
     relationship("Site__r","Label__c",(state)=>{
       var facility=dataValue("form.treatment_and_tracking.malaria_referral_facility")(state);
       if(facility===''||facility===undefined){
         facility="unknown";
       }
       return facility;
     }),
     relationship("Person__r","CommCare_ID__c",dataValue("form.case.@case_id"))
    ))(state);
  }
}),
//HAWI other clinical services received
combine( function(state){
  if(dataValue("form.HAWI.Clinical_Service_Q")(state)==="yes"){
  each(dataPath("form.HAWI.Clinical_Services_Rendered[*]"), //CHECK IF ARRAY
    upsert("Service__c", "CommCare_Code__c", fields(
        field("CommCare_Code__c",(state)=>{
          var id = state.data.id;
          var serviceId = id + dataValue("Purpose")(state);
          return serviceId
        })(state),
        field("Source__c",1),
        field("Household_CHW__c",dataValue("chw")),
        field("Reason_for_Service__c",(state)=>{
          var reason='';
          var name=dataValue("Clinical_Service")(state);
          if(name=="Adverse_Drug_Reaction_Side_Effect"){
            reason="Adverse Drug Reaction/Side Effect";
          }
          else if(name=="Pregnancy_Care"){
            reason="Pregnancy Care (ANC)";
          }
          else if(name=="Family_Planning"){
            reason="Family Planning (FP)"
          }
          else{
            reason=name.replace(/_/g," ");
          }
          return reason;
        }),
        field("Purpose_of_Referral__c", dataValue("Purpose")),
        field("Date__c",dataValue("Date_of_Clinical_Service")),
        field("Type_of_Service__c","CHW Mobile Survey"),
        field("RecordTypeID","01224000000YAuK"),
        relationship("Site__r","Label__c",(state)=>{
            var facility=dataValue("Facility_of_Clinical_Service")(state);
            if(facility===''||facility===undefined){
              facility="unknown";
            }
            else if(facility=='Other_Clinic'){
              facility="Other";
            }
            else if(facility=="Rongo_Sub-District_Hospital"){
              facility="Rongo_SubDistrict_Hospital";
            }
            return facility;

          }),
        relationship("Person__r","CommCare_ID__c",dataValue("Case_ID"))
      ))
    )(state);
  }
}),
//TT5 other clinical services received
combine( function(state){
  if(dataValue("form.TT5.Child_Information.Clinical_Services_Q")(state)==="Yes"){
    each(dataPath("form.TT5.Child_Information.Clinical_Services[*]"),
    upsert("Service__c", "CommCare_Code__c", fields(
        field("CommCare_Code__c",(state)=>{
          var id = state.data.id;
          var serviceId = id + dataValue("Purpose")(state);
          return serviceId;
        }),
        field("Source__c",true),
        field("Household_CHW__c",dataValue("chw")),
        field("Reason_for_Service__c",(state)=>{
          var reason='';
          var name=dataValue("Clinical_Service")(state);
          if(name=="Adverse_Drug_Reaction_Side_Effect"){
            reason="Adverse Drug Reaction/Side Effect";
          }
          else if(name=="Pregnancy_Care"){
            reason="Pregnancy Care (ANC)";
          }
          else if(name=="Family_Planning"){
            reason="Family Planning (FP)"
          }
          else if (name!==undefined){
            reason=name.replace(/_/g," ");
          }
          return reason;
        }),
        field("Purpose_of_Referral__c",dataValue("Purpose")),
        field("Date__c",dataValue("Clinical_Date")),
        field("Type_of_Service__c","CHW Mobile Survey"),
        field("RecordTypeID","01224000000YAuK"),
        field("Clinic_Zinc__c", dataValue("diarrhea_clinic_treatment_zinc")),
        field("Clinic_ORS__c", dataValue("diarrhea_clinic_treatment_ORS")),
        relationship("Site__r","Label__c",(state)=>{
            var facility=dataValue("Facility_Clinical")(state);
            if(facility===''||facility===undefined){
              facility="unknown";
            }
            return facility;
          }),
        relationship("Person__r","CommCare_ID__c",dataValue("Case_ID"))
      ))
    )(state);
  }
}),
//Upsert Visit records
  combine( function(state){
    if(dataValue("form.Source")(state)==1){
    upsert("Visit__c", "CommCare_Visit_ID__c", fields(
      field("CommCare_Visit_ID__c", dataValue("id")),
      relationship("Household__r","CommCare_Code__c",dataValue("form.HH_ID")),
      field("Name", "CHW Visit"),
      field("Household_CHW__c", dataValue("form.CHW_ID_Final")),
      field("Supervisor_Visit__c",(state)=>{
        var visit = dataValue("form.supervisor_visit")(state)
        if(visit!==undefined){
          visit = visit.toString().replace(/ /g,";")
          return visit.toString().replace(/_/g," ");
        }
        return visit;
      }),
      field("Date__c",dataValue("metadata.timeEnd")),
      field("Location__latitude__s", (state)=>{
        var lat = state.data.metadata.location;
        return (lat!==null? lat.substring(0, lat.indexOf(" ")) : null);
      }),
     field("Location__longitude__s", (state)=>{
        var long = state.data.metadata.location;
        return (long!==null? long.substring(long.indexOf(" ")+1, long.indexOf(" ")+7) : null);
      })
    ))(state)
  }}),
  //Map Zinc and ors
  combine( function(state){
    if(dataValue("form.TT5.Child_Information.Clinical_Services_Q")(state)==="Yes"){
      each(dataPath("form.TT5.Child_Information.Clinical_Services[*]"),
        upsert("Person__c", "CommCare_ID__c", fields(
         field("Source__c",1),
         field("CommCare_ID__c", dataValue("Case_ID")),
         field("Child_zinc__c", (state)=>{
           var zinc = dataValue("diarrhea_clinic_treatment_zinc")(state)
           return (zinc==="Yes" ? "Yes" : undefined)
         }),
         field("Child_ORS__c", (state)=>{
           var ors = dataValue("diarrhea_clinic_treatment_ORS")(state)
           return (ors==="Yes" ? "Yes" : undefined)
         })
        ))
      )(state);
    }
  })
);
