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
            "n0:Total_Active_Households": dataValue("new.Total_Active_Households__c")(state),
            "n0:Total_TT5_Children": dataValue("new.Total_TT5_Children__c")(state),
            "n0:WASH_Compliant_Households": dataValue("new.WASH_Compliant_Households__c")(state),
            "n0:Monthly_Reach": dataValue("new.Total_Monthly_Visits__c")(state),
            "n0:Fully_Immunized_TT5_Children": dataValue("new.Fully_Immunized_TT5_Children__c")(state),
            "n0:Skilled_Deliveries": dataValue("new.Skilled_Deliveries__c")(state),
            "n0:Home_Deliveries": dataValue("new.Home_Deliveries__c")(state),
            "n0:Deliveries_Under_4_ANCs": dataValue("new.Deliveries_Under_4_ANCs__c")(state),
            "n0:Total_Contraception_Distributed": dataValue("new.Total_Contraception_Distributed__c")(state),
            "n0:Total_Difficult_Clients": dataValue("new.Total_Difficult_Clients__c")(state),
            "n0:Total_Pregnant_Mothers": dataValue("new.Total_Pregnant_Mothers__c")(state),
            
            
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
