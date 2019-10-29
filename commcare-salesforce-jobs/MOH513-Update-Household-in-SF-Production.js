upsert("Household__c","CommCare_Code__c",fields(
  field("CommCare_Code__c",dataValue("form.case.@case_id")),
  field("MOH_household_code__c", dataValue("form.Household_Information.moh_code")),
  field("Active_Household__c", (state)=>{
    var status = dataValue("form.Household_Status")(state)
    return (status=="Yes"? true : false);
  }),
  field("Inactive_Reason__c", (state)=>{
    var reason = dataValue("form.Reason_for_Inactive")(state)
    return (reason!==undefined ? reason : null);
  }),
  field("Source__c", 1),
  field("Tippy_Tap__c", dataValue("form.Household_Information.Active_Handwashing_Station")),
  field("Clothe__c", dataValue("form.Household_Information.Clothesline")),
  field("Drying_Rack__c", dataValue("form.Household_Information.Drying_Rack")),
  field("Pit_Latrine__c", dataValue("form.Household_Information.Functional_Latrine")),
  field("Cookstove__c", dataValue("form.Household_Information.Improved_Cooking_Method")),
  field("Kitchen_Garden__c", dataValue("form.Household_Information.Kitchen_Garden")),
  field("Rubbish_Pit__c", dataValue("form.Household_Information.Rubbish_Pit")),
  field("Treats_Drinking_Water__c", dataValue("form.Household_Information.Treats_Drinking_Water")),
  field("WASH_Trained__c", dataValue("form.Household_Information.WASH_Trained")),
  field("Uses_ITNs__c", dataValue("form.Household_Information.ITNs")),
  field("Deaths_in_the_last_6_months__c", (state)=>{
    var deaths = dataValue("form.Household_Information.household_deaths.deaths_in_past_6_months")(state);
    return (deaths > 0 ? "Yes" : "No");
  })
)),

upsert("Visit__c","CommCare_Visit_ID__c", fields(
  field("CommCare_Visit_ID__c", dataValue("id")),
  relationship("Household__r","CommCare_Code__c",dataValue("form.case.@case_id")),
  field("Date__c",dataValue("form.metadata.timeEnd")),
  //field("Household_CHW__c", "a031x000002S9lm"),
  field("Household_CHW__c",dataValue("form.chw")),
  field("Name", "CHW Visit"),
  field("Supervisor_Visit__c",(state)=>{
    var visit = dataValue("form.supervisor_visit")(state)
    if(visit!==undefined){
      visit = visit.toString().replace(/ /g,";");
      return visit.toString().replace(/_/g," ");
    }
  })
));
    /*,
    each(
      dataPath("form.Household_Information.household_deaths.deaths[*]"),
      upsert("Person__c","CommCare_ID__c", fields(
        relationship("Household__r", "CommCare_Code__c", state.data.form.case.@case_id),
        field()
      ))
    ),*/
/* } Need separate logic depending on Household_Status?
  else{
    upsert("Household__c","CommCare_Code__c",fields(
      field("CommCare_Code__c",dataValue("form.case.@case_id")),
      field("CommCare_HH_Code__c", dataValue("form.case.@case_id")),
      field("Active_Household__c", false),
      field("Inactive_Reason__c", dataValue("form.Reason_for_Inactive")),
      field("Inactive_Date__c", dataValue("form.Date")),
      field("Deaths_in_the_last_6_months__c", (state)=>{
        var deaths = dataValue("form.Household_Information.household_deaths.deaths_in_past_6_months")(state);
        return (deaths > 0 ? "Yes" : "No");
      })
    )(state),
    create("Visit__c",fields(
      relationship("Household__r","CommCare_Code__c",dataValue("form.case.@case_id")),
      field("Date__c",dataValue("form.Date")),
      field("Catchment__c","a002400000pAcOe"),
      field("Household_CHW__c",dataValue("form.chw")),
      field("Supervisor_Visit__c",(state)=>{
        var visit = dataValue("form.supervisor_visit")(state)
        if(visit!==undefined){
          visit = visit.toString().replace(/ /g,";")
        }
        return visit.toString().replace(/_/g," ");
      })
    ))(state);
 } */
//});
