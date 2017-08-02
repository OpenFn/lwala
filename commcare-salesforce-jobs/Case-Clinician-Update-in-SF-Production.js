upsert("Service__c","CommCare_Code__c",fields(
  field("CommCare_Code__c",dataValue("form.case.@case_id")(state)),
  field("Source__c",1),
  field("RecordTypeID","0129E00000009P3"),
  field("Open_Case__c",function(state){
    var status=1;
    if(dataValue("$.form.Clinician.Follow-Up")(state)=='Yes'){
      status=1;
    }
    else{
      status=0;
    }
    return status;
  }),
  field("Clinical_Visit_Date__c",dataValue("$.form.Clinician.Facility_Date")),
  field("Follow_Up_By_Date__c",dataValue("$.form.Clinician.Follow-Up_By_Date")),
  field("Follow_Up_Required__c",dataValue("$.form.Clinician.Follow-Up"))
))// Your job goes here.// Your job goes here.// Your job goes here.