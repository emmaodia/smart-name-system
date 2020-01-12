# Avoiding common attacks

## Optimizing Gas

To optimize the gas, so the cost of use, the contracts not use loop and work with fixed size bytes arrays.

## Pull Payment strategy

Pull payment strategy is used to avoiding re-entrency attacks and denial of service. It's implemented with the PullPayment.sol contract provided by OpenZeppelin: 
https://docs.openzeppelin.com/contracts/2.x/api/payment#PullPayment

## No timestamp dependance

The contracts not use timestamp conditions in these transactions. 

## Integer overflow / underflow 

Integer parameters provided by users are checked in all methods to control the value. 

## Lifecycle control

The lifecycle of contracts is managed using Pausable.sol contract provided by OpenZeppelin: 
https://docs.openzeppelin.com/contracts/2.x/api/lifecycle
Contracts can be stopped or destructed.

## Access control

The access and operations on contracts are restricted : 
- SmartName can only be managed by its primary account (the one that ceated it, SmartNameRegistry) 
- Only the administrator (owner) of a SmartName can manage it using SmartNameRegistry
- Smart Names must be unlocked to be managed by a service

The SmartName contract uses the Secondary.sol contract provided by OpenZeppelin: 
https://docs.openzeppelin.com/contracts/2.x/api/ownership
