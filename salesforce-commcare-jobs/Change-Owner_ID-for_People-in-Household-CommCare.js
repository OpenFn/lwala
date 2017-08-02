submit(
  fields(
    field("@", function(state) {
      return {
        "xmlns:jrm":"http://dev.commcarehq.org/jr/xforms", 
        "xmlns":"http://openrosa.org/formdesigner/a34af027a7fa943998c39f64bc84a337a668114a",
        "uiVersion":"1",
        "version":"81",
        "name":"Update Person"
      };
    }),
    field("Source",0),
    field("owner_id",dataValue("newCHW")),
    field("n0:case", function(state){
      return{
        "@": {
          "case_id": dataValue("id")(state),
          "date_modified": new Date().toISOString(),
          "user_id": "e298884bfb6ee2d2b38591a6e8ae0228",
          "xmlns:n0": "http://commcarehq.org/case/transaction/v2"
        },
        "n0:update":{
          "n0:owner_id":dataValue("newCHW")(state)
        }
      }
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
)// Your job goes here.