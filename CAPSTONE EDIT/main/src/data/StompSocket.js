$(document).ready(function () {
    if (window.WebSocket) {
        var client;
        var connectStomp = function () {
            //hardcode these value
            var url = "ws:localhost:61614/stomp";
            var login = "testuser";
            var passcode = "S3CURe!";

            if(url == "theURL" || login == "theLogin" || passcode == "thePasscode"){
                console.log("Go to StompSocket.js and change the url, login, and password to what they should be if you want to read xml messages from a real environment")
                simulation.run();
                return;
            }
            var messageCount = 0;
            var parser;
            var xmlDoc;
            parser = new DOMParser();
			
			/*******************************************************************
			Need to remove the StompJs from this line.  No longer needed.
			*******************************************/
            client = Stomp.client(url);


            // this allows to display debug logs directly on the web page
            client.debug = function (str) {
                console.log(str);
            };

            // the client is notified when it is connected to the server. 
            client.connect(login, passcode, function (frame) {
                client.debug("connected to Stomp");
                client.subscribe("topic/aba.CompositeTrackList", function (message) {

                    /*
                    * Need to change text to application.
                    * Not sure why but I believe that it is due to the fact that this is a message and not normal text
                    */
                    xmlDoc = parser.parseFromString(message.body, "application/xml");
                    var text = "";

                    /*
                    * This is the only way I was able to get the program to look for the tags.
                    * My best guess is due to the ns3 that is in the tag.
                    */
                    var children = xmlDoc.getElementsByTageNameNS("*", "track")[0].childNodes;

                    /*
                    * The following will print out the children and their text nodes for the track.
                    */
                    for(i=0; i < children.length; i++){
                        if(child[i].nodeType == 1)
                        {
                            text += child[i].nodeName + " : " + child[i].textContent + "\n";
                        }
                    }
                    console.log(text);

                    data_bus.receive_xml_message(children,"CompositeTrackList")
                    messageCount++;

                    if(messageCount % 100 == 0){
                        console.log(messageCount)
                    }
                });
                client.subscribe("topic/aba.OnboardAcousticContact", function (message) {

                    /*
                    * Need to change text to application.
                    * Not sure why but I believe that it is due to the fact that this is a message and not normal text
                    */
                    xmlDoc = parser.parseFromString(message.body, "application/xml");
                    var text = "";

                    /*
                    * This is the only way I was able to get the program to look for the tags.
                    * My best guess is due to the ns3 that is in the tag.
                    */
                    var children = xmlDoc.getElementsByTageNameNS("*", "track")[0].childNodes;

                    /*
                    * The following will print out the children and their text nodes for the track.
                    */
                    for (i = 0; i < children.length; i++) {
                        if (child[i].nodeType == 1) {
                            text += child[i].nodeName + " : " + child[i].textContent + "\n";
                        }
                    }
                    console.log(text);

                    data_bus.receive_xml_message(children, "OnboardAcousticContact")
                    messageCount++;

                    if (messageCount % 100 == 0) {
                        console.log(messageCount)
                    }
                });

                client.subscribe("topic/aba.AcousticMASSonobuoyPosition", function (message) {

                    /*
                    * Need to change text to application.
                    * Not sure why but I believe that it is due to the fact that this is a message and not normal text
                    */
                    xmlDoc = parser.parseFromString(message.body, "application/xml");
                    var text = "";

                    /*
                    * This is the only way I was able to get the program to look for the tags.
                    * My best guess is due to the ns3 that is in the tag.
                    */
                    var children = xmlDoc.getElementsByTageNameNS("*", "track")[0].childNodes;

                    /*
                    * The following will print out the children and their text nodes for the track.
                    */
                    for (i = 0; i < children.length; i++) {
                        if (child[i].nodeType == 1) {
                            text += child[i].nodeName + " : " + child[i].textContent + "\n";
                        }
                    }
                    console.log(text);

                    data_bus.receive_xml_message(children, "AcousticMASSonobuoyPosition")
                    messageCount++;

                    if (messageCount % 100 == 0) {
                        console.log(messageCount)
                    }
                });

                client.subscribe("topic/aba.AreaList", function (message) {

                    /*
                    * Need to change text to application.
                    * Not sure why but I believe that it is due to the fact that this is a message and not normal text
                    */
                    xmlDoc = parser.parseFromString(message.body, "application/xml");
                    var text = "";

                    /*
                    * This is the only way I was able to get the program to look for the tags.
                    * My best guess is due to the ns3 that is in the tag.
                    */
                    var children = xmlDoc.getElementsByTageNameNS("*", "track")[0].childNodes;

                    /*
                    * The following will print out the children and their text nodes for the track.
                    */
                    for (i = 0; i < children.length; i++) {
                        if (child[i].nodeType == 1) {
                            text += child[i].nodeName + " : " + child[i].textContent + "\n";
                        }
                    }
                    console.log(text);

                    data_bus.receive_xml_message(children, "AreaList")
                    messageCount++;

                    if (messageCount % 100 == 0) {
                        console.log(messageCount)
                    }
                });
            });
            return false;
        };

        connectStomp();

    } else {
        console.log(`\
            <h1>Get a new Web Browser!</h1>\
            <p>\
            Your browser does not support WebSockets.\
            </p>\
        `);
    }
});

		    //parser = new DOMParser();
		    //xmlDoc = parser.parseFromString(lastMessage, "text/xml")

			//document.getElementById("messageCounter").innerHTML = xmlDoc.getElementsByTagName("numSatellites")[0].childNodes[0].nodeValue;
