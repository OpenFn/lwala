create(
  'Household_Membership__c',
  fields(
    relationship(
      'Household__r',
      'CommCare_Code__c',
      dataValue('$.form.case.@case_id')
    ),
    field('Group__c', dataValue('$.form.sfid')),
    field('Start_Date__c', dataValue('form.meta.timeEnd'))
  )
);
