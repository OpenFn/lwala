//Update CommCare case
alterState(state => {
  console.log(`Mapping HH code to CommCare: `, dataValue('Envelope.Body.notifications.Notification.sObject.Household_Code_Autonumber__c')(state));
  return state; 
  
}); 
submitXls(
  [
    {
      case_id: dataValue('Envelope.Body.notifications.Notification.sObject.Commcare_Code__c'), 
      name: dataValue('Envelope.Body.notifications.Notification.sObject.Household_Code_Autonumber__c')
    },
  ],
  {
    case_type: 'household',
    search_field: 'case_id',
    search_column: 'case_id',
    create_new_cases: 'off',
  }
)