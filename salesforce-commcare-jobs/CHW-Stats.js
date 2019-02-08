submit(
  fields(
    field("@",function(state){
      return {
        "xmlns:jrm":"http://dev.commcarehq.org/jr/xforms", 
        "xmlns":"http://openrosa.org/formdesigner/D5DBBBDF-8873-46D6-BB86-997838C3BFBA",
        "uiVersion":"1",
        "version":"554"
      };
    }),
    field("total_active_householdsq", dataValue("new.Total_Active_Households__c")),
    field("total_tt5_childrenq", dataValue("new.Total_TT5_Children__c")),
    field("wash_compliant_householdsq", dataValue("new.WASH_Compliant_Households__c")),
    field("monthly_reachq", dataValue("new.Monthly_Reach__c")),
    field("fully_immunized_tt5_childrenq", dataValue("new.Fully_Immunized_TT5_Children__c")),
    field("n0:case", function(state){
      return{
        
          "@":{
            "xmlns:n0": "http://commcarehq.org/case/transaction/v2",
            "case_id": dataValue("new.Id")(state),
            "date_modified": new Date().toISOString(),
            "user_id": "e298884bfb6ee2d2b38591a6e8ae0228"
          },
          "n0:update":{
            "n0:total_active_households": dataValue("new.Total_Active_Households__c")(state),
            "n0:total_tt5_children": dataValue("new.Total_TT5_Children__c")(state),
            "n0:wash_compliant_households": dataValue("new.WASH_Compliant_Households__c")(state),
            "n0:monthly_reach": dataValue("new.Monthly_Reach__c")(state),
            "n0:fully_immunized_tt5_children": dataValue("new.Fully_Immunized_TT5_Children__c")(state)
          }
        };
    }),
    field("n1:meta",function(state){
      return{
        "@": {"xmlns:n1": "http://openrosa.org/jr/xforms"},
        "n1:deviceID": "Formplayer",
        "n1:timeStart": new Date().toISOString(),
        "n1:timeEnd": new Date().toISOString(),
        "n1:userID": "e298884bfb6ee2d2b38591a6e8ae0228"
      };
    })
  )
);
