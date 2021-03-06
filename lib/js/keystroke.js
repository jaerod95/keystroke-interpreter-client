var jr_key = {
    apiKey: 'nt-qNa0ZdNPonR-ocAUj8A4R1A-hLLL-',
    URL: 'https://api.mlab.com/api/1/databases/keystroke-data/collections/',
    login: {},
    users: [],
    w: null,
    pages: [1, 2, 3, 4, 5, 6],
    currentPage: 0,

    /*********************************************************
     * API Request to get login data from database           *
     * @returns {void}                                       *
     *********************************************************/
    init: function () {
        //console.log('init ran');
        document.body.innerHTML = jr_key.p0;
        jr_key.getUsers();

        jr_key.w.addEventListener('message', function (e) {
            switch (e.data[0]) {
                case "upload":
                    console.log("inital Upload Finished");
                    break;
                case "pdf_done":
                    document.body.style.cursor = "auto";
                    jr_key.initStroke(e.data[1]);
                    break;
                case "pageUpload":
                    console.log('uploaded page successfully');
                    break;
                case "final_upload":
                    document.body.innerHTML = jr_key.p7b;
                    document.body.style.cursor = "auto";
                    break;
            }
        });
    },

    /*********************************************************
     * Gathers all the login users from databases            *
     * @returns {void}                                       *
     *********************************************************/
    getUsers: function () {
        var usersObject = [];
        $.ajax({
            url: jr_key.URL + 'users?apiKey=' + jr_key.apiKey,
            type: "GET",
            success: function (response) {
                response.forEach( function (val, num, arr) {
                    var userData = {};
                    userData["user"] = response[num]._id;
                    userData["pass"] = response[num].pass;
                    usersObject.push(userData);
                });
            },
            error: function (data, response, err) {
                console.log(data);
                return null;
            },
            complete: function() {
                console.log('get Users finished');
                jr_key.users = usersObject;
            }
        });
    },


    /*********************************************************
     * Authenticates the user credentials by checking them   *
     * across the login data retreived from the database     *
     * @returns {void}                                       *
     *********************************************************/
    authenticate: function (e) {
        //console.log('authenticate ran');
        var user = $("#login-user").val();
        var pass = $("#login-pass").val();
        if (user == "" || pass == "") {
            alert('please fill out all the boxes');
        } else {
            var found = false;
            jr_key.users.forEach(function (element) {
                if (element.user === user && element.pass === pass) {
                    jr_key.w.postMessage(['createSession', user + '-' + Date.now(), user]);
                    jr_key.pdf(user);
                    found = true;
                }
            });
            if (!found) jr_key.loginErr('login');
        }
    },

    /***************************************************************
     * Checks for user in the database and creates it if not found *
     * @returns {void}                                             *
     ***************************************************************/
    createUser: function (e) {

        //console.log('createUser ran');
        var name = $("#create-name").val();
        var user = $("#create-user").val();
        var pass = $("#create-pass").val();
        if (name == "" || user == "" || pass == "") {
            alert('please fill out all the boxes');
        } else {
            var found = false;
            if (jr_key.users == []) {
                setTimeout(jr_key.createUser, 1000);
                return;
            }
            jr_key.users.forEach(function (element) {
                if (element.user === user) {
                    jr_key.loginErr('create');
                    found = true;
                }
            });
            if (!found) {
                var newLoginData = { "_id": user, "Name": name, "pass": pass }

                $.ajax({
                    url: jr_key.URL + 'users?apiKey=' + jr_key.apiKey,
                    type: "POST",
                    data: JSON.stringify(newLoginData),
                    contentType: 'application/json',
                    success: function (response) {
                        console.log('upload new user successful');
                        jr_key.w.postMessage(['createSession', user + '-' + Date.now(), user]);
                        jr_key.pdf(user);
                    },
                    error: function (data, response, err) {
                        console.log(data);
                    }
                });
            }
        }
    },

    pdf: function (user) {
        document.body.setAttribute('user', user);
        document.body.innerHTML = jr_key.pForm + '<p style="display: none;" id="pdf_user">' + user + '</p>';
        document.getElementById('logged_in_as').innerHTML = user;

        Date.prototype.toDateInputValue = (function () {
            var local = new Date(this);
            local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
            return local.toJSON().slice(0, 10);
        });

        $('#jr_pdf_date').val(new Date().toDateInputValue());
    },

    createPDF: function () {
        document.body.style.cursor = "wait";
        document.getElementById("next").style.display = "none";
        var $name = $('#jr_pdf_name');
        var $date = $('#jr_pdf_date');

        if (!$('#jr_pdf_check').prop('checked')) {
            alert('Check the box agreeing to the terms before continuing.');
        } else if (($name.val() == "") || ($date.val() == "")) {
            alert('Fill out the boxes with your full name and date before continuing.');
        } else {
            $name.after('<strong>' + $name.val() + '</strong>');
            $date.after('<strong>' + $date.val() + '</strong>');

            var pdf = new jsPDF();
            var text = document.getElementById('pdf').innerHTML;
            pdf.fromHTML(text, 15, 15, { 'width': 170 });
            var blob = new Blob([pdf.output()], { type: 'application/pdf' });
            jr_key.w.postMessage(['pdf', blob]);

            var user = document.getElementById('pdf_user').innerHTML;
        }
    },

    /***************************************************************
     * FILLER TEXT FILLER TEXT FILLER TEXT FILLER TEXT FILLER TEXT *
     * @returns {void}                                             *
     ***************************************************************/
    loginErr: function (err) {
        switch (err) {
            case "login":
            break;
            default:
            break;
        }
        alert('credentials wrong');
    },

    /***************************************************************
     * FILLER TEXT FILLER TEXT FILLER TEXT FILLER TEXT FILLER TEXT *
     * @returns {void}                                             *
     ***************************************************************/
    initStroke: function (user) {
        document.body.setAttribute('user', user);
        jr_key.randomlyLoadPage();
        document.addEventListener('keydown', jr_key.keyEvent);
        document.addEventListener('keyup', jr_key.keyEvent);
    },

    difficulty_data: function (e) {
        //console.log(e);
        if (e == "") {
            alert('Please select a difficulty level.');
        } else {
            jr_key.w.postMessage(['rating', e]);
            jr_key.randomlyLoadPage();
        }
    },

    /***************************************************************
     * FILLER TEXT FILLER TEXT FILLER TEXT FILLER TEXT FILLER TEXT *
     * @returns {void}                                             *
     ***************************************************************/
    keyEvent: function (e) {

        var data = {
            altKey: e.altKey,
            bubbles: e.bubbles,
            cancelBubble: e.cancelBubble,
            cancelable: e.cancelable,
            charCode: e.charCode,
            code: e.code,
            composed: e.composed,
            ctrlKey: e.ctrlKey,
            defaultPrevented: e.defaultPrevented,
            detail: e.detail,
            eventPhase: e.eventPhase,
            isComposing: e.isComposing,
            isTrusted: e.isTrusted,
            key: e.key,
            keyCode: e.keyCode,
            location: e.location,
            metaKey: e.metaKey,
            repeat: e.repeat,
            returnValue: e.returnValue,
            shiftKey: e.shiftKey,
            target: e.target.localName + '#' + e.target.id + '.' + e.target.class,
            timeStamp: e.timeStamp,
            localTimeStamp: Date.now(),
            type: e.type,
            which: e.which
        };
        //console.log(data); uncomment this to be able to see each key event
        jr_key.w.postMessage(['key', data]);
    },

    loadPage: function (page) {
        try {
            jr_key.w.postMessage(['realText', document.getElementById('textarea').value]);
        } catch (e) {
            //console.log('not a text place');
        }
        switch (page) {
            case "p3b":
                document.body.innerHTML = jr_key.p3b;
                break;
            case "p4b":
                if (document.getElementById('p4_word_count').innerHTML >= 150)
                    document.body.innerHTML = jr_key.p4b;
                else
                    alert('Notice: Your response must be at least 150 words.');
                break;
            case "p5b":
                document.body.innerHTML = jr_key.p5b;
                break;
            case "p5c":
                document.body.innerHTML = jr_key.p5c;
                break;
            case "p6b":
                document.body.innerHTML = jr_key.p6b;
                break;
            case "p6c":
                document.body.innerHTML = jr_key.p6c;
                break;
            default:
                console.error('loadPage Function threw an error');
                break;
        }
        document.getElementById('logged_in_as').innerHTML = document.body.getAttribute('user');
    },

    /***************************************************************
     * FILLER TEXT FILLER TEXT FILLER TEXT FILLER TEXT FILLER TEXT *
     * @returns {void}                                             *
     ***************************************************************/
    randomlyLoadPage: function () {
        try {
            jr_key.w.postMessage(['realText', document.getElementById('textarea').value]);
        } catch (e) {
            //console.log('not a text place');
        }
        if (jr_key.pages.length == 0) jr_key.finish();
        else {
            jr_key.currentPage = jr_key.pages[Math.round((Math.random() * Date.now())) % jr_key.pages.length];
            jr_key.pages.splice(jr_key.pages.indexOf(jr_key.currentPage), 1);
            switch (jr_key.currentPage) {
                case 1:
                    document.body.innerHTML = jr_key.p1;
                    break;
                case 2:
                    document.body.innerHTML = jr_key.p2;
                    break;
                case 3:
                    document.body.innerHTML = jr_key.p3;
                    break;
                case 4:
                    document.body.innerHTML = jr_key.p4;
                    document.getElementById('textarea').addEventListener('keyup', function (e) {
                        var words = this.value.match(/\S+/g).length;
                        document.getElementById('p4_word_count').innerHTML = words;
                    });
                    break;
                case 5:
                    document.body.innerHTML = jr_key.p5;
                    break;
                case 6:
                    document.body.innerHTML = jr_key.p6;
                    break;
                default:
                    console.error('loadPageRandomly Function threw an error');
                    break;
            }
            document.getElementById('logged_in_as').innerHTML = document.body.getAttribute('user');
            jr_key.w.postMessage(['newPage', jr_key.currentPage])
        }
    },

    /***************************************************************
     * FILLER TEXT FILLER TEXT FILLER TEXT FILLER TEXT FILLER TEXT *
     * @returns {void}                                             *
     ***************************************************************/
    finish: function () {
        document.body.style.cursor = "wait";
        document.getElementById('logged_in_as').innerHTML = document.body.getAttribute('user');
        document.removeEventListener('keydown', jr_key.keyEvent);
        document.removeEventListener('keyup', jr_key.keyEvent);
        //console.log('finish ran');

        jr_key.w.postMessage(['upload']);
    },

    pForm: `
    <div id="pdf" class="jr_pdf jr_content_page">
        <h1>Consent Form for Data Gathering</h1>
        <p>My name is Jay Young and I am a PhD student at BYU collecting typing information for my dissertation. I am studying in the Instructional Psychology and Technology (IP&amp;T) program in the McKay School of Education and am working with my chair, Dr. Randy Davies, Associate Professor.</p>
        
        <p>You are being invited to take part in a research study of keystroke analysis. The purpose of this study is to explore whether keystroke dynamics is a viable solution to user authentication in online assessment. You must be able to type normally to take part in this study.  You may withdraw or refuse to participate at any time.</p>

        <p><strong>What we will ask you to do:</strong> If you agree to be in this study, we will have you type out answers to six questions on your PC or laptop.  These questions will ask you to perform various non-strenuous typing tasks.  The questions will include two opportunities to type out paragraphs of text, two opportunities to type out thoughtful replies, and two opportunities to type with a small implement on your finger(s). The typing task will take no longer than 30 minutes to complete and more like 10-15 minutes. </p>

        <p><strong>Risks and benefits:</strong>  your participation will involve only minimal risk specifically in the amount of typing you are asked to complete and the time it takes to provide these responses.</p>

        <p>There are no direct benefits to you for your participation. However, it will help us better understand how keystroke dynamics might improve authentication processes in online education and understanding student typing in various scenarios will hopefully yield a better understanding who is performing the typing tasks. </p>

        <p><strong>Compensation:</strong> There is no compensation for your participation in the data collection</p>

        <p><strong>The data you provide will be de-identified and completely confidential.</strong> The records of this study will be kept private. All results we make public we will not include any information that will make it possible to identify individuals. Research records will be kept in secure database; only the researchers will have access to the records.</p>

        <p><strong>Taking part in this study is voluntary.</strong> You may skip any questions that you do not want to answer. If you decide not to take part or to skip some of the questions, it will not affect your current or future relationship with BYU, your class standing, or Dr. Jenkins. If you decide to take part, you are free to withdraw at any time.</p>

        <p><strong>If you have questions:</strong> The researchers conducting this study are Jay Young, a doctoral student in the Instructional Psychology and Technology department at BYU. Please ask any questions you have now. If you have questions later, you may contact Jay Young at <a href="mailto:jay.young@byu.edu">jay.young@byu.edu</a> or at 801-592-0518.  If you have any questions or concerns regarding your rights as a subject in this study, you may contact the Institutional Review Board (IRB) at 801-422-1461, or email them <a href="mailto:irb@byu.edu">irb@byu.edu</a>. You may save a copy of this form to keep for your records.</p>

        <p><strong>Statement of Consent:</strong> I have read the above information, and have received answers to any questions I asked. I consent to take part in the study.</p>

        <p id="jr_pdf_check_text">Check the box and sign below to accept these terms:</p><input type="checkbox" id="jr_pdf_check">
        <p>Your Digital Signature</p><p>Type your full name: </p><input type="text" id="jr_pdf_name"><p>Date:</p><input type="date" id="jr_pdf_date" placeholder="mm/dd/yyyy">

<p>This consent form will be kept by the researcher for at least three years beyond the end of the study.
</p>
    <button id="next" onclick="jr_key.createPDF();">Next</button>
    </div>
    <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`,

    p0: `<div v-html="page_content" id="app">
        <div class="jr_login">
            <div class="input_block">
            <p style="text-align: justify; font-size: 14px;">If this is your first time at this portal, please create a new account.  If you have already created an account, login using your login credentials.</p>
                <h1 class="center">Login</h1>
                <form action="javascript:jr_key.authenticate()">
                <p>Net ID </p><input type="text" name="netID" id="login-user" value="">
                <p>Student ID #</p><input type="password" id="login-pass" value="">
                <div class="center_div">
                    <input type="submit" class="submit">
                </div>
                </form>
            </div>
            <hr>
            <div class="input_block">
                <h1 class="center">Create new Account</h1>
                <form action="javascript:jr_key.createUser()">
                <p>Full Name</p><input type="text" name="full_name" id="create-name">
                <p>Net ID </p><input type="text" name="netID" id="create-user"> (this will be your username)
                <p>Student ID #</p><input type="password" id="create-pass"> (This will be your password)
                <div class="center_div">
                    <input type="submit" class="submit">
                </div>
                </form>
            </div>
        </div>
</div>`,

    p0b: `<div class="jr_login">
    <h1>Uploading your login details. (This will take a second).</h1>
    </div>`,

    p1: `<div class="jr_content_page">
            <h1>Helen Keller Introduction</h1>
            <h2> Instructions: </h2>
            <h3>Please type out the following paragraph using your computer keyboard in the window below:</h3>
            <p>"It is with a kind of fear that I begin to write the history of my life.  I have, as it were, as superstitious hesitation in lifting the veil that clings about my childhood like a golden mist. The task of writing an autobiography is a difficult one.  When I try to classify my earliest impressions, I find that fact and fancy look alike across the years that link the past with the present.  The woman paints the child's experiences in her own fantasy.  A few impressions stand out vividly from the first years of my life; but "the shadows of the prison-house are on the rest." Besides, many of the joys and sorrows of childhood have lost their poignancy; and many incidents of vital importance in my early education have been forgotten in the excitement of great discoveries.  In order, therefore, not to be tedious I shall try to present in a series of sketches only the episodes that seem to me to be the most interesting and important. (Keller, 1904, p. 3)"</p>
            <textarea id="textarea" class="textarea"></textarea>
            <button onclick="jr_key.randomlyLoadPage()">Next</button>
        </div>
        <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`,

    p2: `<div class="jr_content_page">
            <h1>Helen Keller Conclusion</h1>
            <h2> Instructions: </h2>
            <h3>Please type out the following paragraph using your computer keyboard in the window below:</h3>
            <p>"Often when I dream, thoughts pass through my mind like cowled shadows, silent and remote, and disappear.  Perhaps they are the ghosts of thoughts that once inhabited the mind of an ancestor.  At other times, the things I have learned and the things I have been taught, drop away, as the lizard sheds its skin, and I see my soul as God sees it.  There are also rare and beautiful moments when I see and hear in Dreamland.  What if in my waking hours a sound should ring through the silent halls of hearing? What if a ray of light should flash through the darkened chambers of my soul? What would happen, I ask many and many a time.  Would the bow-and-string tension of life snap?  Would the heart, overweighted with sudden joy, stop beating for very  excess of happiness? (Keller, 1904, p. 431)"</p>
            <textarea id="textarea" class="textarea"></textarea>
            <button onclick="jr_key.randomlyLoadPage()">Next</button>
        </div>
        <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`,

    p3: `<div class="jr_content_page">
            <h1> Creativity Quiz </h1>
            <h2> Instructions: </h2>
            <h3>There are over 100 alternative creative ways to use paper clips from their intended usage.  How many creative ideas for the use of a paperclip can you come up with on your own without any help from outside resources?  Please type your ideas out in the space provided below.</h3>
            <textarea id="textarea" class="textarea"></textarea>
            <button onclick="jr_key.loadPage('p3b')">Next</button>
        </div>
        <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`,

    p3b: `<div class="jr_content_page">
        <form class="jr_rating_form">
        <p>On a scale from one to five, how difficult was the previous activity?</p>
        <div>
        (very easy) <input type="radio" name="difficult" value="1">1
        <input type="radio" name="difficult" value="2">2
        <input type="radio" name="difficult" value="3">3
        <input type="radio" name="difficult" value="4">4
        <input type="radio" name="difficult" value="5">5 (very hard)
        </div>
    </form>
    <button onclick="jr_key.difficulty_data(document.querySelector('form').elements.difficult.value)">Next</button>
    </div>
    <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`,

    p4: `<div class="jr_content_page">
            <h1> Deep Thought Short Essay </h1>
            <h2> Instructions: </h2>
            <h3> In at least 150 words, type out your own answer to the question, "what is intelligence?" Please include specific examples in your answer. Provide your answer in the space below. </h3>
            <textarea id="textarea" class="textarea"></textarea>
            <p>Word Count: <span id="p4_word_count">0</span>
            <button onclick="jr_key.loadPage('p4b')">Next</button>
        </div>
        <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`,

    p4b: `<div class="jr_content_page">
        <form class="jr_rating_form">
        <p>On a scale from one to five, how difficult was the previous activity?</p>
        <div>
        (very easy) <input type="radio" name="difficult" value="1">1
        <input type="radio" name="difficult" value="2">2
        <input type="radio" name="difficult" value="3">3
        <input type="radio" name="difficult" value="4">4
        <input type="radio" name="difficult" value="5">5 (very hard)
        </div>
    </form>
    <button onclick="jr_key.difficulty_data(document.querySelector('form').elements.difficult.value)">Next</button>
    </div>
    <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`,

    p5: `<div class="jr_content_page">
            <h1> Band Aid Paragraph </h1>
            <h2> Instructions: </h2>
            <h3>Take the Band-Aid provided to you wrap the Band-Aid around the tip of your index finger on your right hand as seen in the image. After applying the Band-Aid to your finger, press the next button at the bottom of the page.</h3>
            <img src="./lib/img/finger.jpg"/>
            <button onclick="jr_key.loadPage('p5b')">Next</button>
        </div>
        <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`,

    p5b: `<div class="jr_content_page">
            <h1> Band Aid Paragraph </h1>
            <h2> Instructions: </h2>
            <h3>With the Band Aid on your finger, please type out the following paragraph using your computer keyboard in the window below:</h3>
            <p>"Four score and seven years ago our fathers brought forth, upon this continent, a new nation, conceived in liberty, and dedicated to the proposition that "all men are created equal." Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived, and so dedicated, can long endure. We are met on a great battle field of that war. We come to dedicate a portion of it, as a final resting place for those who died here, that the nation might live. This we may, in all propriety do (Lincoln, 1863)"</p>
            <textarea id="textarea" class="textarea"></textarea>
            <button onclick="jr_key.loadPage('p6c')">Next</button>
        </div>
        <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`,

    p5c: `<div class="jr_content_page">
                <h1> Band Aid Paragraph Paragraph </h1>
                <h3>Remove the Band-Aid from your finger then press the next button on the bottom of the box.</h3>
        <button onclick="jr_key.randomlyLoadPage()">Next</button>
            </div>
            <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`,

    p6: `<div class="jr_content_page">
                <h1> Tape Paragraph </h1>
                <h2> Instructions: </h2>
                <h3>Take the tape provided to you, wrap the middle and ring finger on your left hand together as shown in the image below and then click on the next button at the bottom of the page.</h3>
                <img src="./lib/img/two_fingers.jpg"/>
                <button onclick="jr_key.loadPage('p6b')">Next</button>
            </div>
            <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`,

    p6b: `<div class="jr_content_page">
                <h1> Tape Paragraph </h1>
                <h2> Instructions: </h2>
                <h3>With your fingers wrapped, please type out the following paragraph using your computer keyboard in the window below:</h3>
                <p>"But, in a larger sense, we cannot dedicate - we cannot consecrate - we cannot hallow, this ground - The brave men, living and dead, who struggled here, have hallowed it, far above our poor power to add or detract. The world will little note, nor long remember what we say here; while it can never forget what they did here. It is rather for us, the living, we here be dedicated to the great task remaining before us - that, from these honored dead we take increased devotion to that cause for which they here, gave the last full measure of devotion - that we here highly resolve these dead shall not have died in vain; that the nation, shall have a new birth of freedom, and that government of the people, by the people, for the people, shall not perish from the earth (Lincoln, 1863)"</p>
                <textarea id="textarea" class="textarea"></textarea>
                <button onclick="jr_key.loadPage('p6c')">Next</button>
            </div>
            <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`,

    p6c: `<div class="jr_content_page">
                <h1> Tape Paragraph </h1>
                <h3>Remove the tape from your fingers then press the next button on the bottom of the box.</h3>
        <button onclick="jr_key.randomlyLoadPage()">Next</button>
            </div>
            <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`,

    p7: `<div class="jr_content_page"><h1>Uploading your answers (this might take a while: DO NOT CLOSE OUT OF THE BROWSER!).</h1></div>
        <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`,

    p7b: `<div class="jr_content_page"><h1>Thank you for participating in this survey.</h1></div>
        <div class="jr_logged_in"><p>Logged in as: <span id="logged_in_as"></span></p></div>`
}
document.addEventListener('DOMContentLoaded', jr_key.init) 

