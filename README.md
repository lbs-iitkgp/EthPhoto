# EthPhoto

### About EthPhoto

EthPhoto is a DApp to fulfill the requirement of a non-centralized server web-app, which is built using Ethereum. Ethereum is a blockchain based platform that helps in building decentralized apps, where there is no centralized server and multiple users participate in the process through the blockchain platform. 

Instead of having central database to store data, this App has the data which is replicated to all the participants in the form of Blockchain, that ensures validity of data in spite of having malicious users among the participants. The files are stored using a unique fingerprint (the cryptographic hash of their content) which also solves the problem of data duplication across the network.

Built by Team 03, for the inter-hall event "Opensoft" of IIT Kharagpur.

### Requirements

- An Operating System such as Linux / Mac / Windows
- Atleast 4MB of free disk-space
- A web browser such as Chrome / Firefox / Opera / Safari

### Installation Guide(s)

Install the most recent versions of each of the below listed softwares -

- `node` and `npm` : Install `nodejs` for your platform, by following [this](https://nodejs.org/en/download/current/) link.
- `IPFS` : Install `IPFS`, by following [this](https://ipfs.io/docs/install/) download link.
- `python` : Install `python` from [here](https://www.python.org/downloads/)
- `Solidity` : Follow the installation procedure specified in [this](https://solidity.readthedocs.io/en/develop/installing-solidity.html) link
- `geth` : Follow the platform-specific installation procedure of `geth` for your respective platform, from [this](https://www.ethereum.org/cli) link.
- `Python module "Pillow"` : Install the `"Pillow"` module of Python, by following the guide given in [this](http://pillow.readthedocs.io/en/3.0.x/installation.html) link.
- `Node app dependencies` : To install all the dependencies of this node App, run `npm install` on your terminal. Have a look at the `packages.json` file to go through all the dependencies.

You're all set to run the DApp now!  :tada:

### Building the DApp : EthPhoto

Run `./setup.sh -s` on your terminal from the root directory of the `EthPhoto` DApp.

### Running the DApp : EthPhoto

Run `node server.js` on your terminal to serve the `nodejs` web-app.

Access `localhost:5000` on your web browser, to see the working DApp `EthPhoto`. :tada: 

### License

Licensed under the terms of the ISC License.