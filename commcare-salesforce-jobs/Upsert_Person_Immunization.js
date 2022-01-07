upsert(
  "Person__c",
  "CommCare_ID__c",
  fields(
    field("CommCare_ID__c", dataValue("case_id")),
    field("BCG__c", dataValue("properties.CHW.Follow-Up.Immunizations.BCG")),
    field("OPV_0__c", dataValue("properties.CHW.Follow-Up.Immunizations.OPV_0")),
    field("OPV_1__c", dataValue("properties.CHW.Follow-Up.Immunizations.OPV_PCV_Penta_1")),
    field("OPV_2__c", dataValue("properties.CHW.Follow-Up.Immunizations.OPV_PCV_Penta_2")),
    field("OPV_3__c", dataValue("properties.CHW.Follow-Up.Immunizations.OPV_PCV_Penta_3")),
    field("Measles_6__c", dataValue("properties.CHW.Follow-Up.Immunizations.Measles_6")),
    field("Measles_9__c", dataValue("properties.CHW.Follow-Up.Immunizations.Measles_9")),
    field("Measles_18__c", dataValue("properties.CHW.Follow-Up.Immunizations.Measles_18"))
  )
); 
