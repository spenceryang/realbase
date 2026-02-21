// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RealBaseOracle
 * @notice Onchain neighborhood score oracle for San Francisco.
 *         Other contracts pay to query neighborhood composite scores.
 *         Only the agent wallet can update scores.
 */
contract RealBaseOracle is Ownable {
    // zipcode (as uint32) => composite score (0-100, stored as uint8)
    mapping(uint32 => uint8) public scores;

    // zipcode => last update timestamp
    mapping(uint32 => uint256) public lastUpdated;

    // Fee to query a score
    uint256 public queryFee = 0.0001 ether;

    // Total queries served
    uint256 public totalQueries;

    // Total revenue earned
    uint256 public totalRevenue;

    // Agent address (can update scores)
    address public agent;

    event ScoresUpdated(uint256 timestamp, uint256 count);
    event ScoreQueried(uint32 indexed zipcode, address indexed querier, uint256 fee);
    event QueryFeeUpdated(uint256 oldFee, uint256 newFee);
    event AgentUpdated(address oldAgent, address newAgent);

    modifier onlyAgent() {
        require(msg.sender == agent || msg.sender == owner(), "Not agent");
        _;
    }

    constructor(address _agent) Ownable(msg.sender) {
        agent = _agent;
    }

    /**
     * @notice Batch update neighborhood scores. Only callable by agent.
     * @param zipcodes Array of SF zipcodes (e.g., 94110)
     * @param _scores Array of composite scores (0-100)
     */
    function updateScores(
        uint32[] calldata zipcodes,
        uint8[] calldata _scores
    ) external onlyAgent {
        require(zipcodes.length == _scores.length, "Length mismatch");
        require(zipcodes.length <= 50, "Max 50 per batch");

        for (uint256 i = 0; i < zipcodes.length; i++) {
            require(_scores[i] <= 100, "Score must be 0-100");
            scores[zipcodes[i]] = _scores[i];
            lastUpdated[zipcodes[i]] = block.timestamp;
        }

        emit ScoresUpdated(block.timestamp, zipcodes.length);
    }

    /**
     * @notice Query a neighborhood score. Requires payment of queryFee.
     * @param zipcode SF zipcode to query
     * @return score Composite score (0-100)
     * @return updatedAt Last update timestamp
     */
    function getScore(uint32 zipcode)
        external
        payable
        returns (uint8 score, uint256 updatedAt)
    {
        require(msg.value >= queryFee, "Insufficient fee");

        totalQueries++;
        totalRevenue += msg.value;

        emit ScoreQueried(zipcode, msg.sender, msg.value);

        return (scores[zipcode], lastUpdated[zipcode]);
    }

    /**
     * @notice Get a score without paying (view only, for dashboard).
     */
    function getScoreFree(uint32 zipcode)
        external
        view
        returns (uint8 score, uint256 updatedAt)
    {
        return (scores[zipcode], lastUpdated[zipcode]);
    }

    /**
     * @notice Update the query fee. Only owner.
     */
    function setQueryFee(uint256 _fee) external onlyOwner {
        emit QueryFeeUpdated(queryFee, _fee);
        queryFee = _fee;
    }

    /**
     * @notice Update the agent address. Only owner.
     */
    function setAgent(address _agent) external onlyOwner {
        emit AgentUpdated(agent, _agent);
        agent = _agent;
    }

    /**
     * @notice Withdraw accumulated fees. Only owner.
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        payable(owner()).transfer(balance);
    }

    /**
     * @notice Get oracle stats.
     */
    function getStats()
        external
        view
        returns (
            uint256 _totalQueries,
            uint256 _totalRevenue,
            uint256 _queryFee,
            uint256 _balance
        )
    {
        return (totalQueries, totalRevenue, queryFee, address(this).balance);
    }
}
