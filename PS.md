### Objectives of `EthPhoto`
You need to build up a photo sharing app where people can share photos in a social community. The features of this app will be as follows. 
- The photos would be geo-tagged. That means the publisher of a photo also mentions the location where the photo has been taken and the topic of that photo (like flower, market, nature etc.). There can be a fixed set of topics. During the photo upload, EthPhoto will ask for the topic, and the user needs to enter it.  
- The front-end of the application is a map (you may use OpenStreet Map), on which every users can see the photos that have been uploaded to EthPhoto. If I go to a specific location, I should be able to see all the photos tagged with that location. 
- Apart from the location based photo tagging, a user can also browse the photo based on topics. Once a user clicks on a photo, the DApp also shows the location information tagged with that photo. 
- Only the publisher (the user who has uploaded the photo) of a photo can delete that photo.  

### Submission Instructions 
You need to submit following files. 
- Properly documented source code. 
- A software design document mentioning the followings:
    - Software Requirement Specifications, 
    - High level design with data flow and control flow diagrams, 
    - Detailed design with class diagrams and relations
    - Test cases and test results with sample screenshots
- A `README.md` file mentioning the following, 
    - Required packages to run the software
    - Instructions to build the software
    - Instructions to install the software
    - Instructions to run the software

### Additional Inputs
You can use your preferred platform (OS) for developing the application. Mention the platform that you have used (in the README file).
It is fine if you DApp is platform specific, however additional credit may be given if you can make it platform independent. 

### Useful Resources
- [Ethereum](https://ethereum.org/) is a blockchain based platform that helps in building decentralized apps (called DApps), where there is no centralized server and multiple users participate in the process through the blockchain platform. Blockchain is a hash-chain based data structure to store data at various stakeholders in a replicated format, and any user can check the validity of the data through a crypto-consensus mechanism. Blockchain was the popular platform behind the development of Bitcoin, the most popular crypto-currency available today. A nice tutorial on Blockchain is available [here](https://www.ibm.com/developerworks/cloud/library/cl-blockchain-basics-intro-bluemix-trs/). With the success of Blockchain technology, people are now interested to develop various applications over the Blockchain platform, and multiple open source projects came out of that. Ethereum is one such project that provides a platform to develop Blockchain based applications, which are decentralized. As mentioned earlier, for such applications, there is no central database to store the data, rather the data is replicated to all the participants in the form of Blockchain, that ensures validity of data in spite of having malicious users among the participants. [Here](http://dapps.ethercasts.com/), you can get a list of projects built on top of the Ethereum platform. 
- https://dappsforbeginners.wordpress.com/tutorials/your-first-dapp/
- https://medium.com/@ConsenSys/a-101-noob-intro-to-programming-smart-contracts-on-ethereum-695d15c1dab4#.pfhtbq9c5 
