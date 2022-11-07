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
    /// @param creationTimestamp Time when it was created
    /// @param lastRewardTimestamp Timestamp based on which rewards are calculated
    /// @param claimedRewards Rewards that have been claimed
    struct Stake {
        uint256 amount;
        uint256 creationTimestamp;
        uint256 lastRewardTimestamp;
        uint256 claimedRewards;
    }

    /// @notice The frequency with which you can claim rewards
    uint256 public immutable CLAIM_REWARDS_DELAY;

    /// @notice Time after which it will be possible to unlock funds
    uint256 public immutable WITHDRAW_DELAY;

    /// @notice The frequency with which rewards are awarded
    uint256 public immutable REWARD_PERIOD;

    /// @notice The percentage of rewards from the deposit, calculated based on REWARD_DENOMINATOR
    uint256 public immutable REWARD_RATE_PER_PERIOD;

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
    constructor(
        uint256 _initialSupply,
        uint256 _claimRewardsDelay,
        uint256 _withdrawDelay,
        uint256 _rewardPeriod,
        uint256 _rewardRatePerPeriod
    ) ERC20("MyTestCoin", "MTC") {
        CLAIM_REWARDS_DELAY = _claimRewardsDelay;
        WITHDRAW_DELAY = _withdrawDelay;
        REWARD_PERIOD = _rewardPeriod;

        require(_rewardRatePerPeriod <= REWARD_DENOMINATOR, "_rewardRatePerPeriod > REWARD_DENOMINATOR");

        REWARD_RATE_PER_PERIOD = _rewardRatePerPeriod;

        _mint(msg.sender, _initialSupply);
    }

    /// @param _amount Amount of tokens to stake
    function stake(uint256 _amount) external {
        require(_amount > 0, "Amount can not be zero");
        require(balanceOf(msg.sender) >= _amount, "Not enough balance");
        require(stakeByUser[msg.sender].amount == 0, "Can't staked with an existing stake");

        _transfer(msg.sender, address(this), _amount);

        Stake memory userStake = Stake({
            amount: _amount,
            creationTimestamp: block.timestamp,
            lastRewardTimestamp: 0,
            claimedRewards: 0
        });

        stakeByUser[msg.sender] = userStake;

        emit Staked(msg.sender, userStake);
    }

    /// @notice External function. Gets the amount of rewards that _staker can get right now
    /// @param _staker Staker address
    /// @return Amount of rewards that can be claimed
    function rewards(address _staker) external view returns (uint256) {
        Stake memory userStake = stakeByUser[_staker];
        return _calculateRewards(userStake);
    }

    /// @notice Calculates the amount of rewards that can be received right now, and also saves unused time
    /// @param _stake Stake for which to calculate
    /// @return Amount of rewards that can be claimed
    function _calculateRewards(Stake memory _stake) internal view returns (uint256) {
        require(
            block.timestamp >= _stake.creationTimestamp,
            "Cannot calculate rewards for a stake created in the future"
        );

        // If user not has stake, allStakedPeriods = very big, but this is reset by multiplying by amount 0, from rewardPerPeriod
        uint256 allStakedPeriods = (block.timestamp - _stake.creationTimestamp) / REWARD_PERIOD;

        uint256 rewardPerPeriod = (_stake.amount * REWARD_RATE_PER_PERIOD) / REWARD_DENOMINATOR;

        uint256 allRewards = allStakedPeriods * rewardPerPeriod;

        // _stake.claimedRewards always <= allRewards
        return allRewards - _stake.claimedRewards;
    }

    function claimRewards() external {
        Stake memory userStake = stakeByUser[msg.sender];

        require(userStake.amount > 0, "Can't claim rewards without a stake");

        require(
            block.timestamp - userStake.lastRewardTimestamp >= CLAIM_REWARDS_DELAY,
            "Claim rewards period has not ended"
        );

        uint256 rewardsAmount = _calculateRewards(userStake);

        require(rewardsAmount > 0, "Rewards amount = 0");

        stakeByUser[msg.sender].lastRewardTimestamp = block.timestamp;
        stakeByUser[msg.sender].claimedRewards = userStake.claimedRewards + rewardsAmount;

        _mint(msg.sender, rewardsAmount);

        emit Rewarded(msg.sender, rewardsAmount);
    }

    function withdraw() external {
        Stake memory userStake = stakeByUser[msg.sender];

        require(userStake.amount > 0, "Can't withdraw without a stake");
        require(block.timestamp >= userStake.creationTimestamp + WITHDRAW_DELAY, "Blocking period has not expired");

        uint256 rewardsAmount = _calculateRewards(userStake);
        if(rewardsAmount > 0) {
            _mint(msg.sender, rewardsAmount);
        }

        delete stakeByUser[msg.sender];

        _transfer(address(this), msg.sender, userStake.amount);

        emit Withdrawed(msg.sender, userStake.amount);
    }
}
