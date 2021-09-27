//Update CommCare case
fn( state => {
  console.log(state.data);
  return state; 
})
// submitXls(
//   [
//     {
//       case_id: state.data.Envelope.Body.notifications.Notification.sObject.Commcare_Code__c, 
//       name: state.data.Envelope.Body.notifications.Notification.sObject.Household_Code_Autonumber__c
//     },
//   ],
//   {
//     case_type: 'household',
//     search_field: 'case_id',
//     search_column: 'case_id',
//     create_new_cases: 'off',
//   }
// )