var workjs = new Blob([
  `console.log('Work.js Initiated')
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
    var URL = jr_key.URL + 'gathered-data?apiKey=' + jr_key.apiKey;

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
    var data = JSON.stringify(jr_key.data.keystrokes[jr_key.currentPage].KeyEvents);
    var URL = jr_key.URL + 'gathered-data?apiKey=' + jr_key.apiKey + '&q={"_id":"' + jr_key.data._id + '"}';
    var dataString = '{ "$set": {"keystrokes.' + jr_key.currentPage + '.KeyEvents": ' + data + '}}'
    var object = JSON.parse(dataString);
    jr_key.sendRequest(URL, "PUT", object, callback);
  },

    /*****************************************************************
   * Updatates the data to the mongoDB Database                    *
   * @return {void} void                                           *
   *****************************************************************/
  finalUpload: function () {
    console.log('final upload Started');

    var callback = function () {
      console.log('Upload Finished');
      self.postMessage(['final_upload']);
    }
    var responseData = JSON.stringify(jr_key.data.realResponse);
    var ratingData = JSON.stringify(jr_key.data.ratings);
    var URL = jr_key.URL + 'gathered-data?apiKey=' + jr_key.apiKey + '&q={"_id":"' + jr_key.data._id + '"}';
    var dataString = '{ "$set": {"realResponse": ' + responseData + ', "ratings": ' + ratingData + '}}'
    var object = JSON.parse(dataString);
    jr_key.sendRequest(URL, "PUT", object, callback);
  },

  /****************************************************************
   * Creates a new session id for the data being collected        *
   * @param e.data[1] == id {String}                              *
   * @param e.data[2] == user {String}                            *
   ****************************************************************/
  sendRequest: function (url, type, data, callback) {
    console.log([url, type, data, callback]);
    var request = new XMLHttpRequest();
    request.open(type, url);
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
      jr_key.finalUpload();
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
});`]);

// Obtain a blob URL reference to our worker 'file'.
var workjsURL = window.URL.createObjectURL(workjs);
jr_key.w = new Worker(workjsURL);