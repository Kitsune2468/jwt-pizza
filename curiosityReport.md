# DevOps in Video Game Development

## Error Logs and Error Codes
Error logs and error codes for many games are very important, especially those that don't connect to a server and and operate only on the client. Because they don't connect to a server (and even games that do), error logs and error codes are used to allow players to report errors to the developers, as the developers won't know when something goes wrong. Error codes makes sharing errors easy for the players, and allow developers to pinpoint where the errors occured. Error logs then can be shared to provide the developers with more specific feedback on how the bugs happened.

## Monitoring/Logging
For games that connect to servers, monitoring and logging tools are used similar to how we used Grafana for JWT Pizza. Things like latency and response time are incredibly important, and servers need to responed much faster than is neccessary for a website or other systems. (While this isn't neccessarily under monitoring/logging,) latency is used to provide better matchmaking and determining what servers the client should connect to. I'm sure this is the same as what AWS and other systems do as well.

## Pipeline Automation
I found it really interesting that pipelines are still used in videogame development! Looking at it now, it makes sense. It's also really interesting that pipelines are able to integrate systems like Unity and Unreal Engine similar to what we did during the course with AWS and Docker, and spin up containers that can test the games using the engines.

## Scaling
Just like we did in the scalable deployment deliverable, scaling is a vital aspect of online games. Servers need to be spun up and shut down as the playerbase changes. Many games also run into issues on launch days or major updates, as the large spike in players can overwhelm their available servers. 

## Fun Fact
Some developers create automated tests using enemy AI to control the player! 