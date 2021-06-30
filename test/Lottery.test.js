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

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        })

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.strictEqual(accounts[0], players[0])
        assert.strictEqual(1, players.length)
    })

    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        })
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        })
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        })

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.strictEqual(accounts[0], players[0])
        assert.strictEqual(accounts[1], players[1])
        assert.strictEqual(accounts[2], players[2])
        assert.strictEqual(3, players.length)
    })

    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            })
            assert(false)
        } catch (error) {
            assert(error)
        }
    })

    it('only allows manager to pick winner', async () => {
        try {
            await lottery.methods.pickWinner.send({
                from: accounts[1]
            })
            assert(false)
        } catch (error) {
            assert(error)
        }
    })

    it('sends money to winner & resets players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('1', 'ether')
        })

        const initialBalance = await web3.eth.getBalance(accounts[0])
        await lottery.methods.pickWinner().send({ from: accounts[0] })
        const finalBalance = await web3.eth.getBalance(accounts[0])
        const players = await lottery.methods.getPlayers().call()

        assert(finalBalance > initialBalance)
        assert(players.length == 0)
    })
})
