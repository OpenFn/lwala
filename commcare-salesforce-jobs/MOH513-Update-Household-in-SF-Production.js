//MOH513 Update Household Form
alterState((state) =>{
  function titleCase(str) {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
   }
   return splitStr.join(' ');
 }
  return state;
});
//Upserting Household, checks if Household exists via MOH Household Code
upsert("Household__c", "CommCare_Code__c",fields(
  field("MOH_household_code__c", dataValue("form.moh_code")),
  field("CommCare_Code__c",dataValue("form.case.@case_id")),
  field("Source__c", 1),
  field("Household_CHW__c",dataValue("form.chw")), //CONFIRM IDs MATCH PRODUCTION
  //field("Household_CHW__c", "a031x000002S9lm"), //HARDCODED FOR SANDBOX TESTING --> To replace with line above
  //relationship("Catchment__r","Name", dataValue("form.catchment")),// not needed for update HH
  //field("Area__c", dataValue("form.area")),
  //field("Household_village__c", dataValue("form.village")),
  field("Deaths_in_the_last_6_months__c", (state)=>{
    var death = dataValue("form.Household_Information.deaths_in_past_6_months")(state)
    return (death > 0 ? "Yes" : "No");
  }),
  field("Active_Household__c", (state)=>{
    var status = dataValue("form.Household_Status")(state)
    return (status=="Yes"? true : false);
  }),
  field("Inactive_Reason__c", (state)=>{
    var reason = dataValue("form.Reason_for_Inactive")(state)
    return (reason!==undefined ? reason : null);
  }),
  field("Access_to_safe_water__c", dataValue("form.Household_Information.Safe_Water")),
  field("Treats_Drinking_Water__c", dataValue("form.Household_Information.Treats_Drinking_Water")),
  field("Tippy_Tap__c", dataValue("form.Household_Information.Active_Handwashing_Station")),
  field("Pit_Latrine__c", dataValue("form.Household_Information.Functional_Latrine")),
  field("Rubbish_Pit__c", dataValue("form.Household_Information.Rubbish_Pit")),
  field("Drying_Rack__c", dataValue("form.Household_Information.Drying_Rack")),
  field("Kitchen_Garden__c", dataValue("form.Household_Information.Kitchen_Garden")),
  field("Cookstove__c", dataValue("form.Household_Information.Improved_Cooking_Method")),
  field("Clothe__c", dataValue("form.Household_Information.Clothesline")),
  field("WASH_Trained__c", dataValue("form.Household_Information.WASH_Trained")),
  field("Uses_ITNs__c", dataValue("form.Household_Information.ITNs")),
  field("Total_household_people__c", dataValue("form.Total_Number_of_Members"))
)),
upsert("Visit__c", "CommCare_Visit_ID__c", fields(
  field("CommCare_Visit_ID__c", dataValue("id")),
  relationship("Household__r","CommCare_Code__c",dataValue("form.case.@case_id")),
  field("Date__c",dataValue("form.metadata.timeEnd")),
  //field("Household_CHW__c", "a031x000002S9lm"), //Hardcoded for sandbox testing
  field("Household_CHW__c",dataValue("form.chw")),
  field("Name", "CHW Visit"),
  field("Supervisor_Visit__c",(state)=>{
    var visit = dataValue("form.supervisor_visit")(state)
    if(visit!==undefined){
      visit = visit.toString().replace(/ /g,";");
      return visit.toString().replace(/_/g," ");
    }
  })
  /*,
  field("Location__latitude__s", (state)=>{
    var lat = state.data.metadata.location[`#text`];
    //lat = lat.substring(0, lat.indexOf(" "));
    return (lat!==null && lat!==undefined ? lat.substring(0, lat.indexOf(" ")) : null);
  }),
 field("Location__longitude__s", (state)=>{
    var long = state.data.metadata.location[`#text`];
    //long = long.substring(long.indexOf(" ")+1, long.indexOf(" ")+7);
    return (long!==null && long!==undefined ? long.substring(long.indexOf(" ")+1, long.indexOf(" ")+7) : null);
  })*/
));
