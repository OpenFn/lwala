//Update CommCare case
alterState(state => {
  console.log(`Mapping HH code to CommCare: `, dataValue('Envelope.Body.notifications.Notification.sObject.Household_Code_Autonumber__c')(state));
  console.log("State")
  console.log(state.data)
  return state; 
  
}); 
submitXls(
  [
    {
      case_id: dataValue('Envelope.Body.notifications.Notification.sObject.Commcare_Code__c')(state), 
      name: dataValue('Envelope.Body.notifications.Notification.sObject.Household_Code_Autonumber__c')(state)
    },
  ],
  {
    case_type: 'Household',
    search_field: 'case_id',
    search_column: 'case_id',
    name_column: 'name',
    create_new_cases: 'off',
  }
)