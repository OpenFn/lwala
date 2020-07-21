# Lwala CommCare SIMBA Connection

(Some project description here...)

*N.B. Any commits to the `master` branch will be automatically deployed to
Lwala's OpenFn project*

## Jobs
...

## Training Notes

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
