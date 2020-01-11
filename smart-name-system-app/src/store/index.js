import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import getWeb3 from '../util/getWeb3'
import SmartNameRegistry from '../../../smart-name-system-contracts/build/contracts/SmartNameRegistry.json'
import SmartNameResolver from '../../../smart-name-system-contracts/build/contracts/SmartNameResolver.json'
import SmartNameBanking from '../../../smart-name-system-contracts/build/contracts/SmartNameBanking.json'
import SmartNameMarket from '../../../smart-name-system-contracts/build/contracts/SmartNameMarket.json'
import SmartNameLibrary from '../../../smart-name-system-contracts/build/contracts/SmartNameLibrary.json'

Vue.use(Vuex)
export const store = new Vuex.Store({
  strict: false,
  state,
  mutations: {
    registerWeb3Instance (state, payload) {
      let currentState = payload
      let stateCopy = state

      stateCopy.web3 = currentState.web3

      stateCopy.accounts = currentState.accounts
      stateCopy.coinbase = currentState.coinbase
      stateCopy.balance = currentState.balance

      stateCopy.contract = currentState.contract
      stateCopy.networkId = currentState.networkId

      stateCopy.unlocker = currentState.unlocker

      stateCopy.smartNameRegistry = currentState.smartNameRegistry
      stateCopy.smartNameResolver = currentState.smartNameResolver
      stateCopy.smartNameBanking = currentState.smartNameBanking
      stateCopy.smartNameMarket = currentState.smartNameMarket
      stateCopy.smartNameLibrary = currentState.smartNameLibrary

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

      // Registry
      let deployedNetwork = SmartNameRegistry.networks[currentState.networkId]
      currentState.smartNameRegistry = new web3.eth.Contract(
        SmartNameRegistry.abi,
        deployedNetwork && deployedNetwork.address
      )
      // Resolver
      deployedNetwork = SmartNameResolver.networks[currentState.networkId]
      currentState.smartNameResolver = new web3.eth.Contract(
        SmartNameResolver.abi,
        deployedNetwork && deployedNetwork.address
      )
      // Banking
      deployedNetwork = SmartNameBanking.networks[currentState.networkId]
      currentState.smartNameBanking = new web3.eth.Contract(
        SmartNameBanking.abi,
        deployedNetwork && deployedNetwork.address
      )
      // Market
      deployedNetwork = SmartNameMarket.networks[currentState.networkId]
      currentState.smartNameMarket = new web3.eth.Contract(
        SmartNameMarket.abi,
        deployedNetwork && deployedNetwork.address
      )
      // Library
      deployedNetwork = SmartNameLibrary.networks[currentState.networkId]
      currentState.smartNameLibrary = new web3.eth.Contract(
        SmartNameLibrary.abi,
        deployedNetwork && deployedNetwork.address
      )

      commit('registerWeb3Instance', currentState)
    }
  }
})
