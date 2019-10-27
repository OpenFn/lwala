submit(
  fields(
    field("@", function(state) {
      return {
        "xmlns:jrm":"http://dev.commcarehq.org/jr/xforms",
        "xmlns":function(){
          return(dataValue("new[0].Catchment__c")(state)=="a001p000017gpfZAAQ" ? "http://openrosa.org/formdesigner/457C806C-B47D-44F0-BE4B-7E88F7162D1D" : "http://openrosa.org/formdesigner/a34af027a7fa943998c39f64bc84a337a668114a");
        },
        "uiVersion":"1",
        "version":"81",
        "name":function(){
          return(dataValue("new[0].Catchment__c")(state)=="a001p000017gpfZAAQ" ? "Update Person MOH" : "Update Person");
        },
      };
    }),
    field("Source",0),
    field("Status", function(state){
      return{
        "Client_Status":dataValue("new[0].Client_Status__c")(state),
        "Date_of_Transfer_Out":dataValue("new[0].Date_of_Transfer_Out__c")(state),
        "Date_Last_Seen":dataValue("new[0].Date_Last_Seen__c")(state),
        "Date_of_Death":dataValue("new[0].Date_of_Death__c")(state),
        "Cause_of_Death":dataValue("new[0].Cause_of_Death__c")(state),
      }
    }),
    field("Basic_Information", function(state){
      return{
        "Basic_Information":{
          "Phone_Number":dataValue("new[0].Telephone__c")(state),
          "Final_Program":function(){
            var program="";
              if(dataValue("new[0].Active_In_Thrive_Thru_5__c")(state)=="Yes"||dataValue("new[0].Active_TT5_Mother__c")(state)=="Yes"){
                if(dataValue("new[0].Active_In_HAWI__c")(state)=="Yes"){
                  program="Both";
                }
                else{
                  program="Thrive_Through_5";
                }
              }
              else{
                if(dataValue("new[0].Active_In_HAWI__c")(state)=="Yes"){
                  program="HAWI";
                }
              }
              return program;
            }
        }
      };
    }),
    field("TT5",function(state){
      return{
        "Child_Information":{
          "ANCs":{

            "ANC_1": dataValue("new[0].ANC_1__c")(state),
            "ANC_2":dataValue("new[0].ANC_2__c")(state),
            "ANC_3":dataValue("new[0].ANC_3__c")(state),
            "ANC_4":dataValue("new[0].ANC_4__c")(state),
            "ANC_5":dataValue("new[0].ANC_5__c")(state),
          },
          "Delivery_Information":{
            "Person_Name":dataValue("new[0].Name")(state),
            "DOB":dataValue("new[0].Date_of_Birth__c")(state),
            "Delivery_Type":function(){
              var val="";
              if(dataValue("new[0].Place_of_Delivery__c")(state)=="Home"){
                val="Unskilled";
              }
              else if(dataValue("new[0].Place_of_Delivery__c")(state)=="Facility"){
                val="Skilled";
              }
              return val;
            },
            "Delivery_Facility":dataValue("new[0].Delivery_Facility__c")(state)
          },
          "Immunizations":{
            "BCG":dataValue("new[0].BCG__c")(state),
            "OPV_0":dataValue("new[0].OPV_0__c")(state),
            "OPV_PCV_Penta_1":dataValue("new[0].OPV_1__c")(state),
            "OPV_PCV_Penta_2":dataValue("new[0].OPV_2__c")(state),
            "OPV_PCV_Penta_3":dataValue("new[0].OPV_3__c")(state),
            "Measles_6":dataValue("new[0].Measles_6__c")(state),
            "Measles_9":dataValue("new[0].Measles_9__c")(state),
            "Measles_18":dataValue("new[0].Measles_18__c")(state),
            "Fully_Immunized":dataValue("new[0].Fully_Immunized_at_12_Months__c")(state)
          }
          /*"CCMM":{
            "Home_Test_Date":dataValue("new[0].Measles_18__c")(state),
            "Home_Test_Date":dataValue("new[0].Measles_18__c")(state),
            "Home_Test_Date":dataValue("new[0].Measles_18__c")(state),
            "Home_Test_Date":dataValue("new[0].Measles_18__c")(state),
            "Home_Test_Date":dataValue("new[0].Measles_18__c")(state),
          }*/

        },
        "Mother_Information":{
          "Pregnant": function(){
            if(dataValue("new[0].Pregnant__c")(state)===true){
              return "Yes";
            }
          }
        }
      };
    }),
    field("HAWI",function(state){
      return{
        "Unique_Patient_Code":dataValue("new[0].Unique_Patient_Code__c")(state),
        "Support_Group":dataValue("new[0].Active_in_Support_Group__c")(state),
        "Preferred_Care_F":{
          "Preferred_Care_Facility":dataValue("new[0].Preferred_Care_Facility__c")(state)
        }
      }

    }),

    field("n0:case", function(state){
      return{

        "@": {
          "case_id": dataValue("new[0].CommCare_ID__c")(state),
          "date_modified": new Date().toISOString(),
          "user_id": "e298884bfb6ee2d2b38591a6e8ae0228",
          "xmlns:n0": "http://commcarehq.org/case/transaction/v2"

        },
        "n0:create":{
          "n0:case_name": function(){
            var name1=dataValue("new[0].Name")(state);
            var name2=name1.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
            return name2;
          },
          "n0:case_type":"Person",
          "n0:parent_id":dataValue("new[0].CommCare_HH_Code__c")(state),
        },
        "n0:update": {
          "n0:ANC_1":dataValue("new[0].ANC_1__c")(state),

          "n0:ANC_2":dataValue("new[0].ANC_2__c")(state),
          "n0:ANC_3":dataValue("new[0].ANC_3__c")(state),
          "n0:ANC_4":dataValue("new[0].ANC_4__c")(state),
          "n0:ANC_5":dataValue("new[0].ANC_5__c")(state),
          "n0:BCG":dataValue("new[0].BCG__c")(state),
          "n0:Fully_Immunized":dataValue("new[0].Fully_Immunized_at_12_Months__c")(state),
          "n0:Delivery_Type":function(){
              var val="";
              if(dataValue("new[0].Place_of_Delivery__c")(state)=="Home"){
                val="Unskilled";
              }
              else if(dataValue("new[0].Place_of_Delivery__c")(state)=="Facility"){
                val="Skilled";
              }
              return val;
          },
          "n0:Delivery_Facility":dataValue("new[0].Delivery_Facility__c")(state),
          "n0:Family_Planning_Method":dataValue("new[0].Family_Planning_Method__c")(state),
          "n0:Child_Status":dataValue("new[0].Child_Status__c")(state),
          "n0:Active_in_OSG_Mentoring":dataValue("new[0].Active_in_OSG__c")(state),
          "n0:OSG_Mentoring_Group":dataValue("new[0].OSG_Group__c")(state),
          "n0:OPV_0":dataValue("new[0].OPV_0__c")(state),
          "n0:OPV_PCV_Penta_1":dataValue("new[0].OPV_1__c")(state),
          "n0:OPV_PCV_Penta_2":dataValue("new[0].OPV_2__c")(state),
          "n0:OPV_PCV_Penta_3":dataValue("new[0].OPV_3__c")(state),
          "n0:Current_Height":dataValue("new[0].Current_Height__c")(state),
          "n0:Current_Weight":dataValue("new[0].Current_Weight__c")(state),
          "n0:Current_MUAC":dataValue("new[0].Current_MUAC__c")(state),
          "n0:Measles_6":dataValue("new[0].Measles_6__c")(state),
          "n0:Measles_9":dataValue("new[0].Measles_9__c")(state),
          "n0:LMP":dataValue("new[0].LMP__c")(state),
          "n0:EDD":dataValue("new[0].EDD__c")(state),
          "n0:Measles_18":dataValue("new[0].Measles_18__c")(state),
          "n0:Pregnant":function(){
              if(dataValue("new[0].Pregnant__c")(state)===true){
                return "Yes";
              }
            },
          "n0:ART": dataValue("new[0].Currently_on_ART_s__c")(state),
          "n0:ARVs": dataValue("new[0].ART_Regimen__c")(state),
          "n0:Active_in_Support_Group": dataValue("new[0].Active_in_Support_Group__c")(state),
          "n0:Client_Program": function(){
            var program='';
            if(dataValue("new[0].Active_in_Thrive_Thru_5__c")(state)=="Yes"||dataValue("new[0].Active_TT5_Mother__c")(state)=="Yes"){
              if(dataValue("new[0].Active_in_HAWI__c")(state)=="Yes"){
                program="Both";
              }
              else{
                program="Thrive_Through_5";
              }
            }
            else{
              if(dataValue("new[0].Active_in_HAWI__c")(state)=="Yes"){
                program="HAWI";
              }
            }
            return program;
          },
          "n0:Currently_on_family_planning": dataValue("new[0].Family_Planning__c")(state),
          "n0:DOB":dataValue("new[0].Date_of_Birth__c")(state),
          "n0:Education_Level":function(){
            if(dataValue("new[0].Education_Level__c")(state)!==undefined){
              return(dataValue("new[0].Education_Level__c")(state).toString().replace(/ /g,"_"));
            }
          },
          "n0:Ever_on_Family_Planning": dataValue("new[0].Ever_on_Family_Planning__c")(state),
          "n0:Gender": dataValue("new[0].Gender__c")(state),
          "n0:Gravida": dataValue("new[0].Gravida__c")(state),
          "n0:Active_in_TT5":dataValue("new[0].Active_in_Thrive_Thru_5__c")(state),
          "n0:Active_in_HAWI":dataValue("new[0].Active_in_HAWI__c")(state),
          "n0:Marital_Status":dataValue("new[0].Marital_Status__c")(state),
          "n0:Exclusive_Breastfeeding":dataValue("new[0].Exclusive_Breastfeeding__c")(state),
          "n0:Next_of_Kin":dataValue("new[0].Next_of_Kin__c")(state),
          "n0:Next_of_Kin_Phone": dataValue("new[0].Next_of_Kin_Phone__c")(state),
          "n0:Parity": dataValue("new[0].Parity__c")(state),

          "n0:Phone_Number": dataValue("new[0].Telephone__c")(state),
          "n0:Preferred_Care_Facility": dataValue("new[0].Preferred_Care_Facility__c")(state),
          "n0:Record_Type": function(){
            return(dataValue("new[0].Record_Type_Name__c")(state).toString().replace(/ /g,"_"));
          },
          "n0:Unique_Patient_Code": dataValue("new[0].Unique_Patient_Code__c")(state),
        },
        "n0:index":{
          "n0:parent":{
            "@":{
              "case_type":"Household",
            },
            "#":dataValue("new[0].CommCare_HH_Code__c")(state)


          }
        }
      };


    }),

    field("n2:meta",function(state){
      return{
        "@": {"xmlns:n2":"http://openrosa.org/jr/xforms"},
        "n2:deviceID": "Formplayer",
        "n2:timeStart": new Date().toISOString(),
        "n2:timeEnd": new Date().toISOString(),
        "n2:userID":"e298884bfb6ee2d2b38591a6e8ae0228"
      };
    })
  )
);
