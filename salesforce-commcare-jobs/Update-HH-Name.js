//Update CommCare case
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
     create_new_cases: 'off',
   }
)