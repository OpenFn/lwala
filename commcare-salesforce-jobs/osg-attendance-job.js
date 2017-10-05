create("Activity__c",fields(
  field("Date__c",dataValue("form.info.date")),
  field("Module_Type__c",function(state){
    var str1=dataValue("form.module_number")(state).toString().replace(/_/g," ");
    return str1;
  }
  ),
  field("Facilitator__c",dataValue("form.info.Facilitator")),
  field("Name",function(state){
    var str1=dataValue("form.module_name")(state).toString().replace(/_/g," ");
    return str1;
  }),
  field("Group__c",dataValue("form.sfid")),
  field("Program__c",dataValue("form.program")),
  field("CommCare_ID__c",dataValue("metadata.instanceID"))
)),

combine(function(state){
  var attendees=dataValue("form.attendees")(state).split(" ");
  for(i=0;i<attendees.length;i++){
    create("Attendance__c",fields(
      field("Activity__c",lastReferenceValue("id")),
      field("Date__c",dataValue("form.info.date")),
      relationship("Person__r","CommCare_ID__c",attendees[i])
    ))(state);
  }
})
/*create("Household_Attendance__c",fields(
    field("Activity__c",lastReferenceValue("id")),
    field("Date__c",dataValue("form.info.date")),
    relationship("Household__c","Name","01465")
))*/