const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const web3 = new Web3(ganache.provider())
const { interface, bytecode } = require('../compile')

let accounts, lottery

beforeEach(async () => {
    //get list of accounts
    accounts = await new web3.eth.getAccounts()

    //use an account to deploy contract
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({
            from: accounts[0],
            gas: '1000000'
        })
})

describe('Lottery', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address)
    })
})
