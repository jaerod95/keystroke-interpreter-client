console.log('Work.js Initiated')
/**********************************************
 * Variable object to non-globalize functions *
 * @type {Object}                             *
 **********************************************/
var jr_key = {
  keystrokeCount: 0,
  currentPage: 0,
  apiKey: 'nt-qNa0ZdNPonR-ocAUj8A4R1A-hLLL-',
  URL: 'https://api.mlab.com/api/1/databases/keystroke-data/collections/',
  data: {
    "_id": null,
    "user": null,
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

  recordData: function (e) {
    jr_key.data[jr_key.currentPage].KeyEvents.push(e);
  },

  uploadPDF: function (data) {

    console.log('upload Started');

    var DATA = "";
    var URL = jr_key.URL + jr_key.data.user + '?apiKey=' + jr_key.apiKey;
    var callback = function () { console.log('upload finished'); self.postMessage(['pdf_done', jr_key.data.user]); }

    var file = new File([data], jr_key.data.user + '.pdf');

    var reader = new FileReader();

    reader.onload = function (data) {
      DATA = data.target.result;
      jr_key.sendRequest(URL, "POST", { "_id": "PDF", "pdf": DATA }, callback);
    }

    reader.readAsText(file);

  },

  /**********************************************
   * Uploads the data to the mongoDB Database   *
   * @return {void} void                        *
   **********************************************/
  uploadData: function () {
    console.log('upload Started');

    var callback = function () { console.log('Upload Finished'); self.postMessage(['upload']); }
    var URL = jr_key.URL + jr_key.data.user + '?apiKey=' + jr_key.apiKey;

    jr_key.sendRequest(URL, "POST", jr_key.data, callback);
  },

  /**************************************************************
   * Creates a new session id for the data being collected      *
   * @param e.data[1] == id {String}                            *
   * @param e.data[2] == user {String}                          *
   **************************************************************/
  sendRequest: function (url, type, data, callback) {
    console.log([url, type, data, callback]);
    var request = new XMLHttpRequest();
    request.open("POST", url);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = callback;
    request.send(JSON.stringify(data));
  }
}

/******************************************************************************
 * Function switchboard that listens for input from the keystroke.js file and *
 * pipes the request to the right function                                    *
 * @type {switchboard}                                                        *
 ******************************************************************************/

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

    case 'rating':
      jr_key.data[jr_key.currentPage]['rating'] = e.data[1];
      break;

    /**************************************************************
     * Calls the upload function to upload the data captured      *
     **************************************************************/
    case 'upload':
      jr_key.uploadData();
      break;

    /**************************************************************
     * Logs to the console the contents of work.js -> jr_key      *
     **************************************************************/
    case 'log':
      console.log(jr_key);
      break;
  }
});