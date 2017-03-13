console.log('Work.js Initiated')
/**********************************************
 * Variable object to non-globalize functions *
 * @type {Object}                             *
 **********************************************/
var jr_key = {
  keystrokeCount: 0,
  currentPage: 0,
  apiKey: 'nt-qNa0ZdNPonR-ocAUj8A4R1A-hLLL-',
  URL: 'https://api.mlab.com/api/1/databases/keystroke/collections/',
  data: {
    "_id": null,
    "user": null,
    "keystrokes": {
      "p1": {
        "KeyEvents": []
      },
      "p2": {
        "KeyEvents": []
      },
      "p3": {
        "KeyEvents": []
      },
      "p4": {
        "KeyEvents": []
      },
      "p5": {
        "KeyEvents": []
      },
      "p6": {
        "KeyEvents": []
      }
    },
    "realResponse": {
      "p1": "",
      "p2": "",
      "p3": "",
      "p4": "",
      "p5": "",
      "p6": ""
    },
    "ratings": {
      "p3": null,
      "p4": null
    }
  },

  /*****************************************************************
   * Logs keystroke data to data object                            *
   * @return {void} void                                           *
   *****************************************************************/
  recordData: function (e) {
    jr_key.data.keystrokes[jr_key.currentPage].KeyEvents.push(e);
  },

  /*****************************************************************
   * Uploads the pdf data to the mongoDB Database                  *
   * @return {void} void                                           *
   *****************************************************************/
  uploadPDF: function (data) {

    console.log('upload Started');
    var DATA = "";
    var URL = jr_key.URL + 'pdf?apiKey=' + jr_key.apiKey;
    var callback = function () {
      console.log('upload finished');
      self.postMessage(['pdf_done', jr_key.data.user]);
    }
    var file = new File([data], jr_key.data.user + '.pdf');
    var reader = new FileReader();
    reader.onload = function (data) {
      DATA = data.target.result;
      jr_key.sendRequest(URL, "POST", {
        "_id": jr_key.data.user + "-PDF",
        "pdf": DATA
      }, callback);
    }
    reader.readAsText(file);

  },

  /*****************************************************************
   * Uploads the data to the mongoDB Database                      *
   * @return {void} void                                           *
   *****************************************************************/
  uploadData: function () {
    console.log('upload Started');

    var callback = function () {
      console.log('Upload Finished');
      self.postMessage(['upload']);
    }
    var URL = jr_key.URL + 'gather-data?apiKey=' + jr_key.apiKey;

    jr_key.sendRequest(URL, "POST", jr_key.data, callback);
  },

  /*****************************************************************
   * Updatates the data to the mongoDB Database                    *
   * @return {void} void                                           *
   *****************************************************************/
  updateData: function () {
    console.log('upload Started');

    var callback = function () {
      console.log('Upload Finished');
      self.postMessage(['uploadPage']);
    }
    var URL = jr_key.URL + 'gather-data?apiKey=' + jr_key.apiKey + '&q={"_id":' + jr_key.data._id + '}';
    var currentPage =  "keystrokes.p" + jr_key.currentPage;
    var DATA = JSON.stringify( { "$set": { currentPage: jr_key.data[currentPage]}})
    jr_key.sendRequest(URL, "PUT", DATA, callback);
  },

  /****************************************************************
   * Creates a new session id for the data being collected        *
   * @param e.data[1] == id {String}                              *
   * @param e.data[2] == user {String}                            *
   ****************************************************************/
  sendRequest: function (url, type, data, callback) {
    //console.log([url, type, data, callback]);
    var request = new XMLHttpRequest();
    request.open("POST", url);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = callback;
    request.send(JSON.stringify(data));
  }
}

/******************************************************************
 * Function switchboard that listens for input from the           *
 * keystroke.js file and pipes the request to the right function  *
 * @type {switchboard}                                            *
 ******************************************************************/

self.addEventListener('message', function (e) {

  switch (e.data[0]) {

    /**************************************************************
     * Creates a new session id for the data being collected      *
     * @param e.data[1] == id {String}                            *
     * @param e.data[2] == user {String}                          *
     **************************************************************/
    case 'createSession':
      jr_key.data._id = e.data[1];
      jr_key.data.user = e.data[2];
      jr_key.uploadData("POST");
      break;

      /**************************************************************
       * Starts collecting data into a different data object        *
       * @param e.data[0] == 'newPage'                              *
       * @param e.data[1] == currentPage {Integer}                  *
       **************************************************************/
    case 'newPage':
      jr_key.currentPage = "p" + e.data[1];
      break;

      /**************************************************************
       * Calls an upload function to upload the pdf blob as a string*
       * @param e.data[1] == pdf {Blob}                             *
       **************************************************************/
    case 'pdf':
      jr_key.uploadPDF(e.data[1]);
      break;

      /**************************************************************
       * Gathers the keystroke data and pushes it to the data node  *
       * @param e.data[1] == event {event}                          *
       **************************************************************/
    case 'key':
      jr_key.recordData(e.data[1]);
      break;

      /**************************************************************
       * Sets the rating given to the page with a rating aspect     *
       **************************************************************/
    case 'rating':
      jr_key.data.ratings[jr_key.currentPage] = e.data[1];
      break;

      /**************************************************************
       * Calls the upload function to upload the data captured      *
       **************************************************************/
    case 'upload':
    console.log('upload rad');
      break;

      /**************************************************************
       * Gets the real typed value of each page and logs it in data *
       **************************************************************/
    case 'realText':
      jr_key.data.realResponse[jr_key.currentPage] = e.data[1];
      jr_key.updateData();
      break;

      /**************************************************************
       * Logs to the console the contents of work.js -> jr_key      *
       **************************************************************/
    case 'log':
      console.log(jr_key);
      break;
  }
});