# Design patterns decisions

## Circuit Breaker (emergency stop)

The SmartNameRegistry and SmartNameService contracts implement a Circuit Breaker design pattern to manage their lifecycle. They use the Pausable.sol contract provided by OpenZeppelin: 
https://docs.openzeppelin.com/contracts/2.x/api/lifecycle

## Restricting access

The access and operations on contracts are restricted : 
- SmartName can only be managed by its primary account (the one that ceated it, SmartNameRegistry) 
- Only the administrator (owner) of a SmartName can manage it using SmartNameRegistry
- Smart Names must be unlocked to be managed by a service

The SmartName contract uses the Secondary.sol contract provided by OpenZeppelin: 
https://docs.openzeppelin.com/contracts/2.x/api/ownership

## Pull over oush payments

In order to prevent a Denial of Service or Re-entrency attakcs, contracts use Withrawal design pattern. Payments are realized using the PullPaiement contract provided by OpenZeppelin: 
https://docs.openzeppelin.com/contracts/2.x/api/payment#PullPayment

## Fail early and fail loud 

For each methods, the conditions are checked as soon as possible with 'require()'.

## Mortal

Mortal design pattern is used in the same way as Circuit Breaker design pattern to manage the lifecycle of the contracts.

## Upgradable

The application is developed to be upgradable. Services contracts can be created inheriting the SmartNameService contract (like SmartNameResolver, SmartNameBanking and SmartNameMarket). Facade design pattern is used.
