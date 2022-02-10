# hardhat-framework
 
This package helps configuring a repo for hardhat development the Boring way. This is very opinionated :)

### Creating a new project
We will do this using the yarn package manager, starting with:

`yarn init`
`yarn add --dev boringcrypto/hardhat-framework`
`yarn boring init`

### Setting up your .env
You can include your environment variables in a `.env` file in the root of your repo. Alternatively you can set an actual environment variable called `DOTENV_PATH` to point to a central `.env` file to be used. This way you can use the same environment settings accross multiple projects.

Some useful settings:
```
ALCHEMY_API_KEY=
COINMARKETCAP_API_KEY=
HARDHAT_NETWORK=hardhat
HARDHAT_MAX_MEMORY=4096
HARDHAT_SHOW_STACK_TRACES=true
HARDHAT_VERBOSE=true
```

### Goals
- Compile solidity contracts
yarn compile
- Run hardhat as ETH mainnet fork
yarn hardhat node

- Create typescript binding for all contracts
automatic on compile

- Run coverage check
yarn hardhat coverage

- Run gas report


- Flatten contracts correctly
- Handle deployments of flattened contract
- Verify on Etherscan
- Auto-run prettier on pre-commit
- Code completion in tests and scripts
- Mainnet forking fixed to the block 6 blocks before the current one

### Recommended VSCode extentions
- solidity - Juan Blanco
- Mocha Test Explorer - Holger Benl
- Vue Language Features (Volar) - Johnson Chu
