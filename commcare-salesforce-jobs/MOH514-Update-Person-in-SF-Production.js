//MOH514 Update Person form
//Alters CommCare arrays so that they are formatted as arrays instead of just single values.
alterState((state) =>{
  if(dataValue("$.form.TT5.Child_Information.Clinical_Services")(state)!==undefined){
    const clinical=state.data.form.TT5.Child_Information.Clinical_Services;
    if(!Array.isArray(clinical)){
      state.data.form.TT5.Child_Information.Clinical_Services=[clinical];
    }
  }

  if(dataValue("$.form.HAWI.Clinical_Services_Rendered")(state)!==undefined){
    const clinical1=state.data.form.HAWI.Clinical_Services_Rendered;
    if(!Array.isArray(clinical1)){
      state.data.form.HAWI.Clinical_Services_Rendered=[clinical1];
    }
  }

  return state;
});
//To alter person & service logic
steps(
  combine(
    upsert("Person__c", "CommCare_ID__c", fields(
      //fields
    ))
  ),
  combine(
    upsert("Person__c","CommCare_ID__c",fields(
      //fields
    ))
  ),
  combine(
      create("Service__c", fields(
        field("Source__c",1),
        //field("Catchment__c","a002400000pAcOe"),
        field("Date__c",dataValue("$.form.Date")),
        field("Household_CHW__c",dataValue("$.form.CHW_ID_Final")),
        field("Type_of_Service__c","CHW Mobile Survey"),
        field("Reason_for_Service__c","Malaria (Home Treatment)"),
        field("Home_Treatment__c",dataValue("$.form.TT5.Child_Information.CCMM.Home_Treatment")),
        field("RecordTypeID","01224000000kOto"),
        field("Open_Case__c",1),
        field("Malaria_Status__c","Positive"),
        field("AL_Tablets__c",dataValue("$.form.TT5.Child_Information.CCMM.AL")),
        field("Paracetamol_Tablets__c",dataValue("$.form.TT5.Child_Information.CCMM.Paracetamol")),
        field("Follow_Up_By_Date__c",dataValue("$.form.Follow-Up_By_Date")),
        field("Home_Treatment_Date__c",dataValue("$.form.TT5.Child_Information.CCMM.test_date")),
        field("Malaria_Home_Test_Date__c",dataValue("$.form.TT5.Child_Information.CCMM.test_date")),
        field("CommCare_Code__c",dataValue("form.subcase_0.case.@case_id")),
        relationship("Person__r","CommCare_ID__c",dataValue("$.form.case.@case_id"))
      ))
),
  create("Visit__c",fields(
    relationship("Household__r","CommCare_Code__c",dataValue("$.form.HH_ID")),
    field("Household_CHW__c",dataValue("$.form.CHW_ID_Final")),
    field("Supervisor_Visit__c",function(state){
      return dataValue("$.form.supervisor_visit")(state).toString().replace(/ /g,";");
    }),
    field("Date__c",dataValue("$.metadata.timeEnd"))
  ))
);
