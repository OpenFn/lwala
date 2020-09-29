create(
  'Activity__c',
  fields(
    field('Date__c', dataValue('form.info.date')),
    field('Catchment__c', 'a002400000pAcOe'),
    field('Module_Type__c', state => {
      var str1 = dataValue('form.info.module_number')(state)
        .toString()
        .replace(/_/g, ' ');
      return str1;
    }),
    field('Facilitator__c', dataValue('form.info.Facilitator')),
    field('Name', state => {
      var str1 = dataValue('form.info.name')(state)
        .toString()
        .replace(/_/g, ' ');
      return str1;
    }),
    field('Group__c', dataValue('form.sfid')),
    field('Program__c', dataValue('form.program')),
    field('CommCare_ID__c', dataValue('metadata.instanceID'))
  )
);

alterState(state => {
  var attendees = dataValue('form.attendees')(state).split(' ');
  for (i = 0; i < attendees.length; i++) {
    create(
      'Household_Attendance__c',
      fields(
        field('Activity__c', lastReferenceValue('id')),
        field('Date__c', dataValue('form.info.date')),
        relationship('Household__r', 'CommCare_Code__c', attendees[i])
      )
    )(state);
  }
  return state;
});
/*create("Household_Attendance__c",fields(
    field("Activity__c",lastReferenceValue("id")),
    field("Date__c",dataValue("form.info.date")),
    relationship("Household__c","Name","01465")
))*/
