combine(function(state) {
  if(dataValue("$.form.CHW.Follow-Up.Follow-Up")(state)=="Yes"){
    if(dataValue("$.form.CHW.Follow-Up.Client_Improved")(state)=="No"){
      upsert("Service__c", "CommCare_Code__c", fields(
        field("CommCare_Code__c",dataValue("$.form.case.@case_id")),
        field("Follow_Up_Date__c",dataValue("$.form.CHW.Follow-Up.Follow-Up_Date")),
        field("Follow_Up_By_Date__c",dataValue("$.form.CHW.Follow-Up.Follow-Up_By_Date"))
      ))(state);
    }
    else{
      upsert("Service__c", "CommCare_Code__c", fields(
        field("CommCare_Code__c",dataValue("$.form.case.@case_id")),
        field("Follow_Up_Date__c",dataValue("$.form.CHW.Follow-Up.Follow-Up_Date")),
        
        field("Open_Case__c",false)
      ))(state);
    }
  }
  else if(dataValue("$.form.CHW.Facility_Services.Facility_Visit")(state)=="Yes"){
    upsert("Service__c", "CommCare_Code__c", fields(
      field("CommCare_Code__c",dataValue("$.form.case.@case_id")),
      field("Clinical_Visit_Date__c",dataValue("$.form.CHW.Facility_Services.Facility_Date"))
    ))(state);
  }
});

// create("Visit__c",fields(
//   relationship("Household__r","Name",dataValue("$.form.Household_Code")),
//   field("Household_CHW__c",dataValue("$.form.CHW_ID")),
//   field("Catchment__c","a002400000pAcOe"),
//   field("Date__c",dataValue("$.metadata.timeEnd")),
//   field("Location__latitude__s",dataValue("$.metadata.location[0]")),
//   field("Location__longitude__s",dataValue("$.metadata.location[1]"))
// ))
