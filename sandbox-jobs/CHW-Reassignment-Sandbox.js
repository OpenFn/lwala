upsert(
  'Household__c',
  'CommCare_Code__c',
  fields(
    field('CommCare_Code__c', dataValue('$.form.case.@case_id')),
    field('Household_CHW__c', dataValue('$.form.CHW_ID')),
    relationship('Area__r', 'CommCare_User_ID__c', dataValue('$.form.area'))
  )
);

// Your job goes here.
