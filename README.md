# Lwala CommCare SIMBA Connection

Lwala uses OpenFn to integrate its Salesforce database and CommCare CHW mobile application. The OpenFn jobs in this repository automate a bi-directional dataflow between the CommCare and Salesforce systems, ensuring regular data syncs and feedback loops for CHWs. 

*N.B. Any commits to the `master` branch will be automatically deployed to
Lwala's OpenFn project*

## Data Flows
OpenFn jobs are used to automate the following data flows between CommCare and Salesforce. This integration is event-driven (triggered whenever a record is created/ updated). [This diagram](https://lucid.app/lucidchart/e3411bda-1f0e-492f-b35d-6baf2dd3972a/edit?view_items=laxJTiq3D_aN&invitationId=inv_269ce3a1-612b-49b8-ab06-4805e3e483de#) provides an overview of how data flows from CommCare forms to Salesforce objects through OpenFn jobs.

### Reference Tables
There are some reference data tables that need to be consistent across the CommCare and Salesforce applications to ensure successful integration: 
1. **Locations** (Sites, Catchments, Areas) --> Ensure the Salesforce `Label` for these location records is consistent across Salesforce and CommCare. 
2. **CHWs** (Salesforce Record Ids) --> Ensure the Salesforce unique `Id` for each CHW is captured in CommCare . 
3. **Record Types** (Salesforce types to segment Persons - i.e., Child, Male Adult, Female Adult, Youth) --> If referenced in CommCare forms, the `Names` need to be aligned. 

### (1) CommCare --> Salesforce
CHWs register households, patients, and visits, and use CommCare as a tool for ongoing data collection and case management. As soon as the following CommCare forms are submitted, these [`CommCare-Salesforce-Jobs`](https://github.com/OpenFn/lwala/tree/master/commcare-salesforce-jobs) execute to forward data to Salesforce. 


#### New MOH Data Collection Forms
_These forms were introduced to support MOH partnership requirements, but are only live in some areas... to be rolled out widely in July 2021_
1. 513_Enroll_Person_in_SF__V1 ([`MOH513-Enroll-Person-in-SF.js`](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/MOH513-Enroll-Person-in-SF.js)) (To be replaced by Upsert Person & Person Visit)
2. 513_Enroll_Household_in_SF__V1 ([`MOH513-Enroll-Household-in-SF.js`](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/MOH513-Enroll-Household-in-SF.js)) (To be replaced by Upsert Household & Household Visit)
3. [NEW] 514_Update_Person_in_SF__V2 ([`MOH514-Update-Person_V2.js`](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/MOH514-Update-Person_V2.js)) (To be retired after Bulk Historical Resync)
4. Update Houshold ([`MOH513-Update-Household-in-SF-Revised.js`](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/MOH513-Update-Household-in-SF-Revised.js)) (To be replaced by Upsert Person & Person Visit)
5. [NEW] Referrals_Update_Person_Immunizations_V2 ([Referrals-Upsert-Person-Immunization_V2.js](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/Referrals-Upsert-Person-Immunization_V2.js)) (To be replaced by Upsert Person & Person Visit)
6. [NEW] Referrals_Upsert_Service_in_SF_V2 ([Referrals-Upsert-Service_V2.js](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/Referrals-Upsert-Service_V2.js))
7. Create Distribution & Referral in SF
8. Update_HH_Name_in_CommCare
9. Upsert Household & Household Visit
10. Upsert Person

#### Testing
1. [TEST] Bulk Upsert Person Visit
2. Upsert Person & Person Visit


### Deprecated Forms & Archived Jobs
1. Input Seed Support and Kitchen Garden Adoption
2. OSG Mentoring Attendance
3. Register Training
4. Schedule Appointment
5. Update Person ([`MOH514-Update-Person-in-SF-Production.js`](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/MOH514-Update-Person-in-SF-Production.js))
6. Outreach Registration ([`nutrition-survey-job.js`](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/nutrition-survey-job.js))

#### Legacy Forms (were active until mid-2021)
_Lwala Application Forms_ (These are the original CommCare forms that were replaced by the MOH forms.)
1. Enroll a Person ([`Create-Person-in-SF-Production.js`](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/Create-Person-in-SF-Production.js))
2. Enroll New Household ([`Create-Household-in-SF-Production.js`](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/Create-Household-in-SF-Production.js))
3. Update Person ([`Update-Person-in-SF-Production.js`](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/Update-Person-in-SF-Production.js))
4. CHW Household Survey ([`Update-Household-in-SF-Production.js`](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/Update-Household-in-SF-Production.js))
5. Change Household CHW ([`CHW-Reassignment-Production.js`](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/CHW-Reassignment-Production.js))
6. Enroll Household in Nutrition Program ([`Enroll-in-Nutrition-Group-in-SF.jss`](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/Enroll-in-Nutrition-Group-in-SF.js))
7. Nutrition Survey ([`nutrition-survey-job.js`](https://github.com/OpenFn/lwala/blob/master/commcare-salesforce-jobs/nutrition-survey-job.js))


### (2) Salesforce --> CommCare
There are multiple Apex Triggers in Salesforce on the `Household` and `Patient` objects that send outbound messages to Lwala's OpenFn inbox when specific updates are made in the Salesforce system. This enables OpenFn to sync Salesforce info back to CommCare. This SF automation includes: 
1. Households: Once HHs are creaed in Salesforce (via OpenFn/CommCare), a HH Code is assigned to `Household__c.Name` via the Salesforce Apex trigger `HouseholdCodeTrigger1`. Then another trigger `HouseholdupdateWebhookTrigger` sends this HH code (e.g., `42920`) and other HH information back to CommCare (via OpenFn) to sync back this reference id back to CommCare. 
These trigger run on Household insert/update and were developed by Lwala's Admin Will Edman in 2017. 

2. Patients: Salesforce Apex trigger `PersonTrigger` runs on Patient create/update to re-assign Persons to HHs and send notifications to OpenFn/CommCare when important information is changed or a case is de/activated, to sync back to the corresponding CommCare case. 
This trigger was originally developed by Vera Solutions, and then extended by Lwala's Admin in 2017 to include the webhook notifications to OpenFn.  

When these trigger-created Salesforce outbound notifications are received as new Messages in OpenFn, the following jobs are triggered to update data in CommCare. 
1. Send CHW Stats to CommCare (see [`CHW-Stats.js`](https://github.com/OpenFn/lwala/blob/master/salesforce-commcare-jobs/CHW-Stats.js))
2. Close cases in CommCare (see [`Close-Household-Case.js`](https://github.com/OpenFn/lwala/blob/master/salesforce-commcare-jobs/Close-Household-Case.js) and [`Close-Person-Case.js`](https://github.com/OpenFn/lwala/blob/master/salesforce-commcare-jobs/Close-Person-Case.js))
3. Create cases in CommCare when new SF records created ([see `Create` jobs here](https://github.com/OpenFn/lwala/tree/master/salesforce-commcare-jobs))
4. Update cases in CommCare when SF records are update ([see `Update` jobs here](https://github.com/OpenFn/lwala/tree/master/salesforce-commcare-jobs)) 

# Troubleshooting Notes
[See here](https://docs.google.com/document/d/1EjpZg2PNSl2K2gUmnFoSaEqxQsednKhyu7rp0wbEA90/edit) for the master troubleshooting user guide. 
## Common OpenFn Errors
1. `FIELD_CUSTOM_VALIDATION_EXCEPTION: Duplicate Visit`: Ignore. Salesforce-side error that occurs when OpenFn attempts to insert more than 1 Visit record within the same day. Forces failure to prevent duplicate data. *This is NOT best practice - to revisit and consider re-design so that there are never expected failures in OpenFn.*
2. `UNABLE_TO_LOCK_ROW`: Re-run to reprocess successfully. This is an error related to the Salesforce design that occurs when multiple automation flows attempt to update the same record at the same time. *To try lowering OpenFn run concurrency to see if this reduces occurrence of this error.*
3. `REQUIRED_FIELD_MISSING`: Occurs when a Salesforce field is made "required", but the corresponding data is not provided by and/ or not mapped by OpenFn. To troubleshoot, update the OpenFn mappings as needed and re-process Messages. 

## Questions? Need help? 
Contact support@openfn.org for troubleshooting guidance. 

# Training Materials
1. [See this folder](https://drive.google.com/drive/u/0/folders/15jGbYbmFRtZ4yLaWzq9NCRniZzqmgeVu) for 2020 materials, including *Change Management* training video & best practices. 
2. [See here](https://drive.google.com/drive/u/0/folders/1VGt8ARnowGzXvaN-CstolK94crnVRmlR) for prior training materials, and see this [Offline Testing Guide](https://docs.google.com/document/d/1nD4wwklkcmv0oxNk_diHyhxhVcq2jAlg2iGTFvxHeU4/edit?usp=sharing) for using `openfn-devtools` to test and edit jobs offline. 

### Development process
Propose a change by creating an issue, then feature branch named `###_issue` and
submitting a pull request against `master`. When it has been reviewed by at
least one other person, it may be merged and deployed to OpenFn.

### Agenda/Notes from Taylor's July 19th, 2018 Training
Create a `/tmp` folder in this repo that is _NOT_ part of version control. Put a
`state.json` file in there, and after setting up openfn-devtools you can execute
job tests with:
```sh
~/openfn-devtools/core/lib/cli.js execute -l ~/openfn-devtools/language-salesforce/lib/FakeAdaptor -e ./commcare-salesforce-jobs/Update-Person-in-SF-Production.js -o ./tmp/output.json -s ./tmp/state.json
```
or run real jobs with:
```sh
~/openfn-devtools/core/lib/cli.js execute -l ~/openfn-devtools/language-salesforce/lib/Adaptor -e ./commcare-salesforce-jobs/Update-Person-in-SF-Production.js -o ./tmp/output.json -s ./tmp/state.json
```

A sample state.json file looks like this:
```json
{
  "data": {
    "version": "1911",
    "uiversion": "1",
    "type": "data",
    "server_modified_on": "2018-07-18T15:22:16.552478Z",
    "resource_uri": "",
    "received_on": "2018-07-18T15:22:15.184390Z",
    "problem": null,
    "metadata": {
      "username": "Nu-uh",
      "userID": "999368544f4fa1af1e1f42d0e208349c",
      "timeStart": "2018-07-18T14:26:20.277000Z",
      "timeEnd": "2018-07-18T14:26:23.420000Z",
      "location": null,
      "instanceID": "469351d5-2bb6-48e6-a4ad-39eba54961a9",
      "geo_point": null,
      "deviceID": "354385080046177",
      "commcare_version": "2.35.3",
      "app_build_version": 1913,
      "appVersion": "CommCare Android, version \"2.35.3\"(431724). App v1913. CommCare Version 2.35. Build 431724, built on: 2017-04-19"
    },
    "is_phone_submission": true,
    "initial_processing_complete": true,
    "id": "469351d5-2bb6-48e6-a4ad-39eba54961a9",
    "form": {
      "owner_id": "de0c06552a6c471daef634553905036e",
      "meta": {
        "username": "Nope, Shhhhhhhhhhhhh!",
        "userID": "999368544f4fa1af1e1f42d0e208349c",
        "timeStart": "2018-07-18T14:26:20.277000Z",
        "timeEnd": "2018-07-18T14:26:23.420000Z",
        "location": {
          "@xmlns": "http://commcarehq.org/xforms"
        },
        "instanceID": "469351d5-2bb6-48e6-a4ad-39eba54961a9",
        "geo_point": null,
        "deviceID": "354385080046177",
        "commcare_version": "2.35.3",
        "app_build_version": 1913,
        "appVersion": "CommCare Android, version \"2.35.3\"(431724). App v1913. CommCare Version 2.35. Build 431724, built on: 2017-04-19",
        "@xmlns": "http://openrosa.org/jr/xforms"
      },
      "group_id": "de0c06552a6c471daef634553905036e",
      "case": {
        "update": {
          "owner_id": "de0c06552a6c471daef634553905036e",
          "CHW_Name": "Shhhhhhhhhhhhh",
          "CHW_ID": "a032400000GXUFDAA5"
        },
        "@xmlns": "http://commcarehq.org/case/transaction/v2",
        "@user_id": "999368544f4fa1af1e1f42d0e208349c",
        "@date_modified": "2018-07-18T14:26:23.420000Z",
        "@case_id": "ad794303dee24a4189a80ee515bb2dfb"
      },
      "areaid": "tukjowichw",
      "area": "91cdca73b8d423d03e5579d917bd1315",
      "CHW_Name": "Shhhhhhhhhhhhh",
      "CHW_ID": "a032400000GXUFDAA5",
      "@xmlns": "http://openrosa.org/formdesigner/13C1B47D-82E6-4EA8-8E21-F286F1A3AE39",
      "@version": "1911",
      "@uiVersion": "1",
      "@name": "Change Household CHW",
      "#type": "data"
    },
    "edited_on": null,
    "edited_by_user_id": null,
    "domain": "lwala-community-alliance",
    "build_id": "c08011fd07f347efb1a3be2d3b1fa06d",
    "attachments": {
      "form.xml": {
        "url": "https://www.commcarehq.org/a/lwala-community-alliance/api/form/attachment/469351d5-2bb6-48e6-a4ad-39eba54961a9/form.xml",
        "length": 1445,
        "content_type": "text/xml"
      }
    },
    "archived": false,
    "app_id": "fc491785fa909e85fbdb63a9b346fa6c",
    "__query_params": {
      "app_id": "fc491785fa909e85fbdb63a9b346fa6c"
    }
  },
  "configuration": {
    "loginUrl": "https://test.salesforce.com/",
    "password": "No way, dude!",
    "username": "will@lwalacommunityalliance.org.veraist",
    "securityToken": "shhhhhhhhh!!!!"
  }
}
```
