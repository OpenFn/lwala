upsert(
  "Person__c",
  "CommCare_ID__c",
  fields(
    field("CommCare_ID__c", dataValue("case_id")),
    relationship("Household__r","CommCare_Code__c", dataValue("indices.parent.case_id")),
    field("BCG__c", dataValue("properties.BCG")),
    field("OPV_0__c", dataValue("properties.OPV_0")),
    field("OPV_1__c", dataValue("properties.OPV_PCV_Penta_1")),
    field("OPV_2__c", dataValue("properties.OPV_PCV_Penta_2")),
    field("OPV_3__c", dataValue("properties.OPV_PCV_Penta_3")),
    field("Measles_6__c", dataValue("properties.Measles_6")),
    field("Measles_9__c", dataValue("properties.Measles_9")),
    field("Measles_18__c", dataValue("properties.Measles_18"))
  )
); 