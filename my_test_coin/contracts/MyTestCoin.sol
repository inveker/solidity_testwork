// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ERC20 token with staking function 
/// @notice A token whose initial supply to be minted by the deployer. 
/// Has no owner.
/// Holders can stake their tokens. 
/// Only single staking is supported, i.e. you cannot stake again with a not withdrawn deposit
/// All staked tokens are stored on the balance of this contract
/// With a staked deposit, users can withdraw rewards, and withdraw their funds after the blocking period has expired
/// @dev Many decisions are made based on simplicity rather than functionality.
contract MyTestCoin is ERC20 {
    /// @notice Structure describing staked deposit
    /// @param amount Number of blocked funds
    /// @param lastRewardTimestamp Timestamp based on which rewards are calculated
    /// @param withdrawTimestamp The time when it will be possible to withdraw the blocked funds
    struct Stake {
        uint256 amount;
        uint256 lastRewardTimestamp;
        uint256 withdrawTimestamp;
    }

    /// @notice The frequency with which you can claim rewards
    uint256 public constant CLAIM_REWARDS_DELAY = 1 hours;

    /// @notice Time after which it will be possible to unlock funds
    uint256 public constant WITHDRAW_DELAY = 1 days;

    /// @notice The frequency with which rewards are awarded
    uint256 public constant REWARD_PERIOD = 1 hours;

    /// @notice The percentage of rewards from the deposit, calculated based on REWARD_DENOMINATOR
    uint256 public constant REWARD_RATE_PER_PERIOD = 1000; // 10%

    /// @notice Basis for calculating the percentage of awards. Min 1 = 0.01%, Max 10000 = 100% rewards
    uint256 public constant REWARD_DENOMINATOR = 10000; 

    /// @notice Staked deposits at staker address
    mapping(address => Stake) public stakeByUser;

    /// @notice Event triggered when adding a new stake deposit
    event Staked(address indexed staker, Stake stake);

    /// @notice Event triggered when claiming rewards
    event Rewarded(address indexed staker, uint256 rewardsAmount);

    /// @notice Event triggered when withdraw staked deposit
    event Withdrawed(address indexed staker, uint256 amount);

    /// @param _initialSupply How many tokens will be minted to the deployer
    constructor(uint256 _initialSupply) ERC20("MyTestCoin", "MTC") {
        _mint(msg.sender, _initialSupply);
    }

    /// @param _amount Amount of tokens to stake
    function stake(uint256 _amount) external {
        require(_amount > 0, "Amount can not be zero");
        require(balanceOf(msg.sender) >= _amount, "Not enough balance");

        _transfer(msg.sender, address(this), _amount);

        Stake memory userStake = Stake({
            amount: _amount,
            lastRewardTimestamp: block.timestamp,
            withdrawTimestamp: block.timestamp + WITHDRAW_DELAY
        });

        stakeByUser[msg.sender] = userStake;

        emit Staked(msg.sender, userStake);
    }

    /// @notice External function. Gets the amount of rewards that _staker can get right now
    /// @param _staker Staker address
    /// @return rewardsAmount_ Amount of rewards that can be claimed
    function rewards(address _staker) external view returns (uint256 rewardsAmount_) {
        Stake memory userStake = stakeByUser[_staker];
        (rewardsAmount_, ) = _calculateRewards(userStake.amount, userStake.lastRewardTimestamp);
    }

    /// @notice Calculates the amount of rewards that can be received right now, and also saves unused time
    /// @param _amount  Staked tokens amount
    /// @param _lastRewardTimestamp  Time since last award claim
    /// @return rewardsAmount_ Amount of rewards that can be claimed
    /// @return restOfTime_ The time that was not taken into account in the calculation is saved in order to save the user's funds
    function _calculateRewards(uint256 _amount, uint256 _lastRewardTimestamp)
        internal
        view
        returns (uint256 rewardsAmount_, uint256 restOfTime_)
    {
        // There might be a type overflow here if _lastRewardTimestamp > block.timestamp
        // Implemented parts of the system call this function with reliable parameters,
        // the check is omitted for the purpose of optimization
        uint256 stakedSeconds = block.timestamp - _lastRewardTimestamp;

        uint256 stakedPeriods = (stakedSeconds) / REWARD_PERIOD;

        uint256 rewardPerPeriod = (_amount * REWARD_RATE_PER_PERIOD) / REWARD_DENOMINATOR;

        rewardsAmount_ = stakedPeriods * rewardPerPeriod;
        restOfTime_ = stakedSeconds - stakedPeriods * REWARD_PERIOD;
    }

    function claimRewards() external {
        Stake memory userStake = stakeByUser[msg.sender];

        require(
            block.timestamp - userStake.lastRewardTimestamp >= CLAIM_REWARDS_DELAY,
            "Claim rewards period has not ended"
        );

        (uint256 rewardsAmount, uint256 restOfTime) = _calculateRewards(
            userStake.amount,
            userStake.lastRewardTimestamp
        );

        require(rewardsAmount > 0, "Rewards amount = 0");

        stakeByUser[msg.sender].lastRewardTimestamp = block.timestamp - restOfTime;

        _mint(msg.sender, rewardsAmount);

        emit Rewarded(msg.sender, rewardsAmount);
    }

    function withdraw() external {
        Stake memory userStake = stakeByUser[msg.sender];

        require(userStake.amount > 0, "Not has staked deposit");
        require(block.timestamp >= userStake.withdrawTimestamp , "Blocking period has not expired");

        delete stakeByUser[msg.sender];

        _transfer(address(this), msg.sender, userStake.amount);

        emit Withdrawed(msg.sender, userStake.amount);
    }
}
