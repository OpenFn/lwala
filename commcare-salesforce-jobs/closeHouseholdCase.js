upsert(
  'Household__c',
  'CommCare_Code__c',
  fields(
    field('CommCare_Username__c', dataValue('form.meta.username')),
    field('CommCare_Code__c', dataValue('form.case.@case_id')),
    field('Active_Household__c', state => {
      var status = dataValue('form.case.close')(state);
      return status && status !== 'No' && status !== false && status ===''
        ? true
        : undefined;
    }),
    field('Source__c', 1),
    field('Last_Modified_Date_CommCare__c', dataValue('server_modified_on')),
    field('Case_Closed_Date__c', state => {
      var status = dataValue('form.case.close')(state);
      var closed = status && status !== 'No' && status !== false && status ===''
        ? true
        : undefined;
      var date =  dataValue('server_modified_on')(state); 
      return closed && closed == true ? date : undefined; 
    })
  )
)
