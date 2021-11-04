#Instructions
1. If you are in an environment with messages coming in, edit src/data/StompSocket.js with username/password/url 
2. If you are not in a messaging environment, simulation.run() should be executed. If nothing is happening run simulation.run() at the console to start simulation 
3. Manual, subsurface gen tracks should populate on the TSD 
4. Manual DIFAR bearings should populate on the TSD 
5. DIFAR buoys should populate on the TSD 
6. If all is going well, a heatmap should display after 3 bearings are received from a single buoy in contact 
7. There are a lot of logs in the console that are looking at timings and what we will eventually alert to the user. There should be a near continous stream of data. 
8. There are timings in the console (miliseconds) for how long it is taking to calculate/render things. Our dev environment showed everything under 35 miliseconds. If that is dramatically higher we could have issues. 
