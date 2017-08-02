create("Service__c", fields(
  field("Source__c",1),
  field("Appointment_Date__c",dataValue("$.form.Appointment_Date")),
  field("Type_of_Service__c","Clinician Appointment"),
  field("Reason_for_Appointment__c",dataValue("$.form.Reason_for_Appointment")),
  field("RecordTypeID","0129E00000009P3"),
  field("Open_Case__c",1),
  field("CommCare_Code__c",dataValue("form.subcase_0.case.@case_id")(state)),
  relationship("Person__r","CommCare_ID__c",dataValue("$.form.case.@case_id"))
  
))// Your job goes here.