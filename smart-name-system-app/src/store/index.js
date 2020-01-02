import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import getWeb3 from '../util/getWeb3'
import SmartNameRegistry from '../contracts/SmartNameRegistry.json'

Vue.use(Vuex)
export const store = new Vuex.Store({
  strict: false,
  state,
  mutations: {
    registerWeb3Instance (state, payload) {
      console.log('registerWeb3instance Mutation being executed', payload)
      let currentState = payload
      let stateCopy = state

      stateCopy.web3 = currentState.web3

      stateCopy.accounts = currentState.accounts
      stateCopy.coinbase = currentState.coinbase
      stateCopy.balance = currentState.balance

      stateCopy.contract = currentState.contract
      stateCopy.networkId = currentState.networkId

      stateCopy.smartNameRegistry = currentState.smartNameRegistry

      state = stateCopy
    }
  },
  actions: {
    async registerWeb3 ({ commit }) {
      console.log('registerWeb3 Action being executed')
      const web3 = await getWeb3()
      let currentState = {}
      currentState.web3 = web3

      currentState.accounts = await web3.eth.getAccounts()
      currentState.coinbase = await web3.eth.getCoinbase()
      currentState.balance = await web3.eth.getBalance(currentState.coinbase)

      currentState.contract = null
      currentState.networkId = await web3.eth.net.getId()

      // Get the contract instance.
      const deployedNetwork = SmartNameRegistry.networks[currentState.networkId]
      currentState.smartNameRegistry = new web3.eth.Contract(
        SmartNameRegistry.abi,
        deployedNetwork && deployedNetwork.address
      )
      commit('registerWeb3Instance', currentState)
    }
  }
})
